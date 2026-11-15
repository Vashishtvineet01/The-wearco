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
      ..color = Colors.black.withOpacity(0.4)
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

  void _drawPrintText(Canvas canvas, Rect rect) {
    final tp = TextPainter(
      text: TextSpan(
        text: printText!.trim(),
        style: TextStyle(
          color: textColor,
          fontSize: compact ? 26 : 40,
          fontWeight: FontWeight.w800,
          height: 1.0,
          fontFamily: 'SpaceGrotesk',
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
      maxLines: 2,
      ellipsis: '…',
    );
    tp.layout(maxWidth: rect.width - 12);
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
    canvas.drawPath(path, fill);
    canvas.drawPath(path, stroke);
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

    final hem = Paint()..color = Colors.black.withOpacity(0.18);
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
      ..color = Colors.black.withOpacity(0.25)
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
    final shadow = Paint()..color = Colors.black.withOpacity(0.35);
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
