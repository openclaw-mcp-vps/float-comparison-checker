import { NextResponse } from "next/server";

import { getPurchaseBySessionId } from "@/lib/database";
import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME, createSignedAccessToken } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/dashboard?status=missing_session", url));
  }

  const purchase = await getPurchaseBySessionId(sessionId);

  if (!purchase) {
    return NextResponse.redirect(new URL("/dashboard?status=pending_verification", url));
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ACCESS_COOKIE_MAX_AGE * 1000);

  const token = createSignedAccessToken({
    sessionId: purchase.sessionId,
    email: purchase.email,
    purchasedAt: purchase.createdAt,
    expiresAt: expiresAt.toISOString()
  });

  const response = NextResponse.redirect(new URL("/dashboard?status=unlocked", url));
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE
  });

  return response;
}
