import 'dart:io' show HttpClient;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/config/env.dart';
import '../core/theme/app_theme.dart';

/// Warm amber brand mark — matches web `BrandLogo.tsx`.
///
/// Long-press opens a hidden Developer menu for swapping the backend URL.
class BrandMark extends StatelessWidget {
  const BrandMark({
    super.key,
    this.size = 28,
    this.showWordmark = false,
    this.enableDevMenu = true,
  });

  final double size;
  final bool showWordmark;

  /// When true, long-pressing the mark opens the backend-URL dialog.
  final bool enableDevMenu;

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
            color: AppColors.brandAmberInk.withValues(alpha: 0.45),
            blurRadius: size * 0.6,
            spreadRadius: -size * 0.1,
          ),
        ],
      ),
      child: CustomPaint(painter: _GlyphPainter()),
    );

    final titleSize = size * 0.62;
    final wrapped = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        if (showWordmark) ...[
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text.rich(
                TextSpan(
                  style: GoogleFonts.sourceSans3(
                    fontSize: titleSize,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                    height: 1.0,
                  ),
                  children: const [
                    TextSpan(
                      text: 'The',
                      style: TextStyle(color: AppColors.paper900),
                    ),
                    TextSpan(
                      text: 'Wear',
                      style: TextStyle(color: AppColors.brandAmberInk),
                    ),
                    TextSpan(
                      text: 'Co',
                      style: TextStyle(color: AppColors.paper900),
                    ),
                  ],
                ),
              ),
              Text(
                'Shop it. Design it.',
                style: GoogleFonts.sourceCodePro(
                  fontSize: (titleSize * 0.38).clamp(8.0, 10.0),
                  letterSpacing: 1.8,
                  color: AppColors.paper500,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ],
        if (Env.isDemoMode) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.brandAmber.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: AppColors.brandAmber.withValues(alpha: 0.5),
              ),
            ),
            child: Text(
              'DEMO',
              style: GoogleFonts.sourceCodePro(
                fontSize: 9,
                letterSpacing: 1.3,
                fontWeight: FontWeight.w700,
                color: AppColors.brandAmberInk,
              ),
            ),
          ),
        ],
      ],
    );

    if (!enableDevMenu) return wrapped;

    return GestureDetector(
      onLongPress: () => _showDevMenu(context),
      behavior: HitTestBehavior.opaque,
      child: wrapped,
    );
  }

  Future<void> _showDevMenu(BuildContext context) async {
    HapticFeedback.mediumImpact();
    final ctl = TextEditingController(text: Env.apiBaseUrl);
    String? error;
    bool busy = false;
    bool? testResult;

    await showDialog<void>(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.75),
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (ctx, setLocal) {
            Future<void> test() async {
              setLocal(() {
                busy = true;
                error = null;
                testResult = null;
              });
              try {
                final rawInput = ctl.text.trim();
                final isDemoInput = rawInput.isEmpty ||
                    rawInput.toLowerCase().startsWith('demo') ||
                    rawInput.toLowerCase().startsWith('offline');
                if (isDemoInput) {
                  setLocal(() => testResult = true);
                  return;
                }
                final probe = rawInput.endsWith('/')
                    ? '${rawInput}health'
                    : rawInput.contains('/api/')
                        ? '$rawInput/health'
                        : '$rawInput/api/v1/health';
                final uri = Uri.parse(probe);
                final client = HttpClient()
                  ..connectionTimeout = const Duration(seconds: 6);
                final req = await client.getUrl(uri);
                final res = await req.close();
                setLocal(() {
                  testResult = res.statusCode == 200;
                  if (!testResult!) error = 'HTTP ${res.statusCode}';
                });
                client.close(force: true);
              } catch (e) {
                setLocal(() {
                  testResult = false;
                  final s = e.toString();
                  error = s.length > 80 ? '${s.substring(0, 77)}…' : s;
                });
              } finally {
                setLocal(() => busy = false);
              }
            }

            return AlertDialog(
              backgroundColor: AppColors.paper100,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
                side: BorderSide(
                  color: AppColors.brandAmber.withValues(alpha: 0.4),
                ),
              ),
              title: Row(
                children: [
                  const Icon(Icons.developer_mode,
                      color: AppColors.brandAmberInk, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Developer',
                    style: GoogleFonts.sourceSans3(
                      color: AppColors.paper900,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Backend URL',
                    style: GoogleFonts.sourceCodePro(
                      fontSize: 11,
                      letterSpacing: 1.2,
                      color: AppColors.paper600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: ctl,
                    style: GoogleFonts.sourceCodePro(
                      fontSize: 13,
                      color: AppColors.paper900,
                    ),
                    autocorrect: false,
                    enableSuggestions: false,
                    keyboardType: TextInputType.url,
                    decoration: InputDecoration(
                      isDense: true,
                      hintText: 'https://xxx.trycloudflare.com',
                      hintStyle: TextStyle(
                        color: AppColors.paper400,
                        fontFamily: GoogleFonts.sourceCodePro().fontFamily,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "We'll auto-append /api/v1 if you leave it off.",
                    style: TextStyle(
                      color: AppColors.paper500,
                      fontSize: 11,
                    ),
                  ),
                  if (testResult != null) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(
                          testResult! ? Icons.check_circle : Icons.error,
                          color: testResult!
                              ? AppColors.brandAmberInk
                              : AppColors.signalCoral,
                          size: 16,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            testResult!
                                ? 'Backend reachable'
                                : 'Unreachable${error == null ? '' : ' · $error'}',
                            style: TextStyle(
                              color: testResult!
                                  ? AppColors.brandAmberInk
                                  : AppColors.signalCoral,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 12),
                  Text(
                    'Built-in default:',
                    style: TextStyle(
                      color: AppColors.paper500,
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    Env.defaultApiBaseUrl,
                    style: GoogleFonts.sourceCodePro(
                      color: AppColors.paper600,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              actionsPadding:
                  const EdgeInsets.only(right: 12, bottom: 10, left: 12),
              actions: [
                TextButton(
                  onPressed: busy
                      ? null
                      : () async {
                          await Env.clearOverride();
                          ctl.text = Env.apiBaseUrl;
                          setLocal(() {});
                        },
                  child: const Text('Reset',
                      style: TextStyle(color: AppColors.paper700)),
                ),
                TextButton(
                  onPressed: busy ? null : test,
                  child: Text(
                    busy ? 'Testing…' : 'Test',
                    style: const TextStyle(color: AppColors.brandAmberInk),
                  ),
                ),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.brandAmberInk,
                  ),
                  onPressed: busy
                      ? null
                      : () async {
                          await Env.setOverride(ctl.text);
                          if (dialogCtx.mounted) {
                            Navigator.of(dialogCtx).pop();
                          }
                        },
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

/// Stacked diamond layers — same silhouette as the web BrandLogo SVG.
class _GlyphPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 24;
    double x(double v) => v * scale;
    double y(double v) => v * scale;

    final glyph = AppColors.brandCream;

    final diamond = Path()
      ..moveTo(x(4), y(8.5))
      ..lineTo(x(12), y(4))
      ..lineTo(x(20), y(8.5))
      ..lineTo(x(12), y(13))
      ..close();
    canvas.drawPath(
      diamond,
      Paint()
        ..color = glyph
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width * (2.15 / 24)
        ..strokeJoin = StrokeJoin.round
        ..strokeCap = StrokeCap.round,
    );

    final stroke = Paint()
      ..color = glyph.withValues(alpha: 0.85)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * (2.15 / 24)
      ..strokeJoin = StrokeJoin.round
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(
      Path()
        ..moveTo(x(4), y(12.5))
        ..lineTo(x(12), y(17))
        ..lineTo(x(20), y(12.5)),
      stroke,
    );

    canvas.drawPath(
      Path()
        ..moveTo(x(4), y(16))
        ..lineTo(x(12), y(20.5))
        ..lineTo(x(20), y(16)),
      stroke..color = glyph.withValues(alpha: 0.65),
    );
  }

  @override
  bool shouldRepaint(_GlyphPainter oldDelegate) => false;
}
