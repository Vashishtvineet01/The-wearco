import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_item.dart';
import '../models/order.dart';
import '../models/product.dart';
import 'api_client.dart';

/// All active products.
final productsProvider = FutureProvider<List<Product>>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final res = await dio.get('/products');
    final list = (res.data['products'] as List? ?? [])
        .map((p) => Product.fromJson((p as Map).cast<String, dynamic>()))
        .toList();
    return list;
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
});

/// One product by slug.
final productBySlugProvider =
    FutureProvider.family<Product, String>((ref, slug) async {
  final dio = ref.watch(dioProvider);
  try {
    final res = await dio.get('/products/$slug');
    return Product.fromJson(
      (res.data['product'] as Map).cast<String, dynamic>(),
    );
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
});

/// POST an order. Returns the server-assigned order number + total.
class OrderApi {
  OrderApi(this._dio);
  final Dio _dio;

  Future<CreatedOrder> placeOrder({
    required String email,
    required String name,
    required String phone,
    String? gst,
    required String paymentMethod,
    required Map<String, String> address,
    required List<CartItem> items,
  }) async {
    try {
      final res = await _dio.post(
        '/orders',
        data: {
          'email': email,
          'name': name,
          'phone': phone,
          'gst': gst,
          'paymentMethod': paymentMethod,
          'address': address,
          'items': items
              .map((i) => {
                    'slug': i.slug,
                    'name': i.name,
                    'price': i.price,
                    'qty': i.qty,
                    'size': i.size,
                    'color': i.color,
                  })
              .toList(),
        },
      );
      return CreatedOrder.fromJson(
        (res.data as Map).cast<String, dynamic>(),
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch a previously-placed order by its public order number.
  /// Used by the Account tab for guest order lookups.
  Future<OrderPublic> getByNumber(String orderNumber) async {
    try {
      final res = await _dio.get('/orders/$orderNumber');
      return OrderPublic.fromJson(
        (res.data['order'] as Map).cast<String, dynamic>(),
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

final orderApiProvider = Provider<OrderApi>((ref) {
  return OrderApi(ref.watch(dioProvider));
});

/// Health probe for the connection screen / splash.
final healthProvider = FutureProvider<bool>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final res = await dio.get('/health');
    return res.data['ok'] == true;
  } catch (_) {
    return false;
  }
});
