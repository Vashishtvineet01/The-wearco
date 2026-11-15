import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand palette — mirrors the web `tailwind.config.ts`.
class AppColors {
  // Ink scale (dark neutrals)
  static const Color ink50 = Color(0xFFF7F7F7);
  static const Color ink100 = Color(0xFFE5E5E5);
  static const Color ink200 = Color(0xFFC2C2C2);
  static const Color ink300 = Color(0xFF9E9E9E);
  static const Color ink400 = Color(0xFF7A7A7A);
  static const Color ink700 = Color(0xFF1F1F1F);
  static const Color ink800 = Color(0xFF141414);
  static const Color ink900 = Color(0xFF0A0A0A);
  static const Color ink950 = Color(0xFF050505);

  // Signal accents
  static const Color signalLime = Color(0xFFD8FF36);
  static const Color signalCoral = Color(0xFFFF5C3B);
  static const Color signalViolet = Color(0xFF7C5CFF);
  static const Color signalSky = Color(0xFF7CD0FF);
}

ThemeData buildAppTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  final displayFont = GoogleFonts.spaceGrotesk;
  final bodyFont = GoogleFonts.inter;
  final monoFont = GoogleFonts.jetBrainsMono;

  return base.copyWith(
    colorScheme: const ColorScheme.dark(
      brightness: Brightness.dark,
      primary: AppColors.signalLime,
      onPrimary: AppColors.ink950,
      secondary: AppColors.signalViolet,
      onSecondary: AppColors.ink50,
      surface: AppColors.ink900,
      onSurface: AppColors.ink50,
      error: AppColors.signalCoral,
      onError: AppColors.ink50,
    ),
    scaffoldBackgroundColor: AppColors.ink950,
    canvasColor: AppColors.ink950,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.ink950,
      foregroundColor: AppColors.ink50,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: displayFont(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.ink50,
      ),
    ),
    textTheme: base.textTheme
        .copyWith(
          displayLarge: displayFont(
            fontSize: 44,
            fontWeight: FontWeight.w700,
            color: AppColors.ink50,
            height: 1.0,
            letterSpacing: -0.5,
          ),
          displayMedium: displayFont(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: AppColors.ink50,
            height: 1.05,
          ),
          headlineMedium: displayFont(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: AppColors.ink50,
          ),
          titleLarge: displayFont(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.ink50,
          ),
          titleMedium: displayFont(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.ink50,
          ),
          bodyLarge: bodyFont(
            fontSize: 16,
            color: AppColors.ink100,
            height: 1.45,
          ),
          bodyMedium: bodyFont(
            fontSize: 14,
            color: AppColors.ink200,
            height: 1.45,
          ),
          bodySmall: bodyFont(
            fontSize: 12,
            color: AppColors.ink300,
          ),
          labelMedium: monoFont(
            fontSize: 11,
            color: AppColors.ink300,
            letterSpacing: 2,
          ),
          labelSmall: monoFont(
            fontSize: 10,
            color: AppColors.ink400,
            letterSpacing: 1.8,
          ),
        ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.black.withValues(alpha: 0.4),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.white10),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.white10),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: AppColors.signalLime.withValues(alpha: 0.5)),
      ),
      labelStyle: monoFont(
        fontSize: 11,
        color: AppColors.ink300,
        letterSpacing: 2,
      ),
      hintStyle: bodyFont(fontSize: 14, color: AppColors.ink400),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.signalLime,
        foregroundColor: AppColors.ink950,
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
        foregroundColor: AppColors.ink50,
        side: const BorderSide(color: Colors.white24),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white.withValues(alpha: 0.02),
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Colors.white10),
        borderRadius: BorderRadius.circular(16),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerColor: Colors.white10,
  );
}
