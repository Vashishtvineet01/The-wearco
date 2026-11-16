import 'package:shared_preferences/shared_preferences.dart';

import '../api/demo_adapter.dart';

/// Runtime configuration for the TheWearCo mobile app.
///
/// Resolution order for `apiBaseUrl`:
///   1. User override saved in SharedPreferences (set via the in-app
///      Developer menu — long-press the logo in the top bar).
///   2. `--dart-define=API_BASE_URL=…` baked in at build time.
///   3. `demo://local` — fully offline mode served from bundled assets.
///
/// For Android emulators pointing at the host machine, use `10.0.2.2`.
/// For iOS simulators, `localhost` works.
class Env {
  /// Default URL baked in at build time (--dart-define=API_BASE_URL=...).
  ///
  /// We default to the bundled demo backend so a freshly-installed APK
  /// works on ANY phone with no internet, no auth, no setup. Perfect for
  /// shipping to external testers.
  static const String defaultApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: demoBaseUrl,
  );

  /// Runtime cache populated at startup by [load] from SharedPreferences.
  /// Mutable so the Developer menu can hot-swap the backend without a rebuild.
  static String _apiBaseUrl = defaultApiBaseUrl;

  /// Current active API base URL (override if set, otherwise build-time default).
  static String get apiBaseUrl => _apiBaseUrl;

  /// SharedPreferences key for the developer-set override.
  static const String _overrideKey = 'twc.api_base_url.override';

  /// Call once at app startup (before building the ProviderScope). If the user
  /// previously set an override through the Developer menu, this reads it
  /// back so the override survives a cold start.
  static Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_overrideKey)?.trim();
    if (saved != null && saved.isNotEmpty) {
      _apiBaseUrl = _normalise(saved);
    }
  }

  /// Persist a new backend URL and swap it in-memory. The next API call will
  /// go to the new host immediately.
  static Future<void> setOverride(String url) async {
    final clean = _normalise(url);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_overrideKey, clean);
    _apiBaseUrl = clean;
  }

  /// Wipe the override, falling back to the build-time default.
  static Future<void> clearOverride() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_overrideKey);
    _apiBaseUrl = defaultApiBaseUrl;
  }

  static String _normalise(String url) {
    var s = url.trim();
    // Recognise any form the user types for demo mode.
    if (s.isEmpty ||
        s.toLowerCase() == 'demo' ||
        s.toLowerCase() == 'offline' ||
        s.toLowerCase().startsWith('demo://') ||
        s.toLowerCase().startsWith('offline://')) {
      return demoBaseUrl;
    }
    if (s.endsWith('/')) s = s.substring(0, s.length - 1);
    // Common tester mistake: forgetting `/api/v1`. We auto-append if missing
    // so a user can paste just "https://foo.trycloudflare.com".
    if (!s.contains('/api/')) s = '$s/api/v1';
    return s;
  }

  /// True if the current URL came from a user override (not the baked default).
  static bool get hasOverride => _apiBaseUrl != defaultApiBaseUrl;

  /// True if the app is running against the bundled offline/demo backend.
  /// UI uses this to show a subtle DEMO chip.
  static bool get isDemoMode => isDemo(_apiBaseUrl);

  /// Base URL for absolute asset paths returned by the API
  /// (e.g. `/uploads/designs/abc.png`). This is the API host without `/api/v1`.
  static String get assetBaseUrl {
    final idx = apiBaseUrl.indexOf('/api/');
    return idx > 0 ? apiBaseUrl.substring(0, idx) : apiBaseUrl;
  }

  /// Resolve a (possibly relative) URL to an absolute one.
  static String resolveUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return assetBaseUrl + (url.startsWith('/') ? url : '/$url');
  }
}
