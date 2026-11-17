import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

/// Full-page brand loader — mirrors the web `<BrandLoader />`.
///
/// Shows a spinning 5-colour aurora conic ring with a pulsing lime core,
/// then an eyebrow + headline underneath with a 3-dot bounce.
///
/// Usage:
/// ```dart
/// if (isLoading) const BrandLoader(eyebrow: 'Loading shop', title: 'Fetching the drops.');
/// ```
class BrandLoader extends StatefulWidget {
  const BrandLoader({
    super.key,
    this.eyebrow = 'Loading',
    this.title = 'Spinning up your canvas.',
  });

  final String eyebrow;
  final String title;

  @override
  State<BrandLoader> createState() => _BrandLoaderState();
}

class _BrandLoaderState extends State<BrandLoader>
    with TickerProviderStateMixin {
  late final AnimationController _spin;
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _spin.dispose();
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 92,
              height: 92,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Soft blurred aurora glow behind the ring.
                  Container(
                    width: 120,
                    height: 120,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: SweepGradient(
                        colors: [
                          AppColors.signalViolet,
                          AppColors.signalCoral,
                          AppColors.signalLime,
                          AppColors.signalSky,
                          AppColors.signalViolet,
                        ],
                      ),
                    ),
                    // Fake "blur" with low opacity.
                    foregroundDecoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.paper50.withValues(alpha: 0.55),
                    ),
                  ),
                  // Spinning conic ring — painter draws a thin stroke with
                  // the sweep gradient rotated by _spin.value.
                  AnimatedBuilder(
                    animation: _spin,
                    builder: (context, _) {
                      return SizedBox(
                        width: 76,
                        height: 76,
                        child: CustomPaint(
                          painter: _RingPainter(
                              rotation: _spin.value * 2 * math.pi),
                        ),
                      );
                    },
                  ),
                  // Pulsing lime core.
                  AnimatedBuilder(
                    animation: _pulse,
                    builder: (context, _) {
                      final t =
                          0.6 + 0.4 * (0.5 + 0.5 * _pulse.value);
                      return Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.signalLime
                              .withValues(alpha: t),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.signalLime
                                  .withValues(alpha: 0.5 * t),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            // Eyebrow with blinking dot.
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedBuilder(
                  animation: _pulse,
                  builder: (context, _) => Container(
                    width: 6,
                    height: 6,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.signalLime
                          .withValues(alpha: 0.5 + 0.5 * _pulse.value),
                    ),
                  ),
                ),
                Text(
                  '// ${widget.eyebrow.toUpperCase()}',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    letterSpacing: 2.5,
                    color: AppColors.signalLimeInk,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Gradient headline.
            ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  AppColors.signalViolet,
                  AppColors.signalCoral,
                  AppColors.signalLime,
                ],
              ).createShader(bounds),
              child: Text(
                widget.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.4,
                ),
              ),
            ),
            const SizedBox(height: 12),
            // "almost there •••" with bouncing dots.
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'almost there',
                  style: TextStyle(
                    color: AppColors.paper600,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(width: 6),
                _BouncingDots(controller: _pulse),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Three dots that fade in a staggered loop, tied to the shared pulse
/// controller so we don't spawn a second AnimationController per loader.
class _BouncingDots extends StatelessWidget {
  const _BouncingDots({required this.controller});
  final AnimationController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final t = controller.value;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final staggered = ((t - i * 0.2) % 1.0).clamp(0.0, 1.0);
            final opacity =
                (0.3 + 0.7 * (1 - (staggered - 0.5).abs() * 2))
                    .clamp(0.15, 1.0);
            return Padding(
              padding: EdgeInsets.only(right: i == 2 ? 0 : 3),
              child: Container(
                width: 4,
                height: 4,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.signalLimeInk
                      .withValues(alpha: opacity),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}

/// Paints a 3px-thick conic-gradient ring. The sweep gradient rotates by
/// `rotation` radians each frame to create the spin effect without
/// needing a Transform.rotate (which would also rotate the paint origin).
class _RingPainter extends CustomPainter {
  _RingPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 1.5;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final gradient = SweepGradient(
      startAngle: 0,
      endAngle: 2 * math.pi,
      transform: GradientRotation(rotation),
      colors: const [
        AppColors.signalViolet,
        AppColors.signalCoral,
        AppColors.signalLime,
        AppColors.signalSky,
        AppColors.signalViolet,
      ],
    );

    final paint = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.rotation != rotation;
}
