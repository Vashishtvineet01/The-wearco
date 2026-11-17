import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/models/cart_item.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../widgets/brand_mark.dart';
import '../cart/cart_controller.dart';
import '../shop/product_mockup.dart';

/// Design / Customize tab.
///
/// Lets the user build a custom garment without leaving the app:
///   1. Pick a garment type (tee, hoodie, sweatshirt, cap, mug, badge, poster)
///   2. Pick a fabric colour
///   3. Type their own print text (2–14 chars works best)
///   4. Pick a print colour (or let us auto-contrast)
///   5. Pick a size (for apparel only)
///   6. See a live mockup update as they type
///   7. Add it to cart — it lands as a "CUSTOM" line
///
/// Pricing: base garment price + ₹100 customization fee, shown as a
/// transparent breakdown in the CTA. No image upload yet — that's the
/// web Design Studio flow and we'll port it when the mobile Studio lands.
class DesignScreen extends ConsumerStatefulWidget {
  /// Optional preselect — passed from `/product/:slug`'s "Customize this"
  /// shortcut so we can pre-pick the garment type and colour.
  const DesignScreen({
    super.key,
    this.preselectCategory,
    this.preselectFabricHex,
    this.preselectColorName,
  });

  final String? preselectCategory;
  final String? preselectFabricHex;
  final String? preselectColorName;

  @override
  ConsumerState<DesignScreen> createState() => _DesignScreenState();
}

class _DesignScreenState extends ConsumerState<DesignScreen> {
  late _GarmentOption _garment =
      _garmentFor(widget.preselectCategory) ?? _garments.first;
  late _FabricOption _fabric =
      _fabricFor(widget.preselectFabricHex, widget.preselectColorName) ??
          _fabrics.first;
  late String _size = _garment.sizes.isNotEmpty ? _garment.sizes.first : '';
  _PrintColorOption _print = _printColors.first; // auto
  final _textCtl = TextEditingController(text: 'BUILD');
  int _qty = 1;

  static const int _customFee = 100;

  @override
  void dispose() {
    _textCtl.dispose();
    super.dispose();
  }

  _GarmentOption? _garmentFor(String? category) {
    if (category == null) return null;
    for (final g in _garments) {
      if (g.category == category) return g;
    }
    return null;
  }

  _FabricOption? _fabricFor(String? hex, String? name) {
    if (hex == null && name == null) return null;
    for (final f in _fabrics) {
      if ((hex != null && f.fabricHex.toLowerCase() == hex.toLowerCase()) ||
          (name != null && f.name.toLowerCase() == name.toLowerCase())) {
        return f;
      }
    }
    return null;
  }

  int get _unitPrice => _garment.price + _customFee;
  int get _lineTotal => _unitPrice * _qty;

  void _setGarment(_GarmentOption g) {
    setState(() {
      _garment = g;
      // Reset size if previous size doesn't apply to the new category.
      if (g.sizes.isNotEmpty && !g.sizes.contains(_size)) {
        _size = g.sizes.first;
      } else if (g.sizes.isEmpty) {
        _size = '';
      }
    });
  }

  String _resolvePrintColorHex() {
    // Auto: pick lime if fabric is dark, else ink950.
    if (_print.hex == null) {
      final isLight = _isLight(Color(parseHexColor(_fabric.fabricHex)));
      return isLight ? '#0f0d1a' : '#d8ff36';
    }
    return _print.hex!;
  }

  bool _isLight(Color c) {
    final r = (c.r * 255).round();
    final g = (c.g * 255).round();
    final b = (c.b * 255).round();
    final yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq > 160;
  }

  String get _sanitizedText {
    // The mockup already handles truncation; keep a short cap so we don't
    // end up with "LOREMIPSUMDOLOR" rendered on a chest print.
    final t = _textCtl.text.trim();
    if (t.isEmpty) return 'YOUR TEXT';
    return t.toUpperCase();
  }

