import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_providers.dart';
import '../../core/models/product.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../cart/cart_controller.dart';
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
  const ShopScreen({super.key});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String _tab = 'all';

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productsProvider);
    final cart = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('TheWearCo'),
        actions: [
          IconButton(
            tooltip: 'Bulk orders',
            onPressed: () => context.push('/bulk'),
            icon: const Icon(Icons.inventory_2_outlined),
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                tooltip: 'Cart',
                onPressed: () => context.push('/cart'),
                icon: const Icon(Icons.shopping_bag_outlined),
              ),
              if (cart.count > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: AppColors.signalLime,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      '${cart.count}',
                      style: const TextStyle(
                        color: AppColors.ink950,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.signalLime,
        onRefresh: () async => ref.refresh(productsProvider.future),
        child: async.when(
          loading: () =>
              const Center(child: CircularProgressIndicator(color: AppColors.signalLime)),
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
                        color: AppColors.signalLime,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Internet uniform.',
                  style: Theme.of(context).textTheme.displayMedium,
                ),
                const SizedBox(height: 6),
                Text(
                  'Limited drops for founders, creators, freelancers.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
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
                return ChoiceChip(
                  label: Text(label),
                  selected: active,
                  onSelected: (_) => onTab(id),
                  selectedColor: AppColors.signalLime,
                  backgroundColor: Colors.white10,
                  labelStyle: TextStyle(
                    color: active ? AppColors.ink950 : AppColors.ink100,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                    side: const BorderSide(color: Colors.white10),
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
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
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
          border: Border.all(color: Colors.white10),
          color: Colors.white.withOpacity(0.02),
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
                    fontFamily: 'JetBrainsMono',
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
    final message = error is ApiException
        ? (error as ApiException).message
        : 'Failed to reach TheWearCo API.';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, color: AppColors.signalCoral, size: 40),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(
              'Is the API running? Default: http://localhost:3000/api/v1',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
