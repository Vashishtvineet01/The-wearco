import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/env.dart';

/// `DEMO_BASE_URL` is a sentinel used instead of a real HTTP URL. When the
/// Dio base URL matches this exactly, requests are intercepted and served
/// from bundled assets + local SharedPreferences instead of the network.
///
/// This lets a tester install the APK anywhere, with no internet, and still
/// walk the full shop → cart → checkout → order-lookup flow end to end.
const String demoBaseUrl = 'demo://local';

/// True if `url` is pointing at the bundled demo backend.
bool isDemo(String url) => url == demoBaseUrl || url.startsWith('demo://');

/// Dio interceptor that short-circuits HTTP for demo mode.
///
/// Supported endpoints (all under the virtual host `demo://local/api/v1`):
///   GET  /health
///   GET  /products
///   GET  /products/:slug
///   POST /orders
///   GET  /orders/:orderNumber
///   POST /bulk/quote
class DemoInterceptor extends Interceptor {
  DemoInterceptor();

  List<Map<String, dynamic>>? _productsCache;

  Future<List<Map<String, dynamic>>> _products() async {
    if (_productsCache != null) return _productsCache!;
    final raw = await rootBundle.loadString('assets/data/products.json');
    final decoded = jsonDecode(raw);
    final list = (decoded is Map && decoded['products'] is List)
        ? (decoded['products'] as List)
        : (decoded is List ? decoded : const []);
    _productsCache = list
        .map((e) => (e as Map).cast<String, dynamic>())
        .toList(growable: false);
    return _productsCache!;
  }

  @override
  Future<void> onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    // Decide based on the live Env, not options.baseUrl — the main Dio
    // interceptor rewrites baseUrl from Env on every request, but we need
    // to decide BEFORE that interceptor runs.
    if (!Env.isDemoMode) {
      handler.next(options);
      return;
    }

    // Everything below is served locally. Add a tiny latency so the UI
    // doesn't feel suspiciously instant and existing loading shimmers still
    // flash briefly.
    await Future<void>.delayed(const Duration(milliseconds: 180));

