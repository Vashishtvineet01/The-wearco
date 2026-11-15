import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/cart_item.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../widgets/brand_mark.dart';
import 'cart_controller.dart';

class CartScreen extends ConsumerWidget {
  /// When [embedded] is true the back button is suppressed (we're inside
  /// [HomeShell]'s tab stack, so there's no 'back' concept).
  const CartScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);
    final shipping = cart.subtotal == 0
        ? 0
        : (cart.subtotal >= 1499 ? 0 : 99);
    final total = cart.subtotal + shipping;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            BrandMark(size: 26),
            SizedBox(width: 10),
            Text('Cart'),
          ],
        ),
        automaticallyImplyLeading: !embedded,
        leading: embedded
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () =>
                    context.canPop() ? context.pop() : context.go('/'),
              ),
      ),
      body: cart.items.isEmpty
          ? _Empty()
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final item = cart.items[i];
                      return _CartRow(
                        item: item,
                        onInc: () =>
                            notifier.setQty(item.id, item.qty + 1),
                        onDec: () =>
                            notifier.setQty(item.id, item.qty - 1),
                        onRemove: () => notifier.remove(item.id),
                      );
                    },
                  ),
                ),
                _Summary(subtotal: cart.subtotal, shipping: shipping, total: total),
              ],
            ),
      bottomNavigationBar: cart.items.isEmpty
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: ElevatedButton(
                  onPressed: () => context.push('/checkout'),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Text('Checkout — ${formatInr(total)}'),
                  ),
                ),
              ),
            ),
    );
  }
}

class _CartRow extends StatelessWidget {
  const _CartRow({
    required this.item,
    required this.onInc,
    required this.onDec,
    required this.onRemove,
  });

  final CartItem item;
  final VoidCallback onInc;
  final VoidCallback onDec;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
        color: Colors.white.withOpacity(0.02),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Color(parseHexColor(item.fabricHex)),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white10),
            ),
            alignment: Alignment.center,
            child: Text(
              item.size,
              style: const TextStyle(
                color: AppColors.ink950,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.color} · ${item.size}',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _QtyButton(icon: Icons.remove, onTap: onDec),
                    SizedBox(
                      width: 28,
                      child: Text(
                        '${item.qty}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontFamily: 'JetBrainsMono',
                          color: AppColors.ink50,
                        ),
                      ),
                    ),
                    _QtyButton(icon: Icons.add, onTap: onInc),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close,
                          color: AppColors.signalCoral, size: 18),
                      onPressed: onRemove,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            formatInr(item.lineTotal),
            style: const TextStyle(
              fontFamily: 'JetBrainsMono',
              color: AppColors.ink50,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.white10,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Icon(icon, size: 14, color: AppColors.ink100),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({
    required this.subtotal,
    required this.shipping,
    required this.total,
  });
  final int subtotal;
  final int shipping;
  final int total;

  @override
  Widget build(BuildContext context) {
    final styleMuted = Theme.of(context).textTheme.bodyMedium;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        children: [
          _row(context, 'Subtotal', formatInr(subtotal), styleMuted),
          const SizedBox(height: 4),
          _row(
            context,
            'Shipping',
            shipping == 0 ? 'Free' : formatInr(shipping),
            styleMuted,
          ),
          const SizedBox(height: 10),
          Divider(color: Colors.white.withOpacity(0.06), height: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              Text('Total', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              Text(
                formatInr(total),
                style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _row(BuildContext context, String a, String b, TextStyle? style) {
    return Row(
      children: [
        Text(a, style: style),
        const Spacer(),
        Text(b, style: style),
      ],
    );
  }
}

class _Empty extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.shopping_bag_outlined,
                color: AppColors.ink400, size: 48),
            const SizedBox(height: 12),
            Text(
              'Nothing in cart yet.',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Browse the drops and add a few pieces.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.of(context).maybePop(),
              child: const Text('Back to shop'),
            ),
          ],
        ),
      ),
    );
  }
}
