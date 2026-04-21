import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import DashboardAnalyzer from "@/components/DashboardAnalyzer";
import PricingCard from "@/components/PricingCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/lemonsqueezy";

type DashboardPageProps = {
  searchParams: Promise<{
    session_id?: string;
    status?: string;
  }>;
};

function statusMessage(status: string | undefined): string | null {
  if (!status) {
    return null;
  }

  if (status === "unlocked") {
    return "Purchase verified. Your analyzer access is active.";
  }

  if (status === "pending_verification") {
    return "Checkout finished but webhook confirmation is still pending. Retry in a few seconds.";
  }

  if (status === "missing_session") {
    return "Missing checkout session ID. Ensure Stripe redirects with session_id in the success URL.";
  }

  return null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  if (params.session_id) {
    redirect(`/api/unlock?session_id=${encodeURIComponent(params.session_id)}`);
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = verifyAccessToken(accessToken);
  const paid = Boolean(access);
  const message = statusMessage(params.status);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Project Dashboard</h1>
          <p className="mt-2 text-sm text-[#9da7b3]">
            Analyze high-risk floating point comparisons and enforce precision checks before merge.
          </p>
        </div>
        <Link href="/" className="text-sm text-[#9cc4ff] underline-offset-4 hover:underline">
          Back to landing page
        </Link>
      </header>

      {message ? (
        <Card className="mb-6 border-[#204a87] bg-[#101a2b]">
          <CardContent className="pt-6 text-sm text-[#bfd9ff]">{message}</CardContent>
        </Card>
      ) : null}

      {paid ? (
        <div className="space-y-6">
          <Card className="border-[#1b4f30] bg-[#0f2a1c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-[#3fb950]">
                <ShieldCheck className="h-5 w-5" />
                Active Subscription
              </CardTitle>
              <CardDescription className="text-[#9cdcb0]">
                Access valid until {new Date(access?.expiresAt ?? "").toLocaleDateString()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="success">Paywall unlocked via signed cookie</Badge>
            </CardContent>
          </Card>

          <DashboardAnalyzer />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LockKeyhole className="h-5 w-5 text-[#d29922]" />
                Subscription Required
              </CardTitle>
              <CardDescription>
                The full analyzer and API access are available after Stripe checkout. Configure your Stripe Payment Link success URL
                to redirect back to:
                <span className="mt-2 block rounded bg-[#0d1117] p-2 font-mono text-xs text-[#c9d1d9]">
                  /dashboard?session_id={"{CHECKOUT_SESSION_ID}"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#9da7b3]">
              <p>
                Once the webhook confirms checkout completion, this page sets a signed cookie and unlocks scanning immediately.
              </p>
              <p>
                If your team needs volume licensing, email support after the first subscription and we can migrate to centralized billing.
              </p>
            </CardContent>
          </Card>

          <PricingCard />
        </div>
      )}
    </main>
  );
}
