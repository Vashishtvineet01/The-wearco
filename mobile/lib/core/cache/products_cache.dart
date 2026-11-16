import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/product.dart';

/// Tiny durable cache for the product catalog. Lets the app:
///   • Paint instantly on cold start (no spinner on an empty shop).
///   • Degrade gracefully when the backend is unreachable — show the last
///     successful list with an "offline" banner rather than a stack trace.
///
/// We cache the raw JSON string we received from the API (not the parsed
/// objects) so the serialisation round-trip is cheap and we don't have to
/// reinvent `toJson()` for every model.
class ProductsCache {
  ProductsCache._();
  static const String _keyBody = 'twc.cache.products.body';
  static const String _keyStamp = 'twc.cache.products.stamp';

  /// Oldest cache the UI will display without labelling as stale.
  static const Duration freshFor = Duration(hours: 6);

  /// Persist the raw `products` array JSON (just the array — no wrapper).
  static Future<void> save(List<Product> products) async {
    final prefs = await SharedPreferences.getInstance();
    final body = jsonEncode(products.map(_toJson).toList());
    await prefs.setString(_keyBody, body);
    await prefs.setInt(_keyStamp, DateTime.now().millisecondsSinceEpoch);
  }

  /// Returns the cached list + the timestamp it was saved at, or null if
  /// there's nothing cached.
  static Future<CachedProducts?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final body = prefs.getString(_keyBody);
    final stamp = prefs.getInt(_keyStamp);
    if (body == null || stamp == null) return null;
    try {
      final list = (jsonDecode(body) as List)
          .map((e) => Product.fromJson((e as Map).cast<String, dynamic>()))
          .toList();
      return CachedProducts(
        products: list,
        savedAt: DateTime.fromMillisecondsSinceEpoch(stamp),
      );
    } catch (_) {
      // Corrupt payload — wipe and treat as empty.
      await prefs.remove(_keyBody);
      await prefs.remove(_keyStamp);
      return null;
    }
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyBody);
    await prefs.remove(_keyStamp);
  }

  /// We don't ship a toJson on Product (it's an immutable value-type driven
  /// by the API response). Hand-serialise the fields we need to reconstruct it.
  static Map<String, dynamic> _toJson(Product p) => {
        'slug': p.slug,
        'name': p.name,
        'tagline': p.tagline,
        'description': p.description,
        'price': p.price,
        'drop': p.drop,
        'category': p.category,
        'printShape': p.printShape,
        'customizable': p.customizable,
        'sizes': p.sizes,
        'details': p.details,
        'colors': p.colors
            .map((c) => {
                  'name': c.name,
                  'hex': c.hex,
                  'fabric': c.fabric,
                  'printDefault': c.printDefault,
                })
            .toList(),
        'printArea': {
          'x': p.printArea.x,
          'y': p.printArea.y,
          'w': p.printArea.w,
          'h': p.printArea.h,
        },
      };
}

class CachedProducts {
  const CachedProducts({required this.products, required this.savedAt});
  final List<Product> products;
  final DateTime savedAt;

  bool get isFresh =>
      DateTime.now().difference(savedAt) < ProductsCache.freshFor;
}
