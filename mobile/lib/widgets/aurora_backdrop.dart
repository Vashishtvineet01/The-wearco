import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

/// Cream page wash — mobile equivalent of the web flat paper base.
///
/// Kept as `AuroraBackdrop` / `AuroraPalette` so shell call sites don't
/// change; washes are now subtle warm amber / parchment only (no neon).
enum AuroraPalette { violet, sunrise, ocean, mint }

class AuroraBackdrop extends StatelessWidget {
  const AuroraBackdrop({
    super.key,
    required this.child,
    this.palette = AuroraPalette.violet,
    this.sparkles = false,
    this.intensity = 1.0,
  });

  final Widget child;
  final AuroraPalette palette;
  final bool sparkles;

  /// Multiplier on blob opacity. Kept for API compat; cream look uses low alpha.
  final double intensity;

  List<_Blob> _blobs() {
    // Soft amber / espresso whispers only — matches web cream, not mesh.
    switch (palette) {
      case AuroraPalette.violet:
      case AuroraPalette.sunrise:
        return const [
          _Blob(AppColors.brandAmber, 420, Alignment(-1.1, -1.0), 0.08),
          _Blob(AppColors.brandGold, 360, Alignment(1.0, -0.8), 0.06),
          _Blob(AppColors.brandEspresso, 300, Alignment(0.2, 1.1), 0.04),
        ];
      case AuroraPalette.ocean:
        return const [
          _Blob(AppColors.signalSky, 400, Alignment(-1.0, -1.0), 0.05),
          _Blob(AppColors.brandAmber, 340, Alignment(1.0, 0.2), 0.05),
        ];
      case AuroraPalette.mint:
        return const [
          _Blob(AppColors.signalMint, 400, Alignment(-1.0, -1.0), 0.05),
          _Blob(AppColors.brandAmber, 340, Alignment(1.0, 1.0), 0.05),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final blobs = _blobs();
    return RepaintBoundary(
      child: Stack(
        children: [
          const Positioned.fill(
            child: ColoredBox(color: AppColors.paper50),
          ),
          // Dot-grid parchment texture (web body::after).
          Positioned.fill(
            child: CustomPaint(
              painter: _DotGridPainter(
                color: const Color(0x145A4632),
              ),
            ),
          ),
          for (final b in blobs)
            Align(
              alignment: b.align,
              child: IgnorePointer(
                child: Container(
                  width: b.size,
                  height: b.size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        b.color.withValues(alpha: b.alpha * intensity),
                        b.color.withValues(alpha: 0),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          child,
        ],
      ),
    );
  }
}

class _Blob {
  const _Blob(this.color, this.size, this.align, this.alpha);
  final Color color;
  final double size;
  final Alignment align;
  final double alpha;
}

class _DotGridPainter extends CustomPainter {
  _DotGridPainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    const step = 22.0;
    for (double y = 0; y < size.height; y += step) {
      for (double x = 0; x < size.width; x += step) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DotGridPainter oldDelegate) =>
      oldDelegate.color != color;
}
