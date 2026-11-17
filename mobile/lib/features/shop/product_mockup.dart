import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';

/// Lightweight product mockup for mobile — draws a schematic garment of the
/// right category with a text overlay in the print area. Not pixel-perfect,
/// but gives the user a tactile sense of the product. The real SVG renderer
/// lives on the web; the mobile port will replace this with a shared asset
/// pipeline once the Studio ships.
class MobileProductMockup extends StatelessWidget {
  const MobileProductMockup({
    super.key,
    required this.category,
    required this.fabricHex,
    required this.printShape,
    this.printText,
    this.printTextColor,
    this.compact = false,
  });

  final String category;
  final String fabricHex;
  final String printShape; // rect | circle | cylinder | full
  final String? printText;
  final String? printTextColor;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final fabric = Color(parseHexColor(fabricHex));
    final isLight = _isLight(fabric);
    final textColor = printTextColor != null
        ? Color(parseHexColor(printTextColor!))
        : (isLight ? Colors.black : AppColors.ink50);

    return AspectRatio(
      aspectRatio: 1,
      child: CustomPaint(
        painter: _GarmentPainter(
          category: category,
          fabric: fabric,
          printShape: printShape,
          printText: printText,
          textColor: textColor,
          compact: compact,
        ),
      ),
    );
  }

  bool _isLight(Color c) {
    final r = (c.r * 255).round();
    final g = (c.g * 255).round();
    final b = (c.b * 255).round();
    final yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq > 160;
  }

  /// Normalised print area (x, y, w, h all in 0..1) for a given category.
  ///
  /// Keeps parity with the painter's `_printRect()` — just divided by 400
  /// (the viewBox we scale from). Used by the Design canvas to place a
  /// text / image overlay exactly where the painter would draw text, so
  /// drag-to-position, scale and rotate controls line up with the fabric.
  static Rect printAreaFor(String category) {
    switch (category) {
      case 'hoodie':
        return const Rect.fromLTWH(128 / 400, 128 / 400, 144 / 400, 112 / 400);
      case 'sweatshirt':
        return const Rect.fromLTWH(120 / 400, 128 / 400, 160 / 400, 112 / 400);
      case 'cap':
        return const Rect.fromLTWH(120 / 400, 140 / 400, 160 / 400, 72 / 400);
      case 'mug':
        return const Rect.fromLTWH(100 / 400, 152 / 400, 176 / 400, 112 / 400);
      case 'badge':
        return const Rect.fromLTWH(112 / 400, 112 / 400, 176 / 400, 176 / 400);
      case 'poster':
        return const Rect.fromLTWH(56 / 400, 56 / 400, 288 / 400, 288 / 400);
      case 'tee':
      case 'sleeve':
      default:
        return const Rect.fromLTWH(120 / 400, 112 / 400, 160 / 400, 120 / 400);
    }
  }
}

class _GarmentPainter extends CustomPainter {
  _GarmentPainter({
    required this.category,
    required this.fabric,
    required this.printShape,
    required this.printText,
    required this.textColor,
    required this.compact,
  });

  final String category;
  final Color fabric;
  final String printShape;
  final String? printText;
  final Color textColor;
  final bool compact;

  @override
  void paint(Canvas canvas, Size size) {
    final fabricPaint = Paint()..color = fabric;
    final strokePaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Scale from the web's 400x400 viewBox to the real canvas.
    final s = size.width / 400;
    canvas.scale(s, s);

    switch (category) {
      case 'hoodie':
        _drawHoodie(canvas, fabricPaint, strokePaint);
        break;
      case 'sweatshirt':
        _drawSweatshirt(canvas, fabricPaint, strokePaint);
        break;
      case 'cap':
        _drawCap(canvas, fabricPaint, strokePaint);
        break;
      case 'mug':
        _drawMug(canvas, fabricPaint, strokePaint);
        break;
      case 'badge':
        _drawBadge(canvas, fabricPaint, strokePaint);
        break;
      case 'poster':
        _drawPoster(canvas, fabricPaint, strokePaint);
        break;
      case 'tee':
      case 'sleeve':
      default:
        _drawTee(canvas, fabricPaint, strokePaint);
    }

    // Text overlay — keeps parity with the web preview
    if (printText != null && printText!.trim().isNotEmpty) {
      final overlay = _printRect();
      _drawPrintText(canvas, overlay);
    }
  }

