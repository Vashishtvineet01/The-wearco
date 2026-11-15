import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/theme/app_theme.dart';
import 'features/bulk/bulk_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/product/product_screen.dart';
import 'features/shop/shop_screen.dart';

/// Root widget — wires up the router, theme and Riverpod scope.
class TheWearCoApp extends StatelessWidget {
  const TheWearCoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (_, __) => const ShopScreen()),
        GoRoute(
          path: '/product/:slug',
          builder: (_, state) =>
              ProductScreen(slug: state.pathParameters['slug']!),
        ),
        GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
        GoRoute(
          path: '/checkout',
          builder: (_, __) => const CheckoutScreen(),
        ),
        GoRoute(
          path: '/checkout/success',
          builder: (_, state) => CheckoutSuccessScreen(
            orderNumber: state.uri.queryParameters['order'] ?? '',
          ),
        ),
        GoRoute(path: '/bulk', builder: (_, __) => const BulkScreen()),
      ],
    );

    return MaterialApp.router(
      title: 'TheWearCo',
      theme: buildAppTheme(),
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}
