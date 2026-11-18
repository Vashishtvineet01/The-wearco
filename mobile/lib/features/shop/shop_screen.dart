import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_providers.dart';
import '../../core/config/env.dart';
import '../../core/models/product.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/brand_loader.dart';
import '../../core/util/format.dart';
import '../../widgets/brand_mark.dart';
import 'product_mockup.dart';

const _categories = <(String, String)>[
  ('all', 'All'),
  ('tee', 'Tees'),
  ('hoodie', 'Hoodies'),
  ('sweatshirt', 'Sweatshirts'),
  ('cap', 'Caps'),
  ('mug', 'Mugs'),
  ('badge', 'Badges'),
  ('poster', 'Posters'),
];

class ShopScreen extends ConsumerStatefulWidget {
  /// When [embedded] is true, the screen is a tab inside [HomeShell], so
  /// the bulk/cart actions are hidden (they live in the bottom nav).
  const ShopScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String _tab = 'all';

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        titleSpacing: 20,
        title: const BrandMark(size: 28, showWordmark: true),
        actions: widget.embedded
            ? null
            : [
                IconButton(
                  tooltip: 'Bulk orders',
                  onPressed: () => context.push('/bulk'),
                  icon: const Icon(Icons.inventory_2_outlined),
                ),
                IconButton(
                  tooltip: 'Cart',
                  onPressed: () => context.push('/cart'),
                  icon: const Icon(Icons.shopping_bag_outlined),
                ),
                const SizedBox(width: 4),
              ],
      ),
      body: RefreshIndicator(
        color: AppColors.signalLime,
        onRefresh: () async => ref.refresh(productsProvider.future),
        child: async.when(
          loading: () => const BrandLoader(
            eyebrow: 'Loading shop',
            title: 'Fetching the drops.',
          ),
          error: (err, _) => _ErrorState(error: err, onRetry: () => ref.invalidate(productsProvider)),
          data: (products) => _ShopBody(
            products: products,
            tab: _tab,
            onTab: (t) => setState(() => _tab = t),
          ),
        ),
      ),
    );
  }
}

class _ShopBody extends StatelessWidget {
  const _ShopBody({
    required this.products,
    required this.tab,
    required this.onTab,
  });

  final List<Product> products;
  final String tab;
  final ValueChanged<String> onTab;

  @override
  Widget build(BuildContext context) {
    final filtered = tab == 'all'
        ? products
        : products.where((p) => p.category == tab).toList();

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '// SHOP',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: AppColors.brandAmberInk,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Apparel & prints, ready to wear.',
                  style: Theme.of(context).textTheme.displayMedium,
                ),
                const SizedBox(height: 6),
                Text(
                  'Browse the catalog — or design your own in Design Studio.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: _DesignBanner(onTap: () => context.go('/design')),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final (id, label) = _categories[i];
                final active = id == tab;
                return GestureDetector(
                  onTap: () => onTab(id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: active
                          ? AppColors.paper900
                          : AppColors.paper100.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: active
                            ? AppColors.paper900
                            : AppColors.paper300,
                      ),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        color: active
                            ? AppColors.brandCream
                            : AppColors.paper800,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        if (filtered.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: Center(
              child: Text(
                'No products in this category yet.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          )
        else
          SliverPadding(
            // 20px of breathing room under the last row. The bottom nav
            // takes its own layout space (extendBody: false in HomeShell)
            // so we don't need to pad for it here.
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, i) => _ProductCard(product: filtered[i]),
                childCount: filtered.length,
              ),
            ),
          ),
      ],
    );
  }
}

class _DesignBanner extends StatelessWidget {
  const _DesignBanner({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.paper100,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.paper300),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: AppColors.auroraGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.palette,
                size: 22,
                color: AppColors.brandCream,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Design your own',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontSize: 15),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Pick a garment, type your line, see a live mockup.',
                    style: TextStyle(
                      color: AppColors.paper700,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right,
                color: AppColors.paper800, size: 22),
          ],
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    final color = product.colors.isNotEmpty ? product.colors.first : null;
    return InkWell(
      onTap: () => context.push('/product/${product.slug}'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.paper200),
          color: AppColors.paper100.withValues(alpha: 0.65),
        ),
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                color: AppColors.ink900,
                child: MobileProductMockup(
                  category: product.category,
                  fabricHex: color?.fabric ?? '#0e0e10',
                  printShape: product.printShape,
                  printText: product.name.split(' ').first,
                  printTextColor: color?.printDefault,
                  compact: true,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              product.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 2),
            Text(
              product.tagline,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const Spacer(),
            Row(
              children: [
                Text(
                  formatInr(product.price),
                  style: const TextStyle(
                    fontFamily: 'Source Code Pro',
                    fontSize: 13,
                    color: AppColors.ink100,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Text(
                  '${product.sizes.length} sizes',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error, required this.onRetry});
  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    // Headlines + icons per failure kind. We never dump raw exception text
    // anywhere on this screen — the user always sees a short clean phrase
    // and the CURRENT backend URL so they can self-diagnose.
    String headline = "Can't reach TheWearCo.";
    String hint = "Check your connection and try again.";
    IconData icon = Icons.cloud_off;
    if (error is ApiException) {
      final e = error as ApiException;
      headline = e.message;
      switch (e.kind) {
        case ApiErrorKind.network:
          icon = Icons.wifi_off;
          hint = "Your phone can't reach the backend from this network.";
          break;
        case ApiErrorKind.timeout:
          icon = Icons.hourglass_disabled;
          hint = "The backend didn't respond within 15 seconds.";
          break;
        case ApiErrorKind.notFound:
          icon = Icons.link_off;
          hint = "This URL exists but doesn't serve /api/v1. The backend "
              "might be an older deploy.";
          break;
        case ApiErrorKind.server:
          icon = Icons.error_outline;
          hint = "The server is up but responded with an error.";
          break;
        case ApiErrorKind.client:
          icon = Icons.warning_amber_rounded;
          hint = "The request was rejected.";
          break;
        case ApiErrorKind.other:
          icon = Icons.cloud_off;
          hint = "Something unexpected happened.";
          break;
      }
    }
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: AppColors.signalCoral, size: 44),
            const SizedBox(height: 14),
            Text(
              headline,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              hint,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 18),
            // The URL the app is CURRENTLY using — makes debugging obvious.
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.paper100,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.paper300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'BACKEND',
                        style: TextStyle(
                          fontFamily: 'Source Code Pro',
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: AppColors.paper500,
                        ),
                      ),
                      if (Env.hasOverride) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: AppColors.brandAmber.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'OVERRIDE',
                            style: TextStyle(
                              fontFamily: 'Source Code Pro',
                              fontSize: 8,
                              letterSpacing: 1,
                              color: AppColors.brandAmberInk,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    Env.apiBaseUrl,
                    style: const TextStyle(
                      fontFamily: 'Source Code Pro',
                      fontSize: 11,
                      color: AppColors.paper900,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Retry'),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppColors.ink900,
                        duration: const Duration(seconds: 4),
                        content: Row(
                          children: const [
                            Icon(Icons.touch_app,
                                color: AppColors.signalLime, size: 18),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Long-press the TheWearCo logo at the top to '
                                'change the backend URL.',
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.swap_horiz, size: 16),
                  label: const Text('Change URL'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
