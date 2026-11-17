import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand palette — mirrors the web `tailwind.config.ts` + `globals.css`.
///
/// The app was originally dark-first (ink950 scaffold, ink50 text).
/// The web pivoted to a warm paper base with aurora washes, so we did
/// the same here while preserving every existing `AppColors.ink*`
/// reference — the ink tokens are now semantic aliases of the
/// corresponding paper shade (so `ink950` as "primary surface" still
/// renders as the lightest paper, and `ink50` as "primary text" still
/// renders as the darkest paper).
class AppColors {
  // ───────────────────────── Paper palette (web-matched) ─────────────────
  // Lightest → darkest. 50 is the scaffold, 900 is the primary text.
  static const Color paper50 = Color(0xFFFAFAF7);  // scaffold
  static const Color paper100 = Color(0xFFF2F1EA); // card surface
  static const Color paper200 = Color(0xFFE5E4D9); // borders / muted fill
  static const Color paper300 = Color(0xFFC9C7B9); // subtle borders
  static const Color paper400 = Color(0xFFA8A595); // disabled text
  static const Color paper500 = Color(0xFF8A8778); // tertiary text
  static const Color paper600 = Color(0xFF6B6859); // secondary text
  static const Color paper700 = Color(0xFF4A4737); // body text
  static const Color paper800 = Color(0xFF2A281E); // heading text
  static const Color paper900 = Color(0xFF0F0D0A); // primary text

  // ─────────────── Signal accents (aurora — unchanged from web) ──────────
  static const Color signalLime = Color(0xFFD8FF36);
  static const Color signalCoral = Color(0xFFFF5C3B);
  static const Color signalViolet = Color(0xFF7C5CFF);
  static const Color signalSky = Color(0xFF7CD0FF);
  static const Color signalPeach = Color(0xFFFF9A6B);
  static const Color signalMint = Color(0xFF5EE3B4);

  // Ink variants that stay readable as text on cream (web uses these too).
  static const Color signalLimeInk = Color(0xFF4A6B00);
  static const Color signalVioletInk = Color(0xFF4A2BFF);

  // Signature aurora gradient — used for CTAs, chips, bottom-nav pill, etc.
  static const LinearGradient auroraGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [signalViolet, signalCoral, signalLime],
  );

  // ─────────────── Legacy ink aliases (back-compat with existing code) ──
  // Any widget still using `AppColors.ink*` keeps working — the semantics
  // flip for a light theme:
  //   - ink950 / ink900 were the dark scaffold → now the lightest paper.
  //   - ink50 / ink100 were the lightest text  → now the darkest text.
  //   - mid-range ink shades become mid-range paper shades.
  static const Color ink50 = paper900;   // primary text
  static const Color ink100 = paper800;  // heading text
  static const Color ink200 = paper700;  // body text
  static const Color ink300 = paper600;  // secondary text
  static const Color ink400 = paper500;  // tertiary text
  static const Color ink700 = paper200;  // muted fill / borders
  static const Color ink800 = paper100;  // card surface
  static const Color ink900 = paper50;   // scaffold
  static const Color ink950 = paper50;   // scaffold
}

ThemeData buildAppTheme() {
  final base = ThemeData.light(useMaterial3: true);
  final displayFont = GoogleFonts.spaceGrotesk;
  final bodyFont = GoogleFonts.inter;
  final monoFont = GoogleFonts.jetBrainsMono;

  return base.copyWith(
    colorScheme: const ColorScheme.light(
      brightness: Brightness.light,
      primary: AppColors.signalVioletInk,
      onPrimary: AppColors.paper50,
      secondary: AppColors.signalCoral,
      onSecondary: AppColors.paper50,
      surface: AppColors.paper50,
      onSurface: AppColors.paper900,
      surfaceContainerHighest: AppColors.paper100,
      error: AppColors.signalCoral,
      onError: AppColors.paper50,
      outline: AppColors.paper200,
    ),
    scaffoldBackgroundColor: AppColors.paper50,
    canvasColor: AppColors.paper50,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.paper50,
      foregroundColor: AppColors.paper900,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: displayFont(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.paper900,
      ),
    ),
    textTheme: base.textTheme
        .copyWith(
          displayLarge: displayFont(
            fontSize: 44,
            fontWeight: FontWeight.w700,
            color: AppColors.paper900,
            height: 1.0,
            letterSpacing: -0.5,
          ),
          displayMedium: displayFont(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: AppColors.paper900,
            height: 1.05,
          ),
          headlineMedium: displayFont(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: AppColors.paper900,
          ),
          titleLarge: displayFont(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.paper900,
          ),
          titleMedium: displayFont(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.paper900,
          ),
          bodyLarge: bodyFont(
            fontSize: 16,
            color: AppColors.paper800,
            height: 1.45,
          ),
          bodyMedium: bodyFont(
            fontSize: 14,
            color: AppColors.paper700,
            height: 1.45,
          ),
          bodySmall: bodyFont(
            fontSize: 12,
            color: AppColors.paper600,
          ),
          labelMedium: monoFont(
            fontSize: 11,
            color: AppColors.paper600,
            letterSpacing: 2,
          ),
          labelSmall: monoFont(
            fontSize: 10,
            color: AppColors.paper500,
            letterSpacing: 1.8,
          ),
        ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.paper100.withValues(alpha: 0.7),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.paper200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.paper200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: AppColors.signalVioletInk.withValues(alpha: 0.5),
          width: 1.5,
        ),
      ),
      labelStyle: monoFont(
        fontSize: 11,
        color: AppColors.paper600,
        letterSpacing: 2,
      ),
      hintStyle: bodyFont(fontSize: 14, color: AppColors.paper500),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        // Material's ElevatedButton doesn't support gradients directly;
        // call sites wrap with a DecoratedBox for the full aurora look.
        backgroundColor: AppColors.signalVioletInk,
        foregroundColor: AppColors.paper50,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
        textStyle: displayFont(
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.paper900,
        side: const BorderSide(color: AppColors.paper300),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.paper100.withValues(alpha: 0.7),
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: AppColors.paper200),
        borderRadius: BorderRadius.circular(16),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerColor: AppColors.paper200,
    iconTheme: const IconThemeData(color: AppColors.paper800),
  );
}
