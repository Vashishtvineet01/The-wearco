import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { AdminSession } from "@/lib/session";
import { sessionOptions } from "@/lib/session";
import {
  customerSessionOptions,
  type CustomerSession,
} from "@/lib/customer-session-options";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin area ──
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const res = NextResponse.next();
    const session = await getIronSession<AdminSession>(
      req,
      res,
      sessionOptions
    );

    if (!session.isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  // ── Customer /account area ──
  if (pathname.startsWith("/account")) {
    const res = NextResponse.next();
    const session = await getIronSession<CustomerSession>(
      req,
      res,
      customerSessionOptions
    );

    if (!session.isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