    try {
      final path = _normalisePath(options.path);
      final method = options.method.toUpperCase();

      if (method == 'GET' && path == '/health') {
        return _respond(options, handler, {
          'ok': true,
          'name': 'TheWearCo (Demo)',
          'version': 'demo',
          'timestamp': DateTime.now().toIso8601String(),
        });
      }

      if (method == 'GET' && path == '/products') {
        final all = await _products();
        return _respond(options, handler, {'products': all});
      }

      final productMatch = RegExp(r'^/products/([^/]+)$').firstMatch(path);
      if (method == 'GET' && productMatch != null) {
        final slug = productMatch.group(1)!;
        final all = await _products();
        final found = all.firstWhere(
          (p) => p['slug'] == slug,
          orElse: () => const {},
        );
        if (found.isEmpty) {
          return _notFound(options, handler, 'Product not found');
        }
        return _respond(options, handler, {'product': found});
      }

      if (method == 'POST' && path == '/orders') {
        final body = _decodeBody(options.data);
        final items = (body['items'] as List? ?? const []);
        final subtotal = items.fold<int>(0, (acc, i) {
          final m = (i as Map).cast<String, dynamic>();
          final p = (m['price'] as num?)?.toInt() ?? 0;
          final q = (m['qty'] as num?)?.toInt() ?? 1;
          return acc + (p * q);
        });
        final shipping = subtotal == 0 ? 0 : (subtotal >= 1499 ? 0 : 99);
        final total = subtotal + shipping;
        final orderNumber = _generateOrderNumber();
        final order = {
          'orderNumber': orderNumber,
          'status': 'pending',
          'paymentMethod': body['paymentMethod'] ?? 'cod',
          'subtotal': subtotal,
          'shipping': shipping,
          'total': total,
          'createdAt': DateTime.now().toIso8601String(),
          'items': items
              .map((i) {
                final m = (i as Map).cast<String, dynamic>();
                return {
                  'name': m['name'],
                  'price': m['price'],
                  'qty': m['qty'],
                  'size': m['size'],
                  'color': m['color'],
                  'productSlug': m['slug'] ?? m['productSlug'],
                };
              })
              .toList(),
        };
        await _saveOrder(order);
        return _respond(options, handler, {
          'orderNumber': orderNumber,
          'orderId': 'demo-$orderNumber',
          'total': total,
        });
      }

      final orderMatch = RegExp(r'^/orders/([^/]+)$').firstMatch(path);
      if (method == 'GET' && orderMatch != null) {
        final n = orderMatch.group(1)!;
        final order = await _loadOrder(n);
        if (order == null) {
          return _notFound(options, handler,
              'Order not found. In demo mode only orders placed on THIS device are visible.');
        }
        return _respond(options, handler, {'order': order});
      }

      if (method == 'POST' && path == '/bulk/quote') {
        return _respond(options, handler, {
          'ok': true,
          'message':
              'Demo: enquiry recorded locally. Nothing is sent to the TheWearCo team.',
        });
      }

      return _notFound(options, handler, 'Demo endpoint not implemented: $method $path');
    } catch (e) {
      return _notFound(options, handler, 'Demo error: $e');
    }
  }

  // ---------------------------------------------------------- helpers
  String _normalisePath(String p) {
    var s = p;
    // Dio already strips the base URL; path should start with '/'.
    if (!s.startsWith('/')) s = '/$s';
    // Strip /api/v1 prefix if present (we route relative to it).
    if (s.startsWith('/api/v1')) s = s.substring(7);
    if (!s.startsWith('/')) s = '/$s';
    // Drop query string.
    final qIdx = s.indexOf('?');
    if (qIdx != -1) s = s.substring(0, qIdx);
    return s;
  }

  Map<String, dynamic> _decodeBody(dynamic data) {
    if (data == null) return <String, dynamic>{};
    if (data is Map) return data.cast<String, dynamic>();
    if (data is String) {
      try {
        final d = jsonDecode(data);
        if (d is Map) return d.cast<String, dynamic>();
      } catch (_) {}
    }
    return <String, dynamic>{};
  }

  void _respond(
    RequestOptions options,
    RequestInterceptorHandler handler,
    Map<String, dynamic> body, {
    int status = 200,
  }) {
    handler.resolve(
      Response(
        requestOptions: options,
        statusCode: status,
        data: body,
      ),
    );
  }

  void _notFound(
    RequestOptions options,
    RequestInterceptorHandler handler,
    String message,
  ) {
    handler.reject(
      DioException(
        requestOptions: options,
        type: DioExceptionType.badResponse,
        response: Response(
          requestOptions: options,
          statusCode: 404,
          data: {'error': message},
        ),
      ),
    );
  }

  String _generateOrderNumber() {
    // Format: TWC-<yyyymmdd>-<4-digit random>
    final now = DateTime.now();
    final y = now.year.toString().padLeft(4, '0');
    final m = now.month.toString().padLeft(2, '0');
    final d = now.day.toString().padLeft(2, '0');
    final rand = Random().nextInt(9000) + 1000;
    return 'TWC-$y$m$d-$rand';
  }

  Future<void> _saveOrder(Map<String, dynamic> order) async {
    final prefs = await SharedPreferences.getInstance();
    final key = 'twc.demo.order.${order['orderNumber']}';
    await prefs.setString(key, jsonEncode(order));
    // also keep an index for debug / "my orders" views later
    final idx = prefs.getStringList('twc.demo.order.index') ?? <String>[];
    idx.add(order['orderNumber'] as String);
    await prefs.setStringList('twc.demo.order.index', idx);
  }

  Future<Map<String, dynamic>?> _loadOrder(String number) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('twc.demo.order.$number');
    if (raw == null) return null;
    try {
      return (jsonDecode(raw) as Map).cast<String, dynamic>();
    } catch (_) {
      return null;
    }
  }
}
