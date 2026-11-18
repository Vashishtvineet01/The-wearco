import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand palette — mirrors web `globals.css`: cream paper + dark espresso text
/// + amber accents (fills / CTAs only — never light amber as body text).
///
/// Legacy `ink*` / `signal*` names stay so call sites keep compiling.
class AppColors {
  // ───────────────────────── Paper palette (web-matched) ─────────────────
  static const Color paper50 = Color(0xFFF7F1E9); // scaffold
  static const Color paper100 = Color(0xFFEFE7DB); // card surface
  static const Color paper200 = Color(0xFFE2D6C6); // borders / muted fill
  static const Color paper300 = Color(0xFFCFC0AB); // subtle borders
  /// Disabled / placeholder — kept readable on cream (was too light).
  static const Color paper400 = Color(0xFF8A7B68);
  /// Tertiary text — dark enough for mono labels on cream.
  static const Color paper500 = Color(0xFF5C5246);
  /// Secondary text.
  static const Color paper600 = Color(0xFF4A4138);
  static const Color paper700 = Color(0xFF3D352D); // body text
  static const Color paper800 = Color(0xFF241F1A); // heading text
  static const Color paper900 = Color(0xFF14110E); // primary text

  // ─────────────── Brand accents (amber / espresso — web BrandLogo) ─────
  /// Bright amber — fills, logos, selected chips. Do NOT use for small text.
  static const Color brandAmber = Color(0xFFF59E0B);
  static const Color brandAmberMid = Color(0xFFD97706);
  /// Dark amber — readable accent text / primary buttons on cream.
  static const Color brandAmberInk = Color(0xFFB45309);
  static const Color brandClay = Color(0xFF7C2D12);
  static const Color brandEspresso = Color(0xFF6B4F35); // gradient-text
  static const Color brandCream = Color(0xFFFFF8EB);
  static const Color brandGold = Color(0xFFFDE68A);

  // Accent aliases → dark amber ink so leftover `signalLime` text is readable.
  // Bright yellow fills should use `brandAmber` explicitly.
  static const Color signalLime = brandAmberInk;
  static const Color signalCoral = Color(0xFFC2410C);
  static const Color signalViolet = brandAmberInk;
  static const Color signalSky = Color(0xFF0284C7);
  static const Color signalPeach = brandAmberInk;
  static const Color signalMint = brandAmberInk;

  static const Color signalLimeInk = brandAmberInk;
  static const Color signalVioletInk = brandAmberInk;

  /// Signature mark gradient — matches web BrandLogo warm amber stack.
  static const LinearGradient auroraGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      brandAmber,
      brandAmberMid,
      brandAmberInk,
      brandClay,
    ],
    stops: [0.0, 0.42, 0.78, 1.0],
  );

  // ─────────────── Legacy ink aliases (light-theme semantics) ────────────
  static const Color ink50 = paper900; // primary text
  static const Color ink100 = paper800; // heading text
  static const Color ink200 = paper700; // body text
  static const Color ink300 = paper600; // secondary text
  static const Color ink400 = paper500; // tertiary text
  static const Color ink700 = paper200; // muted fill / borders
  static const Color ink800 = paper100; // card surface
  static const Color ink900 = paper50; // scaffold
  static const Color ink950 = paper50; // scaffold
}

ThemeData buildAppTheme() {
  final base = ThemeData.light(useMaterial3: true);
  final displayFont = GoogleFonts.sourceSans3;
  final bodyFont = GoogleFonts.sourceSans3;
  final monoFont = GoogleFonts.sourceCodePro;

  return base.copyWith(
    colorScheme: const ColorScheme.light(
      brightness: Brightness.light,
      primary: AppColors.brandAmberInk,
      onPrimary: AppColors.brandCream,
      secondary: AppColors.brandEspresso,
      onSecondary: AppColors.brandCream,
      surface: AppColors.paper50,
      onSurface: AppColors.paper900,
      surfaceContainerHighest: AppColors.paper100,
      error: AppColors.signalCoral,
      onError: AppColors.brandCream,
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
      iconTheme: const IconThemeData(color: AppColors.paper900),
    ),
    textTheme: base.textTheme.copyWith(
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
        letterSpacing: -0.4,
      ),
      headlineMedium: displayFont(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: AppColors.paper900,
      ),
      titleLarge: displayFont(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.paper900,
      ),
      titleMedium: displayFont(
        fontSize: 14,
        fontWeight: FontWeight.w700,
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
      // Mono section labels — dark espresso, never light amber.
      labelMedium: monoFont(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.paper700,
        letterSpacing: 2,
      ),
      labelSmall: monoFont(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        color: AppColors.paper600,
        letterSpacing: 1.8,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.72),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.paper300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.paper300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: AppColors.paper900,
          width: 1.5,
        ),
      ),
      labelStyle: monoFont(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.paper600,
        letterSpacing: 2,
      ),
      hintStyle: bodyFont(fontSize: 14, color: AppColors.paper500),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.paper900,
        foregroundColor: AppColors.brandCream,
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
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.paper900,
        foregroundColor: AppColors.brandCream,
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
      color: Colors.white.withValues(alpha: 0.78),
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: AppColors.paper200),
        borderRadius: BorderRadius.circular(16),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerColor: AppColors.paper200,
    iconTheme: const IconThemeData(color: AppColors.paper800),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.brandAmberInk,
    ),
  );
}
