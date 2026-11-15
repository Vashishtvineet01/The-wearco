import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

/// The aurora-gradient stacked-diamond mark — same silhouette as the web
/// navbar logo. Drop this in any AppBar title or splash element for
/// instant brand recognition.
class BrandMark extends StatelessWidget {
  const BrandMark({
    super.key,
    this.size = 28,
    this.showWordmark = false,
  });

  final double size;
  final bool showWordmark;

  @override
  Widget build(BuildContext context) {
    final mark = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: AppColors.auroraGradient,
        borderRadius: BorderRadius.circular(size * 0.22),
        boxShadow: [
          BoxShadow(
            color: AppColors.signalViolet.withValues(alpha: 0.45),
            blurRadius: size * 0.6,
            spreadRadius: -size * 0.1,
          ),
        ],
      ),
      child: CustomPaint(painter: _GlyphPainter()),
    );

    if (!showWordmark) return mark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        const SizedBox(width: 10),
        Text(
          'TheWearCo',
          style: TextStyle(
            fontFamily: 'SpaceGrotesk',
            fontSize: size * 0.62,
            fontWeight: FontWeight.w700,
            color: AppColors.ink50,
            letterSpacing: -0.3,
          ),
        ),
      ],
    );
  }
}

class _GlyphPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Reproduces the SVG glyph:  diamond lid on top, then two chevron folds.
    // Original is on a 24-unit grid — scale into the box.
    final scale = size.width / 24;
    double x(double v) => v * scale;
    double y(double v) => v * scale;

    final glyph = const Color(0xFF0B0A14).withValues(alpha: 0.92);

    // Filled diamond lid
    final diamond = Path()
      ..moveTo(x(3), y(7))
      ..lineTo(x(12), y(2))
      ..lineTo(x(21), y(7))
      ..lineTo(x(12), y(12))
      ..close();
    canvas.drawPath(diamond, Paint()..color = glyph);

    // Two chevron folds
    final stroke = Paint()
      ..color = glyph
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * (2.2 / 24)
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;

    final mid = Path()
      ..moveTo(x(3), y(12))
      ..lineTo(x(12), y(17))
      ..lineTo(x(21), y(12));
    canvas.drawPath(mid, stroke);

    final bot = Path()
      ..moveTo(x(3), y(17))
      ..lineTo(x(12), y(22))
      ..lineTo(x(21), y(17));
    canvas.drawPath(bot, stroke);
  }

  @override
  bool shouldRepaint(_GlyphPainter oldDelegate) => false;
}
