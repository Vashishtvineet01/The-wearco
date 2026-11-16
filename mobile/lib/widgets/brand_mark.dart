import 'dart:io' show HttpClient;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/config/env.dart';
import '../core/theme/app_theme.dart';

/// The aurora-gradient stacked-diamond mark — same silhouette as the web
/// navbar logo. Drop this in any AppBar title or splash element for
/// instant brand recognition.
///
/// Long-press the mark to open a hidden Developer menu for swapping the
/// backend URL at runtime — critical during tester distribution.
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
  /// Default on — the gesture is well-hidden from end users.
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
            color: AppColors.signalViolet.withValues(alpha: 0.45),
            blurRadius: size * 0.6,
            spreadRadius: -size * 0.1,
          ),
        ],
      ),
      child: CustomPaint(painter: _GlyphPainter()),
    );

    final wrapped = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        mark,
        if (showWordmark) ...[
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
        // Demo-mode badge: tiny chip next to the brand that signals to
        // testers 'nothing here gets sent to the real backend'.
        if (Env.isDemoMode) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.signalLime.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: AppColors.signalLime.withValues(alpha: 0.5),
              ),
            ),
            child: const Text(
              'DEMO',
              style: TextStyle(
                fontFamily: 'JetBrainsMono',
                fontSize: 9,
                letterSpacing: 1.3,
                fontWeight: FontWeight.w700,
                color: AppColors.signalLime,
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
                // Demo mode always passes — it's served from bundled assets.
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
                  // Keep the message short — the dialog is tight.
                  final s = e.toString();
                  error = s.length > 80 ? '${s.substring(0, 77)}…' : s;
                });
              } finally {
                setLocal(() => busy = false);
              }
            }

            return AlertDialog(
              backgroundColor: AppColors.ink900,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
                side: BorderSide(
                  color: AppColors.signalViolet.withValues(alpha: 0.4),
                ),
              ),
              title: Row(
                children: const [
                  Icon(Icons.developer_mode,
                      color: AppColors.signalLime, size: 20),
                  SizedBox(width: 8),
                  Text('Developer',
                      style: TextStyle(
                        color: AppColors.ink50,
                        fontFamily: 'SpaceGrotesk',
                        fontWeight: FontWeight.w700,
                      )),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Backend URL',
                    style: TextStyle(
                      color: AppColors.ink50.withValues(alpha: 0.6),
                      fontFamily: 'JetBrainsMono',
                      fontSize: 11,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: ctl,
                    style: const TextStyle(
                      fontFamily: 'JetBrainsMono',
                      fontSize: 13,
                      color: AppColors.ink50,
                    ),
                    autocorrect: false,
                    enableSuggestions: false,
                    keyboardType: TextInputType.url,
                    decoration: InputDecoration(
                      isDense: true,
                      hintText: 'https://xxx.trycloudflare.com',
                      hintStyle: TextStyle(
                        color: AppColors.ink50.withValues(alpha: 0.3),
                        fontFamily: 'JetBrainsMono',
                        fontSize: 12,
                      ),
                      filled: true,
                      fillColor: AppColors.ink950,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(
                          color: AppColors.ink50.withValues(alpha: 0.12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "We'll auto-append /api/v1 if you leave it off.",
                    style: TextStyle(
                      color: AppColors.ink50.withValues(alpha: 0.5),
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
                              ? AppColors.signalLime
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
                                  ? AppColors.signalLime
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
                      color: AppColors.ink50.withValues(alpha: 0.5),
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    Env.defaultApiBaseUrl,
                    style: TextStyle(
                      color: AppColors.ink50.withValues(alpha: 0.6),
                      fontFamily: 'JetBrainsMono',
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
                      style: TextStyle(color: AppColors.ink50)),
                ),
                TextButton(
                  onPressed: busy ? null : test,
                  child: Text(busy ? 'Testing…' : 'Test',
                      style: const TextStyle(color: AppColors.signalLime)),
                ),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.signalViolet,
                  ),
                  onPressed: busy
                      ? null
                      : () async {
                          await Env.setOverride(ctl.text);
                          if (dialogCtx.mounted) Navigator.of(dialogCtx).pop();
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
