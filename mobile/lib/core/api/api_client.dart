import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';

/// Shared Dio instance used by all feature-level providers.
/// Provides sensible timeouts and a JSON content-type by default.
///
/// [Env.apiBaseUrl] is re-read on every request via an interceptor so that
/// the Developer menu's "change backend URL" takes effect without having to
/// tear down / recreate the Dio instance.
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
      headers: {
        'Accept': 'application/json',
      },
    ),
  );

  // Dynamic base URL — keeps requests pointed at whatever Env currently says,
  // even if the user changed it mid-session through the Developer menu.
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        options.baseUrl = Env.apiBaseUrl;
        handler.next(options);
      },
    ),
  );

  // Simple log interceptor — comment out for production.
  dio.interceptors.add(
    LogInterceptor(
      request: false,
      requestHeader: false,
      requestBody: false,
      responseHeader: false,
      responseBody: false,
      error: true,
    ),
  );

  return dio;
});

/// Typed exception carrying both a human-readable message and the underlying
/// status code so screens can show the right thing.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => 'ApiException($statusCode): $message';

  static ApiException fromDioError(DioException e) {
    final status = e.response?.statusCode;
    final body = e.response?.data;
    String message = e.message ?? 'Request failed';
    if (body is Map && body['error'] is String) {
      message = body['error'] as String;
    }
    return ApiException(message, statusCode: status);
  }
}
