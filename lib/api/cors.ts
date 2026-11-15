import { NextResponse } from "next/server";

/**
 * CORS helper for the public v1 REST API.
 *
 * The storefront endpoints are safe to expose to any origin (products, orders,
 * uploads, bulk quotes). If you ever need to lock this down, swap "*" for a
 * NEXT_PUBLIC_ALLOWED_ORIGINS env read.
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, X-API-Key",
  "Access-Control-Max-Age": "86400"
} as const;

/** Wrap a NextResponse / JSON body with CORS headers. */
export function withCors<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      ...CORS_HEADERS
    }
  });
}

/** Standard 204 response for CORS preflight. */
export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
