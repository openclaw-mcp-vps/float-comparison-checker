import { cookies } from "next/headers";

import { analyzeCode, analyzeRequestSchema } from "@/lib/ast-analyzer";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = verifyAccessToken(accessToken);

  if (!access) {
    return Response.json(
      {
        error: "Subscription required. Complete checkout to unlock analysis.",
        upgradeUrl: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
      },
      { status: 402 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid analyze request payload.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { code, language, filePath, epsilon } = parsed.data;
  const report = analyzeCode(code, language, filePath, epsilon ? epsilon.toString() : "1e-9");

  return Response.json(
    {
      summary: {
        issueCount: report.issueCount,
        riskScore: report.riskScore,
        language: report.language,
        filePath: report.filePath,
        scannedAt: new Date().toISOString()
      },
      issues: report.issues
    },
    { status: 200 }
  );
}
