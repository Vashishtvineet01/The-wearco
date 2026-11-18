/**
 * Direct Android APK download.
 * Override with NEXT_PUBLIC_ANDROID_APP_URL (Play Store or CDN).
 * Default: GitHub Releases asset (also mirrored at /thewearco-android.apk when present).
 */
export const ANDROID_APP_URL =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL ||
  "https://github.com/Vashishtvineet01/The-wearco/releases/latest/download/thewearco-android.apk";