  Future<void> _addToCart() async {
    HapticFeedback.mediumImpact();
    final text = _textCtl.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Type something to print first.')),
      );
      return;
    }
    final printHex = _resolvePrintColorHex();
    final slug = 'custom-${_garment.category}-'
        '${DateTime.now().millisecondsSinceEpoch}';
    final item = CartItem(
      id: slug,
      slug: slug,
      name: 'Custom ${_garment.label} · "${text.toUpperCase()}"',
      price: _unitPrice,
      qty: _qty,
      size: _size.isEmpty ? 'OS' : _size,
      color: _fabric.name,
      colorHex: _fabric.swatchHex,
      fabricHex: _fabric.fabricHex,
      category: _garment.category,
      printShape: _garment.printShape,
      printText: text.toUpperCase(),
      printTextColor: printHex,
    );
    ref.read(cartProvider.notifier).add(item);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added custom ${_garment.label.toLowerCase()} · '
            '${formatInr(_lineTotal)}'),
        backgroundColor: AppColors.ink700,
        action: SnackBarAction(
          label: 'Cart',
          textColor: AppColors.signalLime,
          onPressed: () => context.go('/cart'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            BrandMark(size: 26),
            SizedBox(width: 10),
            Text('Design'),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Text(
            '// PRINT YOUR OWN',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: AppColors.signalLime,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Your text. Any garment.',
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Pick a base, type your line, choose a colour. We DTG-print and '
            'ship in 5–7 days. ₹100 flat customization fee.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 18),
          _MockupPreview(
            garment: _garment,
            fabric: _fabric,
            printText: _sanitizedText,
            printColorHex: _resolvePrintColorHex(),
          ),
          const SizedBox(height: 20),
          _SectionLabel('01 · Garment'),
          const SizedBox(height: 8),
          _GarmentGrid(
            selected: _garment,
            onSelect: _setGarment,
          ),
          const SizedBox(height: 22),
          _SectionLabel('02 · Fabric'),
          const SizedBox(height: 8),
          _FabricRow(
            selected: _fabric,
            onSelect: (f) => setState(() => _fabric = f),
          ),
          const SizedBox(height: 22),
          _SectionLabel('03 · Print text'),
          const SizedBox(height: 8),
          TextField(
            controller: _textCtl,
            maxLength: 14,
            textCapitalization: TextCapitalization.characters,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(
              hintText: 'BUILD',
              counterText: '',
              helperText: '2–14 characters reads best on a chest print.',
            ),
            style: const TextStyle(
              fontFamily: 'JetBrainsMono',
              fontSize: 16,
              letterSpacing: 2,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 22),
          _SectionLabel('04 · Print colour'),
          const SizedBox(height: 8),
          _PrintColorRow(
            selected: _print,
            onSelect: (c) => setState(() => _print = c),
          ),
          if (_garment.sizes.isNotEmpty) ...[
            const SizedBox(height: 22),
            _SectionLabel('05 · Size'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final s in _garment.sizes)
                  ChoiceChip(
                    label: Text(s),
                    selected: s == _size,
                    onSelected: (_) => setState(() => _size = s),
                    selectedColor: AppColors.signalLime,
                    labelStyle: TextStyle(
                      color: s == _size ? AppColors.ink950 : AppColors.ink100,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
          ],
          const SizedBox(height: 22),
          _SectionLabel('${_garment.sizes.isNotEmpty ? '06' : '05'} · Quantity'),
          const SizedBox(height: 8),
          _QtyStepper(qty: _qty, onQty: (q) => setState(() => _qty = q)),
          const SizedBox(height: 26),
          _PriceBreakdown(
            base: _garment.price,
            fee: _customFee,
            qty: _qty,
            total: _lineTotal,
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.signalLime,
                foregroundColor: AppColors.ink950,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              onPressed: _addToCart,
              child: Text(
                'Add custom ${_garment.label.toLowerCase()} · '
                '${formatInr(_lineTotal)}',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          _BulkPromoCard(onTap: () => context.go('/bulk')),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- Catalog --

class _GarmentOption {
  const _GarmentOption({
    required this.category,
    required this.label,
    required this.price,
    required this.printShape,
    required this.sizes,
    required this.icon,
  });

  final String category;
  final String label;
  final int price;
  final String printShape;
  final List<String> sizes;
  final IconData icon;
}

const _garments = <_GarmentOption>[
  _GarmentOption(
    category: 'tee',
    label: 'Tee',
    price: 999,
    printShape: 'rect',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    icon: Icons.checkroom_outlined,
  ),
  _GarmentOption(
    category: 'hoodie',
    label: 'Hoodie',
    price: 2199,
    printShape: 'rect',
    sizes: ['S', 'M', 'L', 'XL'],
    icon: Icons.style_outlined,
  ),
  _GarmentOption(
    category: 'sweatshirt',
    label: 'Sweatshirt',
    price: 1899,
    printShape: 'rect',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    icon: Icons.dry_cleaning_outlined,
  ),
  _GarmentOption(
    category: 'cap',
    label: 'Cap',
    price: 899,
    printShape: 'rect',
    sizes: [],
    icon: Icons.sports_baseball_outlined,
  ),
  _GarmentOption(
    category: 'mug',
    label: 'Mug',
    price: 499,
    printShape: 'cylinder',
    sizes: [],
    icon: Icons.coffee_outlined,
  ),
  _GarmentOption(
    category: 'badge',
    label: 'Pin / Badge',
    price: 299,
    printShape: 'circle',
    sizes: [],
    icon: Icons.emoji_events_outlined,
  ),
  _GarmentOption(
    category: 'poster',
    label: 'Poster',
    price: 599,
    printShape: 'full',
    sizes: ['A4', 'A3'],
    icon: Icons.image_outlined,
  ),
];

class _FabricOption {
  const _FabricOption({
    required this.name,
    required this.fabricHex,
    required this.swatchHex,
  });
  final String name;
  final String fabricHex; // drawn into mockup
  final String swatchHex; // swatch dot shown in picker
}

// Kept in lockstep with the web Design Studio's palette so cross-device
// users see the same swatches. The first 4 mirror `baseColors` in
// `lib/products.ts`; the rest mirror `PRESET_COLORS` in `StudioClient.tsx`.
const _fabrics = <_FabricOption>[
  _FabricOption(name: 'Obsidian', fabricHex: '#0f0d1a', swatchHex: '#0a0a0a'),
  _FabricOption(name: 'Bone', fabricHex: '#ece7dd', swatchHex: '#ece7dd'),
  _FabricOption(name: 'Graphite', fabricHex: '#2a2a2d', swatchHex: '#2a2a2d'),
  _FabricOption(name: 'Signal Lime', fabricHex: '#d8ff36', swatchHex: '#d8ff36'),
  _FabricOption(name: 'Coral', fabricHex: '#ff5c3b', swatchHex: '#ff5c3b'),
  _FabricOption(name: 'Violet', fabricHex: '#7c5cff', swatchHex: '#7c5cff'),
  _FabricOption(name: 'Sky', fabricHex: '#7cd0ff', swatchHex: '#7cd0ff'),
  _FabricOption(name: 'Gold', fabricHex: '#ffd166', swatchHex: '#ffd166'),
  _FabricOption(name: 'Pink', fabricHex: '#ec4899', swatchHex: '#ec4899'),
  _FabricOption(name: 'White', fabricHex: '#f7f7f7', swatchHex: '#f7f7f7'),
];

class _PrintColorOption {
  const _PrintColorOption({required this.label, required this.hex});
  final String label;
  final String? hex; // null = auto-contrast
}

// Mirrors `PRESET_COLORS` in `StudioClient.tsx` on the web. "Auto" is a
// mobile-only convenience that falls back to high-contrast ink / lime
// depending on the fabric luminance.
const _printColors = <_PrintColorOption>[
  _PrintColorOption(label: 'Auto', hex: null),
  _PrintColorOption(label: 'White', hex: '#f7f7f7'),
  _PrintColorOption(label: 'Ink', hex: '#0a0a0a'),
  _PrintColorOption(label: 'Lime', hex: '#d8ff36'),
  _PrintColorOption(label: 'Coral', hex: '#ff5c3b'),
  _PrintColorOption(label: 'Violet', hex: '#7c5cff'),
  _PrintColorOption(label: 'Sky', hex: '#7cd0ff'),
  _PrintColorOption(label: 'Gold', hex: '#ffd166'),
  _PrintColorOption(label: 'Pink', hex: '#ec4899'),
];

// --------------------------------------------------------------- Widgets --

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
        '// ${text.toUpperCase()}',
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AppColors.signalLime,
            ),
      );
}

class _MockupPreview extends StatelessWidget {
  const _MockupPreview({
    required this.garment,
    required this.fabric,
    required this.printText,
    required this.printColorHex,
  });

  final _GarmentOption garment;
  final _FabricOption fabric;
  final String printText;
  final String printColorHex;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.ink900,
          border: Border.all(
            color: AppColors.signalLime.withValues(alpha: 0.25),
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Stack(
          children: [
            MobileProductMockup(
              category: garment.category,
              fabricHex: fabric.fabricHex,
              printShape: garment.printShape,
              printText: printText,
              printTextColor: printColorHex,
            ),
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  gradient: AppColors.auroraGradient,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'LIVE PREVIEW',
                  style: TextStyle(
                    fontFamily: 'JetBrainsMono',
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: AppColors.ink950,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GarmentGrid extends StatelessWidget {
  const _GarmentGrid({required this.selected, required this.onSelect});

  final _GarmentOption selected;
  final ValueChanged<_GarmentOption> onSelect;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 4,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 0.78,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        for (final g in _garments)
          _GarmentChip(
            option: g,
            selected: g.category == selected.category,
            onTap: () => onSelect(g),
          ),
      ],
    );
  }
}

class _GarmentChip extends StatelessWidget {
  const _GarmentChip({
    required this.option,
    required this.selected,
    required this.onTap,
  });
  final _GarmentOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.signalLime.withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? AppColors.signalLime
                : Colors.white.withValues(alpha: 0.08),
            width: selected ? 1.4 : 1,
          ),
        ),
        padding: const EdgeInsets.all(8),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              option.icon,
              size: 24,
              color: selected ? AppColors.signalLime : AppColors.ink200,
            ),
            const SizedBox(height: 6),
            Text(
              option.label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: selected ? AppColors.ink50 : AppColors.ink200,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              formatInr(option.price),
              style: const TextStyle(
                fontFamily: 'JetBrainsMono',
                fontSize: 10,
                color: AppColors.ink300,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FabricRow extends StatelessWidget {
  const _FabricRow({required this.selected, required this.onSelect});
  final _FabricOption selected;
  final ValueChanged<_FabricOption> onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 46,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _fabrics.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final f = _fabrics[i];
          final active = f.name == selected.name;
          return InkWell(
            onTap: () => onSelect(f),
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
                      : Colors.white.withValues(alpha: 0.1),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Color(parseHexColor(f.swatchHex)),
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    f.name,
                    style: TextStyle(
                      color: active ? AppColors.ink50 : AppColors.ink100,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PrintColorRow extends StatelessWidget {
  const _PrintColorRow({required this.selected, required this.onSelect});
  final _PrintColorOption selected;
  final ValueChanged<_PrintColorOption> onSelect;

  @override
  Widget build(BuildContext context) {
    // Pulled out so the "selected" ring logic also picks up ad-hoc custom
    // colours created from the hex dialog (which share a stable label).
    const customLabel = 'Custom';
    final selectedIsPreset =
        _printColors.any((c) => c.label == selected.label) &&
            selected.label != customLabel;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final c in _printColors)
          _chip(
            context: context,
            label: c.label,
            hex: c.hex,
            active: c.label == selected.label,
            onTap: () => onSelect(c),
          ),
        // Custom hex entry — mirrors web's native <input type="color">.
        _chip(
          context: context,
          label: selected.label == customLabel
              ? 'Custom ${selected.hex}'
              : '+ Custom',
          hex: selected.label == customLabel ? selected.hex : null,
          overrideIcon: Icons.palette_outlined,
          active: !selectedIsPreset && selected.label == customLabel,
          onTap: () async {
            final picked = await _promptHex(context,
                initialHex: selected.hex ?? '#d8ff36');
            if (picked != null) {
              onSelect(_PrintColorOption(label: customLabel, hex: picked));
            }
          },
        ),
      ],
    );
  }

  Widget _chip({
    required BuildContext context,
    required String label,
    required String? hex,
    required bool active,
    required VoidCallback onTap,
    IconData? overrideIcon,
  }) {
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
                : Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (overrideIcon != null)
              Icon(overrideIcon,
                  size: 12,
                  color: active ? AppColors.signalLime : AppColors.ink100)
            else if (hex != null)
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: Color(parseHexColor(hex)),
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.25)),
                ),
              )
            else
              const Icon(Icons.auto_awesome,
                  size: 12, color: AppColors.signalLime),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: active ? AppColors.ink50 : AppColors.ink100,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Opens a tiny dialog with a hex text field and a live colour preview.
  /// Returns a normalised `#rrggbb` string or null on cancel / invalid input.
  Future<String?> _promptHex(BuildContext context,
      {required String initialHex}) async {
    final ctl = TextEditingController(text: initialHex);
    String preview = initialHex;
    return showDialog<String>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) {
          Color resolved;
          try {
            resolved = Color(parseHexColor(preview));
          } catch (_) {
            resolved = AppColors.ink700;
          }
          return AlertDialog(
            backgroundColor: AppColors.ink900,
            title: const Text('Custom print colour'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: resolved,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: ctl,
                  maxLength: 7,
                  autofocus: true,
                  decoration: const InputDecoration(
                    labelText: 'Hex (e.g. #d8ff36)',
                    counterText: '',
                  ),
                  onChanged: (v) => setLocal(() => preview = v),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  final normalised = _normaliseHex(ctl.text);
                  if (normalised != null) Navigator.of(ctx).pop(normalised);
                },
                child: const Text('Use colour'),
              ),
            ],
          );
        },
      ),
    );
  }

  String? _normaliseHex(String raw) {
    var s = raw.trim();
    if (s.startsWith('#')) s = s.substring(1);
    if (s.length == 3) {
      s = s.split('').map((c) => '$c$c').join();
    }
    if (s.length != 6) return null;
    if (!RegExp(r'^[0-9a-fA-F]{6}$').hasMatch(s)) return null;
    return '#${s.toLowerCase()}';
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.qty, required this.onQty});
  final int qty;
  final ValueChanged<int> onQty;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        color: Colors.white.withValues(alpha: 0.02),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove),
            iconSize: 18,
            onPressed: qty > 1 ? () => onQty(qty - 1) : null,
          ),
          SizedBox(
            width: 34,
            child: Text(
              '$qty',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'JetBrainsMono',
                color: AppColors.ink50,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            iconSize: 18,
            onPressed: qty < 24 ? () => onQty(qty + 1) : null,
          ),
        ],
      ),
    );
  }
}

