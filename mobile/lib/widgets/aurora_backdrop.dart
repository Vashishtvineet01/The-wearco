import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

/// Decorative aurora wash — mobile equivalent of the web's `<Aurora />`
/// component + `spotlight-*` utility classes.
///
/// Drops a stack of soft radial colour blobs behind the screen content so
/// the paper base doesn't read as flat white. Each blob is a large blurred
/// circle with low alpha. Optionally scatters three floating `✦` sparkles
/// over the top for extra personality.
///
/// Usage:
/// ```dart
/// Scaffold(
///   body: AuroraBackdrop(
///     palette: AuroraPalette.violet,
///     child: ListView(children: [...]),
///   ),
/// );
/// ```
enum AuroraPalette { violet, sunrise, ocean, mint }

class AuroraBackdrop extends StatelessWidget {
  const AuroraBackdrop({
    super.key,
    required this.child,
    this.palette = AuroraPalette.violet,
    this.sparkles = true,
    this.intensity = 1.0,
  });

  final Widget child;
  final AuroraPalette palette;
  final bool sparkles;

  /// Multiplier on blob opacity. 1.0 = default, 0.6 = whisper, 1.4 = loud.
  final double intensity;

  List<_Blob> _blobs() {
    switch (palette) {
      case AuroraPalette.violet:
        return const [
          _Blob(AppColors.signalViolet, 420, Alignment(-1.2, -1.1), 0.22),
          _Blob(AppColors.signalCoral, 380, Alignment(1.1, -1.0), 0.18),
          _Blob(AppColors.signalLime, 340, Alignment(0.0, 1.2), 0.18),
          _Blob(AppColors.signalPeach, 300, Alignment(1.1, 1.2), 0.14),
        ];
      case AuroraPalette.sunrise:
        return const [
          _Blob(AppColors.signalCoral, 440, Alignment(-1.2, -1.1), 0.22),
          _Blob(AppColors.signalViolet, 380, Alignment(1.1, -1.0), 0.18),
          _Blob(AppColors.signalLime, 340, Alignment(0.6, 1.2), 0.18),
          _Blob(AppColors.signalSky, 300, Alignment(-1.0, 1.2), 0.14),
        ];
      case AuroraPalette.ocean:
        return const [
          _Blob(AppColors.signalViolet, 420, Alignment(-1.2, -1.1), 0.22),
          _Blob(AppColors.signalSky, 360, Alignment(1.1, -1.0), 0.18),
          _Blob(AppColors.signalLime, 340, Alignment(0.0, 1.2), 0.16),
          _Blob(AppColors.signalPeach, 300, Alignment(1.1, 1.2), 0.14),
        ];
      case AuroraPalette.mint:
        return const [
          _Blob(AppColors.signalMint, 420, Alignment(-1.2, -1.1), 0.22),
          _Blob(AppColors.signalSky, 380, Alignment(1.1, -1.0), 0.18),
          _Blob(AppColors.signalLime, 340, Alignment(0.0, 1.2), 0.18),
          _Blob(AppColors.signalViolet, 300, Alignment(1.1, 1.2), 0.12),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final blobs = _blobs();
    return RepaintBoundary(
      child: Stack(
        children: [
          // Lightest paper base so the blobs blend cleanly.
          const Positioned.fill(
            child: ColoredBox(color: AppColors.paper50),
          ),
          // Soft radial washes.
          for (final b in blobs)
            Positioned.fill(
              child: IgnorePointer(
                child: Align(
                  alignment: b.align,
                  child: Container(
                    width: b.size,
                    height: b.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          b.color
                              .withValues(alpha: b.opacity * intensity),
                          b.color.withValues(alpha: 0),
                        ],
                        stops: const [0.0, 1.0],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          // Floating sparkles.
          if (sparkles) const _Sparkles(),
          // Actual screen content on top.
          child,
        ],
      ),
    );
  }
}

class _Blob {
  const _Blob(this.color, this.size, this.align, this.opacity);
  final Color color;
  final double size;
  final Alignment align;
  final double opacity;
}

/// Three ✦ marks that drift up-and-down. Pure cosmetic.
class _Sparkles extends StatefulWidget {
  const _Sparkles();

  @override
  State<_Sparkles> createState() => _SparklesState();
}

class _SparklesState extends State<_Sparkles>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: AnimatedBuilder(
          animation: _c,
          builder: (context, _) {
            final t = _c.value * 2 * math.pi;
            return Stack(
              children: [
                _Sparkle(
                  offset: Alignment(-0.6, -0.75 + 0.05 * math.sin(t)),
                  color: AppColors.signalViolet.withValues(alpha: 0.55),
                  size: 22,
                ),
                _Sparkle(
                  offset:
                      Alignment(0.7, -0.6 + 0.05 * math.sin(t + 2.0)),
                  color: AppColors.signalCoral.withValues(alpha: 0.55),
                  size: 18,
                ),
                _Sparkle(
                  offset:
                      Alignment(0.4, 0.75 + 0.05 * math.sin(t + 4.0)),
                  color: AppColors.signalLimeInk.withValues(alpha: 0.6),
                  size: 16,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Sparkle extends StatelessWidget {
  const _Sparkle({
    required this.offset,
    required this.color,
    required this.size,
  });
  final Alignment offset;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: offset,
      child: Text(
        '✦',
        style: TextStyle(color: color, fontSize: size),
      ),
    );
  }
}
