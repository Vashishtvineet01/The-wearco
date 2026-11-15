import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/config/env.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Hydrate any Developer-menu override of the backend URL from
  // SharedPreferences BEFORE the first API call fires.
  await Env.load();

  // Match the brand dark theme in the system chrome.
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: AppColors.ink950,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.ink950,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const ProviderScope(child: TheWearCoApp()));
}