  Rect _printRect() {
    switch (category) {
      case 'hoodie':
        return const Rect.fromLTWH(128, 128, 144, 112);
      case 'sweatshirt':
        return const Rect.fromLTWH(120, 128, 160, 112);
      case 'cap':
        return const Rect.fromLTWH(120, 140, 160, 72);
      case 'mug':
        return const Rect.fromLTWH(100, 152, 176, 112);
      case 'badge':
        return const Rect.fromLTWH(112, 112, 176, 176);
      case 'poster':
        return const Rect.fromLTWH(56, 56, 288, 288);
      default:
        return const Rect.fromLTWH(120, 112, 160, 120);
    }
  }

  /// Normalise the print label the same way the web does:
  /// short first word stays as-is, longer first words get trimmed to 5 chars.
  /// Prevents "Building" from wrapping to "Buildi/ng…" on small print areas.
  String _normalise(String raw) {
    final first =
        raw.trim().split(RegExp(r'\s+')).first.replaceAll(RegExp(r'[….]+$'), '');
    final short = first.length <= 7 ? first : first.substring(0, 5);
    return short.toUpperCase();
  }

  void _drawPrintText(Canvas canvas, Rect rect) {
    final label = _normalise(printText!);
    final maxW = rect.width - 16;
    // Auto-fit: start at the max font and step down until the label fits on
    // a single line inside the print area. 18→38 in viewBox units.
    final baseMax = compact ? 30.0 : 42.0;
    const baseMin = 16.0;
    double fontSize = baseMax;
    late TextPainter tp;
    while (fontSize >= baseMin) {
      tp = TextPainter(
        text: TextSpan(
          text: label,
          style: TextStyle(
            color: textColor,
            fontSize: fontSize,
            fontWeight: FontWeight.w800,
            height: 1.0,
            letterSpacing: -0.4,
            fontFamily: 'SpaceGrotesk',
          ),
        ),
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
        maxLines: 1,
        ellipsis: '…',
      );
      tp.layout();
      if (tp.width <= maxW && tp.height <= rect.height - 6) break;
      fontSize -= 2;
    }
    // Final layout with the chosen size, this time constrained so ellipsis
    // kicks in if we somehow still overflow.
    tp.layout(maxWidth: maxW);
    final offset = Offset(
      rect.left + (rect.width - tp.width) / 2,
      rect.top + (rect.height - tp.height) / 2,
    );
    if (printShape == 'circle') {
      canvas.save();
      final clipPath = Path()
        ..addOval(Rect.fromCircle(center: rect.center, radius: rect.width / 2));
      canvas.clipPath(clipPath);
      tp.paint(canvas, offset);
      canvas.restore();
    } else {
      tp.paint(canvas, offset);
    }
  }

