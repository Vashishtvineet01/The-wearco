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
      // Retry once on transient failures (network blip, 502/503/504) with
      // a short backoff. GETs only — never retry a POST (would double-order!).
      onError: (err, handler) async {
        final method =
            (err.requestOptions.method).toUpperCase();
        final status = err.response?.statusCode ?? 0;
        final retriableStatus = status == 502 || status == 503 || status == 504;
        final retriableType = err.type == DioExceptionType.connectionTimeout ||
            err.type == DioExceptionType.receiveTimeout ||
            err.type == DioExceptionType.sendTimeout ||
            err.type == DioExceptionType.connectionError;
        final alreadyRetried =
            err.requestOptions.extra['twc_retry'] == true;
        if (method == 'GET' &&
            !alreadyRetried &&
            (retriableStatus || retriableType)) {
          await Future<void>.delayed(const Duration(milliseconds: 700));
          try {
            final retryOpts = err.requestOptions;
            retryOpts.extra = {...retryOpts.extra, 'twc_retry': true};
            final response = await dio.fetch(retryOpts);
            return handler.resolve(response);
          } catch (_) {
            // fall through to original error
          }
        }
        handler.next(err);
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
///
/// **Never** surfaces Dio's internal verbose error text to the UI — that's a
/// 500-char essay with links to MDN. We translate network failures into short
/// user-friendly phrases.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.kind = ApiErrorKind.other});
  final String message;
  final int? statusCode;
  final ApiErrorKind kind;

  @override
  String toString() => 'ApiException($statusCode): $message';

  static ApiException fromDioError(DioException e) {
    final status = e.response?.statusCode;
    final body = e.response?.data;

    // If the server returned a {"error": "..."} JSON, trust that — it's
    // our own API talking back.
    if (body is Map && body['error'] is String) {
      return ApiException(
        body['error'] as String,
        statusCode: status,
        kind: _kindForStatus(status),
      );
    }

    // Otherwise translate Dio's internal exception type to a clean phrase.
    // We deliberately do NOT include e.message — it's a verbose essay.
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      // ignore: deprecated_member_use
      case DioExceptionType.transformTimeout:
        return ApiException(
          "Server took too long to respond.",
          statusCode: status,
          kind: ApiErrorKind.timeout,
        );
      case DioExceptionType.connectionError:
        return ApiException(
          "Can't reach the server.",
          statusCode: status,
          kind: ApiErrorKind.network,
        );
      case DioExceptionType.badCertificate:
        return ApiException(
          "The server's HTTPS certificate is invalid.",
          statusCode: status,
          kind: ApiErrorKind.other,
        );
      case DioExceptionType.cancel:
        return ApiException("Request cancelled.",
            statusCode: status, kind: ApiErrorKind.other);
      case DioExceptionType.badResponse:
      case DioExceptionType.unknown:
        if (status == null) {
          return ApiException(
            "Can't reach the server.",
            kind: ApiErrorKind.network,
          );
        }
        if (status == 404) {
          return ApiException(
            "Not found on this backend.",
            statusCode: 404,
            kind: ApiErrorKind.notFound,
          );
        }
        if (status >= 500) {
          return ApiException(
            "The server is having a bad time ($status).",
            statusCode: status,
            kind: ApiErrorKind.server,
          );
        }
        return ApiException(
          "Request failed ($status).",
          statusCode: status,
          kind: ApiErrorKind.client,
        );
    }
  }

  static ApiErrorKind _kindForStatus(int? status) {
    if (status == null) return ApiErrorKind.network;
    if (status == 404) return ApiErrorKind.notFound;
    if (status >= 500) return ApiErrorKind.server;
    if (status >= 400) return ApiErrorKind.client;
    return ApiErrorKind.other;
  }
}

/// High-level buckets the UI uses to pick an icon + headline.
enum ApiErrorKind { network, timeout, notFound, server, client, other }
