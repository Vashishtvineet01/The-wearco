/// Runtime configuration for the TheWearCo mobile app.
///
/// The API base URL defaults to the local dev server. Override it at
/// `flutter run` time with:
///
///     flutter run --dart-define=API_BASE_URL=https://thewearco.vercel.app/api/v1
///
/// For Android emulators pointing at the host machine, use `10.0.2.2`.
/// For iOS simulators, `localhost` works.
class Env {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );

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