  /// Soft top-light fabric gradient — brighter at the top, darker at the hem.
  Paint _fabricShadePaint(Rect bounds) {
    return Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Colors.white.withValues(alpha: 0.10),
          Colors.white.withValues(alpha: 0.0),
          Colors.black.withValues(alpha: 0.30),
        ],
        stops: const [0.0, 0.55, 1.0],
      ).createShader(bounds);
  }

  /// Side shading for sleeves / edges — darker on the outside, invisible toward the centre.
  Paint _sideShadePaint(Rect bounds, {required bool fromLeft}) {
    return Paint()
      ..shader = LinearGradient(
        begin: fromLeft ? Alignment.centerLeft : Alignment.centerRight,
        end: fromLeft ? Alignment.centerRight : Alignment.centerLeft,
        colors: [
          Colors.black.withValues(alpha: 0.32),
          Colors.black.withValues(alpha: 0.0),
        ],
      ).createShader(bounds);
  }

  /// Subtle stitching line.
  Paint _stitchPaint() => Paint()
    ..color = Colors.black.withValues(alpha: 0.22)
    ..strokeWidth = 0.8
    ..style = PaintingStyle.stroke;

  /// Small fabric label tab at the collar.
  void _drawCollarLabel(Canvas canvas, double x, double y) {
    final labelPaint = Paint()..color = Colors.white.withValues(alpha: 0.35);
    final r = RRect.fromRectAndRadius(
      Rect.fromLTWH(x - 7, y, 14, 4),
      const Radius.circular(1),
    );
    canvas.drawRRect(r, labelPaint);
  }

  void _drawTee(Canvas canvas, Paint fill, Paint stroke) {
    final path = Path()
      ..moveTo(80, 110)
      ..lineTo(140, 70)
      ..lineTo(160, 90)
      ..quadraticBezierTo(200, 110, 240, 90)
      ..lineTo(260, 70)
      ..lineTo(320, 110)
      ..lineTo(300, 170)
      ..lineTo(270, 160)
      ..lineTo(270, 340)
      ..quadraticBezierTo(270, 350, 260, 350)
      ..lineTo(140, 350)
      ..quadraticBezierTo(130, 350, 130, 340)
      ..lineTo(130, 160)
      ..lineTo(100, 170)
      ..close();
    final bounds = path.getBounds();
    canvas.drawPath(path, fill);
    // Fabric shading overlay (clipped to the garment).
    canvas.save();
    canvas.clipPath(path);
    canvas.drawRect(bounds, _fabricShadePaint(bounds));
    // Side shadings
    canvas.drawRect(
      Rect.fromLTRB(bounds.left, bounds.top, bounds.left + 80, bounds.bottom),
      _sideShadePaint(
        Rect.fromLTRB(bounds.left, bounds.top, bounds.left + 80, bounds.bottom),
        fromLeft: true,
      ),
    );
    canvas.drawRect(
      Rect.fromLTRB(bounds.right - 80, bounds.top, bounds.right, bounds.bottom),
      _sideShadePaint(
        Rect.fromLTRB(bounds.right - 80, bounds.top, bounds.right, bounds.bottom),
        fromLeft: false,
      ),
    );
    canvas.restore();
    canvas.drawPath(path, stroke);
    // Neck ribbing
    final neck = Path()
      ..moveTo(160, 90)
      ..quadraticBezierTo(200, 115, 240, 90);
    canvas.drawPath(
      neck,
      Paint()
        ..color = Colors.black.withValues(alpha: 0.45)
        ..strokeWidth = 2.2
        ..style = PaintingStyle.stroke,
    );
    // Shoulder stitches
    final ss = _stitchPaint()..strokeWidth = 0.8;
    canvas.drawPath(
      Path()
        ..moveTo(158, 93)
        ..quadraticBezierTo(168, 100, 180, 102),
      ss,
    );
    canvas.drawPath(
      Path()
        ..moveTo(242, 93)
        ..quadraticBezierTo(232, 100, 220, 102),
      ss,
    );
    // Side seam dashes (manual dashing)
    _drawDashedLine(canvas, const Offset(138, 165), const Offset(138, 350));
    _drawDashedLine(canvas, const Offset(262, 165), const Offset(262, 350));
    _drawDashedLine(canvas, const Offset(135, 342), const Offset(265, 342));
    // Collar label tab
    _drawCollarLabel(canvas, 200, 108);
  }

  void _drawDashedLine(Canvas canvas, Offset a, Offset b,
      {double dash = 2, double gap = 3}) {
    final paint = _stitchPaint();
    final total = (b - a).distance;
    final dir = (b - a) / total;
    double t = 0;
    while (t < total) {
      final start = a + dir * t;
      final end = a + dir * (t + dash).clamp(0, total);
      canvas.drawLine(start, end, paint);
      t += dash + gap;
    }
  }

  void _drawHoodie(Canvas canvas, Paint fill, Paint stroke) {
    final body = Path()
      ..moveTo(70, 130)
      ..lineTo(130, 80)
      ..quadraticBezierTo(150, 60, 200, 60)
      ..quadraticBezierTo(250, 60, 270, 80)
      ..lineTo(330, 130)
      ..lineTo(310, 200)
      ..lineTo(280, 190)
      ..lineTo(280, 350)
      ..quadraticBezierTo(280, 360, 270, 360)
      ..lineTo(130, 360)
      ..quadraticBezierTo(120, 360, 120, 350)
      ..lineTo(120, 190)
      ..lineTo(90, 200)
      ..close();
    canvas.drawPath(body, fill);
    canvas.drawPath(body, stroke);

    final hood = Path()
      ..moveTo(150, 90)
      ..quadraticBezierTo(200, 40, 250, 90)
      ..quadraticBezierTo(230, 70, 200, 70)
      ..quadraticBezierTo(170, 70, 150, 90)
      ..close();
    canvas.drawPath(hood, fill);
    canvas.drawPath(hood, stroke);
  }

  void _drawSweatshirt(Canvas canvas, Paint fill, Paint stroke) {
    final path = Path()
      ..moveTo(70, 125)
      ..lineTo(130, 80)
      ..quadraticBezierTo(155, 65, 200, 65)
      ..quadraticBezierTo(245, 65, 270, 80)
      ..lineTo(330, 125)
      ..lineTo(310, 195)
      ..lineTo(280, 185)
      ..lineTo(280, 345)
      ..quadraticBezierTo(280, 355, 270, 355)
      ..lineTo(130, 355)
      ..quadraticBezierTo(120, 355, 120, 345)
      ..lineTo(120, 185)
      ..lineTo(90, 195)
      ..close();
    canvas.drawPath(path, fill);
    canvas.drawPath(path, stroke);

    final hem = Paint()..color = Colors.black.withValues(alpha: 0.18);
    canvas.drawRect(const Rect.fromLTWH(120, 340, 160, 15), hem);
  }

  void _drawCap(Canvas canvas, Paint fill, Paint stroke) {
    final brim = Path()
      ..moveTo(90, 240)
      ..quadraticBezierTo(200, 290, 310, 240)
      ..lineTo(320, 260)
      ..quadraticBezierTo(200, 320, 80, 260)
      ..close();
    canvas.drawPath(brim, fill);
    canvas.drawPath(brim, stroke);

    final crown = Path()
      ..moveTo(120, 240)
      ..quadraticBezierTo(120, 130, 200, 130)
      ..quadraticBezierTo(280, 130, 280, 240)
      ..close();
    canvas.drawPath(crown, fill);
    canvas.drawPath(crown, stroke);
  }

  void _drawMug(Canvas canvas, Paint fill, Paint stroke) {
    // Handle (drawn behind body)
    final handlePaint = Paint()
      ..color = fill.color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 18;
    final handle = Path()
      ..moveTo(280, 170)
      ..quadraticBezierTo(340, 170, 340, 230)
      ..quadraticBezierTo(340, 290, 280, 290);
    canvas.drawPath(handle, handlePaint);

    final rrect = RRect.fromRectAndRadius(
      const Rect.fromLTWH(100, 130, 180, 200),
      const Radius.circular(14),
    );
    canvas.drawRRect(rrect, fill);
    canvas.drawRRect(rrect, stroke);

    // Rim darkening
    final rim = Paint()
      ..color = Colors.black.withValues(alpha: 0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawLine(const Offset(100, 148), const Offset(280, 148), rim);
  }

  void _drawBadge(Canvas canvas, Paint fill, Paint stroke) {
    final clip = Paint()..color = const Color(0xFF888888);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(194, 80, 12, 20),
        const Radius.circular(3),
      ),
      clip,
    );
    canvas.drawCircle(const Offset(200, 220), 130, fill);
    canvas.drawCircle(const Offset(200, 220), 130, stroke);
  }

  void _drawPoster(Canvas canvas, Paint fill, Paint stroke) {
    // Shadow
    final shadow = Paint()..color = Colors.black.withValues(alpha: 0.35);
    canvas.drawRect(const Rect.fromLTWH(42, 42, 320, 320), shadow);
    // Paper
    canvas.drawRect(const Rect.fromLTWH(38, 38, 320, 320), fill);
    canvas.drawRect(const Rect.fromLTWH(38, 38, 320, 320), stroke);
  }

  @override
  bool shouldRepaint(_GarmentPainter oldDelegate) =>
      oldDelegate.category != category ||
      oldDelegate.fabric != fabric ||
      oldDelegate.printShape != printShape ||
      oldDelegate.printText != printText ||
      oldDelegate.textColor != textColor;
}
