import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';

/// Shared Dio instance used by all feature-level providers.
/// Provides sensible timeouts and a JSON content-type by default.
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
