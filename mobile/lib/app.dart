import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/theme/app_theme.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/design/design_screen.dart';
import 'features/product/product_screen.dart';
import 'features/shell/home_shell.dart';

/// Root widget — wires up the router, theme and Riverpod scope.
///
/// Navigation model:
///   - `HomeShell` is the persistent root with a bottom nav (Shop /
///     Design / Bulk / Cart / Account). Each tab routes to a stable
///     path so deep links still work.
///   - Product detail and checkout are pushed modally on top of the
///     active tab.
///   - `/customize` is also a modal standalone (pushed from the
///     "Customize this" shortcut on the product page) that re-uses the
///     DesignScreen with a garment preselected.
class TheWearCoApp extends StatelessWidget {
  const TheWearCoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (_, __) => const HomeShell(initialIndex: 0)),
        GoRoute(
            path: '/design',
            builder: (_, __) => const HomeShell(initialIndex: 1)),
        GoRoute(
            path: '/bulk',
            builder: (_, __) => const HomeShell(initialIndex: 2)),
        GoRoute(
            path: '/cart',
            builder: (_, __) => const HomeShell(initialIndex: 3)),
        GoRoute(
            path: '/account',
            builder: (_, __) => const HomeShell(initialIndex: 4)),
        GoRoute(
          path: '/product/:slug',
          builder: (_, state) =>
              ProductScreen(slug: state.pathParameters['slug']!),
        ),
        GoRoute(
          path: '/customize',
          builder: (_, state) => DesignScreen(
            preselectCategory: state.uri.queryParameters['category'],
            preselectFabricHex: state.uri.queryParameters['fabric'],
            preselectColorName: state.uri.queryParameters['colorName'],
          ),
        ),
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