class _PriceBreakdown extends StatelessWidget {
  const _PriceBreakdown({
    required this.base,
    required this.fee,
    required this.qty,
    required this.total,
  });
  final int base;
  final int fee;
  final int qty;
  final int total;

  @override
  Widget build(BuildContext context) {
    final styleMuted = Theme.of(context).textTheme.bodyMedium;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: [
          _row('Base garment', formatInr(base), styleMuted),
          const SizedBox(height: 4),
          _row('Customization', formatInr(fee), styleMuted),
          const SizedBox(height: 4),
          _row('Quantity', '× $qty', styleMuted),
          const SizedBox(height: 10),
          Divider(
              color: Colors.white.withValues(alpha: 0.06), height: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              Text('Line total',
                  style: Theme.of(context).textTheme.titleMedium),
              const Spacer(),
              Text(
                formatInr(total),
                style: const TextStyle(
                  fontFamily: 'JetBrainsMono',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.signalLime,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _row(String a, String b, TextStyle? style) {
    return Row(
      children: [
        Text(a, style: style),
        const Spacer(),
        Text(
          b,
          style: const TextStyle(
            fontFamily: 'JetBrainsMono',
            color: AppColors.ink100,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}

class _BulkPromoCard extends StatelessWidget {
  const _BulkPromoCard({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.signalViolet.withValues(alpha: 0.18),
              AppColors.signalCoral.withValues(alpha: 0.10),
            ],
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: AppColors.signalViolet.withValues(alpha: 0.35),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.ink950.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.inventory_2_outlined,
                  color: AppColors.ink50, size: 20),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Need 25+ for your team?',
                    style: TextStyle(
                      color: AppColors.ink50,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Volume pricing, custom printing, dedicated contact.',
                    style: TextStyle(
                      color: AppColors.ink200,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right,
                color: AppColors.ink300, size: 20),
          ],
        ),
      ),
    );
  }
}
