import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../account/account_screen.dart';
import '../bulk/bulk_screen.dart';
import '../cart/cart_controller.dart';
import '../cart/cart_screen.dart';
import '../design/design_screen.dart';
import '../shop/shop_screen.dart';

/// Root tab host — wraps the five primary screens in a persistent
/// NavigationBar so users never lose context on a tab switch.
///
/// Tabs:
///   0 — Shop
///   1 — Design (customize a garment)
///   2 — Bulk
///   3 — Cart
///   4 — Account
///
/// `extendBody` is intentionally `false` so the nav takes its own layout
/// space; this prevents the last grid item on Shop from being clipped by
/// the floating bar.
class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  late int _index = widget.initialIndex.clamp(0, 4);

  // IndexedStack keeps each tab's scroll + form state alive while
  // switching, so the cart doesn't lose edits if you peek at Shop.
  static const _screens = <Widget>[
    ShopScreen(embedded: true),
    DesignScreen(),
    BulkScreen(embedded: true),
    CartScreen(embedded: true),
    AccountScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);

    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: _BottomBar(
        index: _index,
        cartCount: cart.count,
        onSelect: (i) => setState(() => _index = i),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.index,
    required this.cartCount,
    required this.onSelect,
  });

  final int index;
  final int cartCount;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.ink950,
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.06)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _NavButton(
                icon: Icons.storefront_outlined,
                activeIcon: Icons.storefront,
                label: 'Shop',
                selected: index == 0,
                onTap: () => onSelect(0),
              ),
              _NavButton(
                icon: Icons.palette_outlined,
                activeIcon: Icons.palette,
                label: 'Design',
                selected: index == 1,
                onTap: () => onSelect(1),
              ),
              _NavButton(
                icon: Icons.inventory_2_outlined,
                activeIcon: Icons.inventory_2,
                label: 'Bulk',
                selected: index == 2,
                onTap: () => onSelect(2),
              ),
              _NavButton(
                icon: Icons.shopping_bag_outlined,
                activeIcon: Icons.shopping_bag,
                label: 'Cart',
                selected: index == 3,
                onTap: () => onSelect(3),
                badge: cartCount > 0 ? '$cartCount' : null,
              ),
              _NavButton(
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: 'Account',
                selected: index == 4,
                onTap: () => onSelect(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badge,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            gradient: selected
                ? const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0x337C5CFF),
                      Color(0x33FF5C3B),
                      Color(0x22D8FF36),
                    ],
                  )
                : null,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected
                  ? AppColors.signalViolet.withValues(alpha: 0.4)
                  : Colors.transparent,
              width: 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    selected ? activeIcon : icon,
                    size: 20,
                    color: selected ? AppColors.ink50 : AppColors.ink300,
                  ),
                  if (badge != null)
                    Positioned(
                      right: -8,
                      top: -4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          gradient: AppColors.auroraGradient,
                          borderRadius: BorderRadius.circular(999),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.signalCoral
                                  .withValues(alpha: 0.6),
                              blurRadius: 10,
                              spreadRadius: -2,
                            ),
                          ],
                        ),
                        constraints: const BoxConstraints(minWidth: 16),
                        child: Text(
                          badge!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppColors.ink950,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.fade,
                softWrap: false,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight:
                      selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected ? AppColors.ink50 : AppColors.ink300,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
