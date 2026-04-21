import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  className?: string;
}

export default function PricingCard({ className }: PricingCardProps) {
  return (
    <Card className={cn("border-[#2f81f7]/40 bg-[#161b22]", className)}>
      <CardHeader>
        <CardTitle className="text-3xl">$8/month</CardTitle>
        <CardDescription className="text-base text-[#c9d1d9]">
          Protect CI pipelines against silent float precision regressions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-[#dbe2ea]">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
            JS, TS, and Python analyzers with actionable suggestions
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
            CI-friendly non-zero exit codes to block risky merges
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
            Web dashboard with risk score and remediation snippets
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
            Stripe hosted checkout with cookie-based access unlock
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <a
          href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
          className={buttonVariants({ size: "lg", className: "w-full text-center" })}
          rel="noreferrer"
        >
          Buy Now
        </a>
        <p className="text-xs text-[#8b949e]">
          Cancel anytime. Teams can scale to yearly plans through support after onboarding.
        </p>
      </CardFooter>
    </Card>
  );
}
