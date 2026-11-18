import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_providers.dart';
import '../../core/models/cart_item.dart';
import '../../core/models/product.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/brand_loader.dart';
import '../../core/util/format.dart';
import '../cart/cart_controller.dart';
import '../shop/product_mockup.dart';

class ProductScreen extends ConsumerStatefulWidget {
  const ProductScreen({super.key, required this.slug});
  final String slug;

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  int _colorIndex = 0;
  String? _size;
  int _qty = 1;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productBySlugProvider(widget.slug));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Product'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: async.when(
        loading: () => const BrandLoader(
          eyebrow: 'Loading product',
          title: 'Threading the mockup.',
        ),
        error: (err, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.search_off,
                    color: AppColors.signalCoral, size: 40),
                const SizedBox(height: 12),
                Text(
                  err is ApiException
                      ? err.message
                      : "Can't load this product right now.",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 14),
                OutlinedButton.icon(
                  onPressed: () => ref.invalidate(productBySlugProvider(widget.slug)),
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
        data: (p) => _ProductBody(
          product: p,
          colorIndex: _colorIndex,
          size: _size ?? (p.sizes.isNotEmpty ? p.sizes.first : ''),
          qty: _qty,
          onColor: (i) => setState(() => _colorIndex = i),
          onSize: (s) => setState(() => _size = s),
          onQty: (q) => setState(() => _qty = q),
          onAdd: () => _addToCart(p),
        ),
      ),
      bottomNavigationBar: async.when(
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
        data: (p) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: [
                // Secondary CTA — jumps into the Design tab with this
                // garment's category + colour preselected.
                if (p.customizable)
                  SizedBox(
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        final color = p.colors[_colorIndex];
                        context.push(
                          '/customize?category=${p.category}'
                          '&fabric=${Uri.encodeComponent(color.fabric)}'
                          '&colorName=${Uri.encodeComponent(color.name)}',
                        );
                      },
                      icon: const Icon(Icons.palette_outlined, size: 18),
                      label: const Text('Customize'),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: AppColors.brandAmberInk.withValues(alpha: 0.55),
                        ),
                        foregroundColor: AppColors.brandAmberInk,
                        padding:
                            const EdgeInsets.symmetric(horizontal: 14),
                      ),
                    ),
                  ),
                if (p.customizable) const SizedBox(width: 10),
                Expanded(
                  child: SizedBox(
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => _addToCart(p),
                      child: Text(
                        'Add to cart — ${formatInr(p.price * _qty)}',
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _addToCart(Product p) {
    final color = p.colors[_colorIndex];
    final size = _size ?? (p.sizes.isNotEmpty ? p.sizes.first : '');
    final item = CartItem(
      id: '${p.slug}-$size-${color.name}-${DateTime.now().millisecondsSinceEpoch}',
      slug: p.slug,
      name: p.name,
      price: p.price,
      qty: _qty,
      size: size,
      color: color.name,
      colorHex: color.hex,
      fabricHex: color.fabric,
      category: p.category,
    );
    ref.read(cartProvider.notifier).add(item);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added to cart · ${formatInr(p.price * _qty)}'),
        backgroundColor: AppColors.ink700,
        action: SnackBarAction(
          label: 'View',
          textColor: AppColors.signalLime,
          onPressed: () => context.push('/cart'),
        ),
      ),
    );
  }
}

class _ProductBody extends StatelessWidget {
  const _ProductBody({
    required this.product,
    required this.colorIndex,
    required this.size,
    required this.qty,
    required this.onColor,
    required this.onSize,
    required this.onQty,
    required this.onAdd,
  });

  final Product product;
  final int colorIndex;
  final String size;
  final int qty;
  final ValueChanged<int> onColor;
  final ValueChanged<String> onSize;
  final ValueChanged<int> onQty;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final color = product.colors[colorIndex];
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Container(
                color: AppColors.ink900,
                child: MobileProductMockup(
                  category: product.category,
                  fabricHex: color.fabric,
                  printShape: product.printShape,
                  printText: product.name.split(' ').first,
                  printTextColor: color.printDefault,
                ),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.drop,
                  style: Theme.of(context).textTheme.labelMedium,
                ),
                const SizedBox(height: 4),
                Text(
                  product.name,
                  style: Theme.of(context).textTheme.displayMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  product.tagline,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 20),
                _SectionLabel(label: '01 · Color'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (var i = 0; i < product.colors.length; i++)
                      _ColorChip(
                        color: product.colors[i],
                        active: i == colorIndex,
                        onTap: () => onColor(i),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                _SectionLabel(label: '02 · Size'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final s in product.sizes)
                      ChoiceChip(
                        label: Text(s),
                        selected: s == size,
                        onSelected: (_) => onSize(s),
                        selectedColor: AppColors.signalLime,
                        labelStyle: TextStyle(
                          color: s == size ? AppColors.ink950 : AppColors.ink100,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                _SectionLabel(label: '03 · Quantity'),
                const SizedBox(height: 8),
                _QtyStepper(qty: qty, onQty: onQty),
                const SizedBox(height: 28),
                _SectionLabel(label: 'Details'),
                const SizedBox(height: 10),
                ...product.details.map(
                  (d) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(top: 7, right: 8),
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: AppColors.signalLime,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Expanded(
                          child: Text(d,
                              style: Theme.of(context).textTheme.bodyMedium),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  product.description,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Text(
        label,
        style: Theme.of(context).textTheme.labelMedium,
      );
}

class _ColorChip extends StatelessWidget {
  const _ColorChip({
    required this.color,
    required this.active,
    required this.onTap,
  });
  final ProductColor color;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active
              ? AppColors.signalLime.withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: active
                ? AppColors.signalLime
                : Colors.white.withValues(alpha: 0.08),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: Color(parseHexColor(color.hex)),
                shape: BoxShape.circle,
                border: Border.all(
                    color: Colors.white.withValues(alpha: 0.24)),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              color.name,
              style: TextStyle(
                color: active ? AppColors.signalLime : AppColors.ink100,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.qty, required this.onQty});
  final int qty;
  final ValueChanged<int> onQty;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove),
            onPressed: qty > 1 ? () => onQty(qty - 1) : null,
          ),
          SizedBox(
            width: 28,
            child: Text(
              '$qty',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: qty < 50 ? () => onQty(qty + 1) : null,
          ),
        ],
      ),
    );
  }
}

