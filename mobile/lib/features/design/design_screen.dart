import 'dart:io';
import 'dart:ui' as ui;

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/api/api_client.dart';
import '../../core/config/env.dart';
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

  // ── Studio controls (match web StudioClient.tsx) ──
  _StudioTab _studioTab = _StudioTab.text;
  _FontOption _font = _fonts.first;

  /// Bytes for instant preview after `image_picker` returns; cleared once
  /// we have a server-side `_imageUrl` (so uploads persist across sessions).
  Uint8List? _imageBytes;
  String? _imageFileName;

  /// Server path returned by POST /api/uploads/design. Null in demo mode.
  String? _imageUrl;
  _UploadState _uploadState = _UploadState.idle;

  double _posX = 0; // -50..50 %
  double _posY = 0; // -50..50 %
  double _scale = 1; // 0.4..1.6
  double _rotation = 0; // -45..45 deg

  /// Boundary wrapper around the mockup — lets us snapshot it to PNG and
  /// hand off to share_plus.
  final GlobalKey _mockupKey = GlobalKey();
  bool _sharing = false;

  static const int _customFee = 100;
  static const int _imageAddOn = 200; // matches web (customPrice + 200)

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

  int get _unitPrice =>
      _garment.price + _customFee + (_hasImage ? _imageAddOn : 0);
  int get _lineTotal => _unitPrice * _qty;

  bool get _hasImage => _imageBytes != null || _imageUrl != null;

  bool get _hasText => _textCtl.text.trim().isNotEmpty;

  // ─────────────────────────── Image upload ────────────────────────────
  Future<void> _pickAndUploadImage({required ImageSource source}) async {
    try {
      final picker = ImagePicker();
      final XFile? picked = await picker.pickImage(
        source: source,
        maxWidth: 2400,
        maxHeight: 2400,
        imageQuality: 92,
      );
      if (picked == null) return;

      final bytes = await picked.readAsBytes();
      if (bytes.lengthInBytes > 5 * 1024 * 1024) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image must be under 5 MB.')),
        );
        return;
      }

      setState(() {
        _imageBytes = bytes;
        _imageFileName = picked.name;
        _imageUrl = null;
        _studioTab = _StudioTab.image;
        _uploadState = _UploadState.uploading;
      });

      // Skip server upload in demo mode — keep the local bytes so the
      // mockup still renders and the cart line still looks right.
      if (Env.isDemoMode) {
        setState(() => _uploadState = _UploadState.done);
        return;
      }

      final dio = ref.read(dioProvider);
      final form = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: picked.name,
        ),
      });
      final res = await dio.post<Map<String, dynamic>>(
        '/api/uploads/design',
        data: form,
      );
      final url = (res.data?['url'] as String?) ?? '';
      if (url.isEmpty) throw Exception('Upload returned no URL');
      if (!mounted) return;
      setState(() {
        _imageUrl = url;
        _uploadState = _UploadState.done;
      });
    } on DioException catch (e) {
      final msg = ApiException.fromDioError(e).message;
      if (!mounted) return;
      setState(() => _uploadState = _UploadState.error);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed — $msg (kept local preview).')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _uploadState = _UploadState.error);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed — $e')),
      );
    }
  }

  void _clearImage() {
    setState(() {
      _imageBytes = null;
      _imageFileName = null;
      _imageUrl = null;
      _uploadState = _UploadState.idle;
    });
  }

  void _resetTransforms() {
    setState(() {
      _posX = 0;
      _posY = 0;
      _scale = 1;
      _rotation = 0;
    });
  }

  // ─────────────────────────── PNG share ──────────────────────────────
  Future<void> _sharePngMockup() async {
    if (_sharing) return;
    setState(() => _sharing = true);
    try {
      final boundary = _mockupKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;
      if (boundary == null) throw Exception('Preview not ready');
      final image = await boundary.toImage(pixelRatio: 3);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) throw Exception('PNG encode failed');
      final bytes = byteData.buffer.asUint8List();

      final dir = await getTemporaryDirectory();
      final slug = (_sanitizedText.isEmpty ? 'design' : _sanitizedText)
          .toLowerCase()
          .replaceAll(RegExp(r'[^a-z0-9]+'), '-');
      final file = File('${dir.path}/thewearco-$slug.png');
      await file.writeAsBytes(bytes, flush: true);

      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'image/png')],
        text: 'My ${_garment.label} mockup — TheWearCo',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Couldn't share mockup — $e")),
      );
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

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
    // A line needs at least one of: text or image. Mirrors web contract.
    if (text.isEmpty && !_hasImage) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Add some text or upload artwork first.')),
      );
      return;
    }
    if (_uploadState == _UploadState.uploading) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Hold on — artwork is still uploading.')),
      );
      return;
    }

    final printHex = _resolvePrintColorHex();
    final slug = 'custom-${_garment.category}-'
        '${DateTime.now().millisecondsSinceEpoch}';
    final displayName = text.isNotEmpty
        ? 'Custom ${_garment.label} · "${text.toUpperCase()}"'
        : 'Custom ${_garment.label} · artwork';
    final item = CartItem(
      id: slug,
      slug: slug,
      name: displayName,
      price: _unitPrice,
      qty: _qty,
      size: _size.isEmpty ? 'OS' : _size,
      color: _fabric.name,
      colorHex: _fabric.swatchHex,
      fabricHex: _fabric.fabricHex,
      category: _garment.category,
      printShape: _garment.printShape,
      printText: text.isNotEmpty ? text.toUpperCase() : null,
      printTextColor: text.isNotEmpty ? printHex : null,
      printFontFamily: _font.id,
      printImageUrl: _imageUrl, // null if demo mode / local-only
      printPosX: _posX,
      printPosY: _posY,
      printScale: _scale,
      printRotation: _rotation,
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
            '// DESIGN STUDIO',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: AppColors.brandAmberInk,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Design & print on anything.',
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Pick a base, type your line or upload art, place it on a live '
            'mockup. We print and ship in 5–7 days. ₹100 flat customization fee.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 18),
          _DesignCanvas(
            boundaryKey: _mockupKey,
            garment: _garment,
            fabric: _fabric,
            printText: _hasText ? _sanitizedText : null,
            printColorHex: _resolvePrintColorHex(),
            font: _font,
            imageBytes: _imageBytes,
            imageNetworkUrl: _imageUrl,
            posX: _posX,
            posY: _posY,
            scale: _scale,
            rotation: _rotation,
            onPosDelta: (dx, dy) {
              setState(() {
                _posX = (_posX + dx).clamp(-50, 50);
                _posY = (_posY + dy).clamp(-50, 50);
              });
            },
            onShare: _sharing ? null : _sharePngMockup,
            sharing: _sharing,
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
          _SectionLabel('03 · Design'),
          const SizedBox(height: 8),
          _StudioTabBar(
            selected: _studioTab,
            onSelect: (t) => setState(() => _studioTab = t),
          ),
          const SizedBox(height: 12),
          if (_studioTab == _StudioTab.text) ...[
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
              style: GoogleFonts.getFont(
                _font.googleFamily,
                fontSize: 16,
                letterSpacing: 2,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 14),
            _FontPickerRow(
              selected: _font,
              onSelect: (f) => setState(() => _font = f),
            ),
          ] else if (_studioTab == _StudioTab.image) ...[
            _ImagePickerCard(
              bytes: _imageBytes,
              fileName: _imageFileName,
              state: _uploadState,
              onPickGallery: () =>
                  _pickAndUploadImage(source: ImageSource.gallery),
              onPickCamera: () =>
                  _pickAndUploadImage(source: ImageSource.camera),
              onClear: _clearImage,
            ),
            const SizedBox(height: 12),
            Text(
              'Transparent PNGs work best. Add a caption below if you want '
              'text under your art.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _textCtl,
              maxLength: 14,
              textCapitalization: TextCapitalization.characters,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Optional caption',
                counterText: '',
              ),
              style: GoogleFonts.getFont(
                _font.googleFamily,
                fontSize: 14,
                letterSpacing: 2,
                fontWeight: FontWeight.w700,
              ),
            ),
          ] else ...[
            _PresetLinesGrid(
              current: _textCtl.text,
              onPick: (line) => setState(() {
                _textCtl.text = line;
                _textCtl.selection = TextSelection.collapsed(
                  offset: _textCtl.text.length,
                );
              }),
            ),
          ],
          const SizedBox(height: 22),
          _SectionLabel('04 · Print colour'),
          const SizedBox(height: 8),
          _PrintColorRow(
            selected: _print,
            onSelect: (c) => setState(() => _print = c),
          ),
          const SizedBox(height: 22),
          _SectionLabel('05 · Fine-tune'),
          const SizedBox(height: 8),
          _FineTuneCard(
            posX: _posX,
            posY: _posY,
            scale: _scale,
            rotation: _rotation,
            onPosX: (v) => setState(() => _posX = v),
            onPosY: (v) => setState(() => _posY = v),
            onScale: (v) => setState(() => _scale = v),
            onRotation: (v) => setState(() => _rotation = v),
            onReset: _resetTransforms,
          ),
          if (_garment.sizes.isNotEmpty) ...[
            const SizedBox(height: 22),
            _SectionLabel('06 · Size'),
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
          _SectionLabel('${_garment.sizes.isNotEmpty ? '07' : '06'} · Quantity'),
          const SizedBox(height: 8),
          _QtyStepper(qty: _qty, onQty: (q) => setState(() => _qty = q)),
          const SizedBox(height: 26),
          _PriceBreakdown(
            base: _garment.price,
            fee: _customFee + (_hasImage ? _imageAddOn : 0),
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

enum _StudioTab {
  text('Text'),
  image('Image'),
  preset('Presets');

  const _StudioTab(this.label);
  final String label;
}

enum _UploadState { idle, uploading, done, error }

class _FontOption {
  const _FontOption({
    required this.id,
    required this.label,
    required this.googleFamily,
  });

  /// Stored in the cart line as `printFontFamily`, matches web FONTS[].id.
  final String id;

  /// User-facing label shown in the picker chip.
  final String label;

  /// Font family name used by `GoogleFonts.getFont(...)`.
  final String googleFamily;
}

/// Mirrors the web `FONTS` list in `StudioClient.tsx`. Keep ids identical so
/// an order placed from either surface prints with the same typeface.
const _fonts = <_FontOption>[
  _FontOption(id: 'display', label: 'Sans', googleFamily: 'Source Sans 3'),
  _FontOption(id: 'mono', label: 'Mono', googleFamily: 'Source Code Pro'),
  _FontOption(id: 'sans', label: 'Clean', googleFamily: 'Source Sans 3'),
];

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

/// Live design preview. Stacks the garment painter underneath a Positioned
/// overlay (clipped to the print area) that renders the uploaded image +
/// typed text with the user's current transforms. The user can drag the
/// overlay directly to reposition — maps to `posX`/`posY` the same way the
/// web Studio does.
class _DesignCanvas extends StatelessWidget {
  const _DesignCanvas({
    required this.boundaryKey,
    required this.garment,
    required this.fabric,
    required this.printText,
    required this.printColorHex,
    required this.font,
    required this.imageBytes,
    required this.imageNetworkUrl,
    required this.posX,
    required this.posY,
    required this.scale,
    required this.rotation,
    required this.onPosDelta,
    required this.onShare,
    required this.sharing,
  });

  final GlobalKey boundaryKey;
  final _GarmentOption garment;
  final _FabricOption fabric;
  final String? printText;
  final String printColorHex;
  final _FontOption font;
  final Uint8List? imageBytes;
  final String? imageNetworkUrl;
  final double posX;
  final double posY;
  final double scale;
  final double rotation;
  final void Function(double dxPercent, double dyPercent) onPosDelta;
  final VoidCallback? onShare;
  final bool sharing;

  @override
  Widget build(BuildContext context) {
    final area = MobileProductMockup.printAreaFor(garment.category);
    final textColor = Color(parseHexColor(printColorHex));

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
        child: AspectRatio(
          aspectRatio: 1,
          child: RepaintBoundary(
            key: boundaryKey,
            child: LayoutBuilder(
              builder: (ctx, c) {
                final w = c.maxWidth;
                final h = c.maxHeight;
                final rect = Rect.fromLTWH(
                  area.left * w,
                  area.top * h,
                  area.width * w,
                  area.height * h,
                );
                return Stack(
                  children: [
                    // Garment base — no text, we render it in the overlay so
                    // fonts + transforms + image composite behave consistently.
                    MobileProductMockup(
                      category: garment.category,
                      fabricHex: fabric.fabricHex,
                      printShape: garment.printShape,
                      printText: null,
                    ),

                    // Print-area overlay: clipped to the printable shape, with
                    // image + text stacked and the user's transforms applied.
                    Positioned.fromRect(
                      rect: rect,
                      child: GestureDetector(
                        behavior: HitTestBehavior.translucent,
                        onPanUpdate: (d) {
                          // Convert drag in px → % of print rect.
                          onPosDelta(
                            (d.delta.dx / rect.width) * 100,
                            (d.delta.dy / rect.height) * 100,
                          );
                        },
                        child: ClipPath(
                          clipper: _PrintAreaClipper(
                            shape: garment.printShape,
                          ),
                          child: Center(
                            child: Transform.translate(
                              offset: Offset(
                                (posX / 100) * rect.width,
                                (posY / 100) * rect.height,
                              ),
                              child: Transform.rotate(
                                angle: rotation * 3.1415926 / 180,
                                child: Transform.scale(
                                  scale: scale,
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      if (imageBytes != null)
                                        Image.memory(
                                          imageBytes!,
                                          fit: BoxFit.contain,
                                          width: rect.width,
                                          height: rect.height,
                                        )
                                      else if (imageNetworkUrl != null &&
                                          imageNetworkUrl!.isNotEmpty)
                                        Image.network(
                                          _resolveNetworkUrl(imageNetworkUrl!),
                                          fit: BoxFit.contain,
                                          width: rect.width,
                                          height: rect.height,
                                          errorBuilder: (_, __, ___) =>
                                              const SizedBox.shrink(),
                                        ),
                                      if (printText != null)
                                        _OverlayText(
                                          text: printText!,
                                          color: textColor,
                                          font: font,
                                          maxWidth: rect.width - 8,
                                          maxHeight: rect.height - 4,
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // "LIVE PREVIEW" chip.
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
                            fontFamily: 'Source Code Pro',
                            fontSize: 9,
                            letterSpacing: 1.5,
                            color: AppColors.ink950,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),

                    // Share-PNG button.
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Material(
                        color: Colors.black.withValues(alpha: 0.35),
                        shape: const StadiumBorder(),
                        child: InkWell(
                          customBorder: const StadiumBorder(),
                          onTap: onShare,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (sharing)
                                  const SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 1.6,
                                      color: AppColors.signalLime,
                                    ),
                                  )
                                else
                                  const Icon(
                                    Icons.ios_share,
                                    size: 14,
                                    color: AppColors.signalLime,
                                  ),
                                const SizedBox(width: 6),
                                const Text(
                                  'PNG',
                                  style: TextStyle(
                                    color: AppColors.signalLime,
                                    fontFamily: 'Source Code Pro',
                                    fontSize: 10,
                                    letterSpacing: 1.5,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Subtle print-area outline so drag target is discoverable.
                    Positioned.fromRect(
                      rect: rect,
                      child: IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: AppColors.signalLime
                                  .withValues(alpha: 0.28),
                              width: 1,
                            ),
                            borderRadius: garment.printShape == 'rect' ||
                                    garment.printShape == 'full'
                                ? BorderRadius.circular(4)
                                : null,
                            shape: garment.printShape == 'circle'
                                ? BoxShape.circle
                                : BoxShape.rectangle,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  /// Turn a relative `/uploads/designs/x.png` into an absolute URL the
  /// mobile `Image.network` can fetch. In demo mode uploads never happen,
  /// so this branch isn't normally reached.
  String _resolveNetworkUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    final base = Env.apiBaseUrl;
    if (base.isEmpty || base.startsWith('demo://')) return url;
    final b = base.endsWith('/') ? base.substring(0, base.length - 1) : base;
    final u = url.startsWith('/') ? url : '/$url';
    return '$b$u';
  }
}

/// Clips the overlay to match the print area shape. For `full` posters we
/// keep the full rect; for `circle` we clip to a circle; for everything
/// else we use a soft rounded rect so the print has a subtle frame.
class _PrintAreaClipper extends CustomClipper<Path> {
  const _PrintAreaClipper({required this.shape});
  final String shape;

  @override
  Path getClip(Size size) {
    final path = Path();
    switch (shape) {
      case 'circle':
        path.addOval(Rect.fromLTWH(0, 0, size.width, size.height));
        break;
      case 'full':
        path.addRect(Rect.fromLTWH(0, 0, size.width, size.height));
        break;
      default:
        path.addRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(0, 0, size.width, size.height),
            const Radius.circular(6),
          ),
        );
    }
    return path;
  }

  @override
  bool shouldReclip(_PrintAreaClipper old) => old.shape != shape;
}

/// Auto-fitting overlay text — picks the largest font size that fits in the
/// print rect on a single line. Mirrors the painter's old behaviour but uses
/// GoogleFonts so the user's Display/Mono/Sans choice actually shows up.
class _OverlayText extends StatelessWidget {
  const _OverlayText({
    required this.text,
    required this.color,
    required this.font,
    required this.maxWidth,
    required this.maxHeight,
  });
  final String text;
  final Color color;
  final _FontOption font;
  final double maxWidth;
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    // Normalise same way the painter does so mobile ↔ web look identical.
    final first =
        text.trim().split(RegExp(r'\s+')).first.replaceAll(RegExp(r'[….]+$'), '');
    final label =
        (first.length <= 7 ? first : first.substring(0, 5)).toUpperCase();

    // Try progressively smaller font sizes until it fits.
    double size = maxWidth * 0.26; // ≈ painter's 42px at 400px viewBox
    if (size > maxHeight * 0.6) size = maxHeight * 0.6;
    const minSize = 14.0;

    while (size >= minSize) {
      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: GoogleFonts.getFont(
            font.googleFamily,
            color: color,
            fontSize: size,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.4,
            height: 1.0,
          ),
        ),
        maxLines: 1,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      )..layout();
      if (tp.width <= maxWidth && tp.height <= maxHeight) break;
      size -= 2;
    }

    return Text(
      label,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
      style: GoogleFonts.getFont(
        font.googleFamily,
        color: color,
        fontSize: size,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.4,
        height: 1.0,
      ),
    );
  }
}

/// Simple pill-style tab bar for the three Studio modes.
class _StudioTabBar extends StatelessWidget {
  const _StudioTabBar({required this.selected, required this.onSelect});
  final _StudioTab selected;
  final ValueChanged<_StudioTab> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: [
          for (final t in _StudioTab.values)
            Expanded(
              child: InkWell(
                onTap: () => onSelect(t),
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: t == selected
                        ? AppColors.signalLime.withValues(alpha: 0.14)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    t.label.toUpperCase(),
                    style: TextStyle(
                      fontFamily: 'Source Code Pro',
                      fontSize: 10,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w700,
                      color: t == selected
                          ? AppColors.signalLime
                          : AppColors.ink200,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Three-chip font picker — maps 1:1 to web's `FONTS` list.
class _FontPickerRow extends StatelessWidget {
  const _FontPickerRow({required this.selected, required this.onSelect});
  final _FontOption selected;
  final ValueChanged<_FontOption> onSelect;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (final f in _fonts) ...[
          Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              onTap: () => onSelect(f),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: f.id == selected.id
                      ? AppColors.signalLime.withValues(alpha: 0.12)
                      : Colors.white.withValues(alpha: 0.03),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: f.id == selected.id
                        ? AppColors.signalLime
                        : Colors.white.withValues(alpha: 0.08),
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  f.label,
                  style: GoogleFonts.getFont(
                    f.googleFamily,
                    color: f.id == selected.id
                        ? AppColors.ink50
                        : AppColors.ink100,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
          if (f != _fonts.last) const SizedBox(width: 8),
        ],
      ],
    );
  }
}

/// Image-upload tile for the Image tab. Shows the picked image (or a hint)
/// plus two source buttons (Gallery + Camera) and a clear action.
class _ImagePickerCard extends StatelessWidget {
  const _ImagePickerCard({
    required this.bytes,
    required this.fileName,
    required this.state,
    required this.onPickGallery,
    required this.onPickCamera,
    required this.onClear,
  });
  final Uint8List? bytes;
  final String? fileName;
  final _UploadState state;
  final VoidCallback onPickGallery;
  final VoidCallback onPickCamera;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final hasImage = bytes != null;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: hasImage
              ? AppColors.signalLime.withValues(alpha: 0.4)
              : AppColors.paper300.withValues(alpha: 0.6),
          style: hasImage ? BorderStyle.solid : BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          if (hasImage)
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.memory(
                bytes!,
                height: 120,
                fit: BoxFit.contain,
              ),
            )
          else
            Column(
              children: [
                const Icon(
                  Icons.photo_library_outlined,
                  color: AppColors.ink300,
                  size: 28,
                ),
                const SizedBox(height: 8),
                Text(
                  'Drop PNG, JPG, SVG',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  'up to 5 MB · transparent recommended',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          const SizedBox(height: 12),
          if (hasImage && state == _UploadState.uploading)
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(strokeWidth: 1.6),
                ),
                SizedBox(width: 8),
                Text('Uploading…', style: TextStyle(fontSize: 12)),
              ],
            ),
          if (hasImage && state == _UploadState.done)
            Text(
              '✓ ${fileName ?? 'uploaded'}',
              style: const TextStyle(
                color: AppColors.signalLimeInk,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          if (hasImage && state == _UploadState.error)
            const Text(
              '⚠ Preview only — upload failed. Still prints from local copy on cart submit.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.signalCoral,
                fontSize: 11,
              ),
            ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onPickGallery,
                  icon: const Icon(Icons.image_outlined, size: 16),
                  label: Text(hasImage ? 'Replace' : 'Gallery'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onPickCamera,
                  icon: const Icon(Icons.photo_camera_outlined, size: 16),
                  label: const Text('Camera'),
                ),
              ),
              if (hasImage) ...[
                const SizedBox(width: 8),
                IconButton(
                  tooltip: 'Remove',
                  onPressed: onClear,
                  icon: const Icon(Icons.close, size: 18),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// 2-column grid of preset lines — mirrors web `PRESET_LINES`.
class _PresetLinesGrid extends StatelessWidget {
  const _PresetLinesGrid({required this.current, required this.onPick});
  final String current;
  final ValueChanged<String> onPick;

  static const _lines = <String>[
    'Building...',
    'v1.0',
    'No Days Off',
    'Offline Mode',
    'Custom Print',
    'Late Night Shipping',
    'Ship It',
    '0 -> 1',
    '404 / not found',
    '\$ npm run launch',
    '// founder mode',
    'Online forever',
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final line in _lines)
          _PresetChip(
            label: line,
            selected: line == current,
            onTap: () => onPick(line),
          ),
      ],
    );
  }
}

class _PresetChip extends StatelessWidget {
  const _PresetChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.signalLime.withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected
                ? AppColors.signalLime
                : Colors.white.withValues(alpha: 0.08),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Source Code Pro',
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: selected ? AppColors.ink50 : AppColors.ink100,
          ),
        ),
      ),
    );
  }
}

/// Four sliders + a reset button — mirrors the web Studio's "03 · Fine-tune"
/// card. Adjusts posX / posY / scale / rotation of the design overlay.
class _FineTuneCard extends StatelessWidget {
  const _FineTuneCard({
    required this.posX,
    required this.posY,
    required this.scale,
    required this.rotation,
    required this.onPosX,
    required this.onPosY,
    required this.onScale,
    required this.onRotation,
    required this.onReset,
  });
  final double posX;
  final double posY;
  final double scale;
  final double rotation;
  final ValueChanged<double> onPosX;
  final ValueChanged<double> onPosY;
  final ValueChanged<double> onScale;
  final ValueChanged<double> onRotation;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Drag directly on the mockup — or use the sliders.',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.ink300,
                  ),
                ),
              ),
              TextButton(
                onPressed: onReset,
                child: const Text('Reset'),
              ),
            ],
          ),
          const SizedBox(height: 4),
          _slider('Horizontal', posX, -50, 50, onPosX, suffix: '%'),
          _slider('Vertical', posY, -50, 50, onPosY, suffix: '%'),
          _slider('Scale', scale, 0.4, 1.6, onScale, step: 0.05),
          _slider('Rotate', rotation, -45, 45, onRotation, suffix: '°'),
        ],
      ),
    );
  }

  Widget _slider(
    String label,
    double value,
    double min,
    double max,
    ValueChanged<double> onChanged, {
    String suffix = '',
    double step = 1,
  }) {
    final display = value is int || value == value.roundToDouble()
        ? value.toInt().toString()
        : value.toStringAsFixed(2);
    return Row(
      children: [
        SizedBox(
          width: 76,
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Source Code Pro',
              fontSize: 10,
              color: AppColors.ink300,
              letterSpacing: 1.4,
            ),
          ),
        ),
        Expanded(
          child: Slider(
            value: value.clamp(min, max),
            min: min,
            max: max,
            divisions: ((max - min) / step).round(),
            activeColor: AppColors.signalLime,
            inactiveColor: AppColors.paper200,
            onChanged: onChanged,
          ),
        ),
        SizedBox(
          width: 40,
          child: Text(
            '$display$suffix',
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontFamily: 'Source Code Pro',
              fontSize: 11,
              color: AppColors.ink100,
            ),
          ),
        ),
      ],
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
                fontFamily: 'Source Code Pro',
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
                fontFamily: 'Source Code Pro',
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
                  fontFamily: 'Source Code Pro',
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
            fontFamily: 'Source Code Pro',
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
          color: AppColors.paper100,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.paper300),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: AppColors.auroraGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.inventory_2_outlined,
                  color: AppColors.brandCream, size: 20),
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
