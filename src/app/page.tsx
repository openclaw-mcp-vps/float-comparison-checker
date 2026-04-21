import Link from "next/link";
import { AlertTriangle, CheckCircle2, Code2, Gauge, ShieldAlert } from "lucide-react";

import PricingCard from "@/components/PricingCard";
import { buttonVariants } from "@/components/ui/button";

const faqs = [
  {
    question: "What exactly does the scanner flag?",
    answer:
      "It detects direct float equality and inequality checks like ==, ===, !=, and !== when values look derived from decimals or math operations."
  },
  {
    question: "Does it work in CI pipelines?",
    answer:
      "Yes. The CLI returns a non-zero exit code by default when issues are found, so GitHub Actions, CircleCI, and Buildkite can fail fast."
  },
  {
    question: "Will it flood us with false positives?",
    answer:
      "The analyzer uses AST context and float heuristics. You can scope extensions, adjust epsilon recommendations, and suppress expected exceptions in code review."
  },
  {
    question: "Who should deploy this first?",
    answer:
      "Teams with monetary calculations, experiment analytics, geospatial math, and scientific transforms where one rounding mismatch can produce bad decisions."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22]/90 px-6 py-10 md:px-10">
        <div className="pointer-events-none absolute -right-28 -top-24 h-72 w-72 rounded-full bg-[#2f81f7]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#3fb950]/10 blur-3xl" />

        <div className="relative space-y-6">
          <p className="inline-flex rounded-full border border-[#2f81f7]/40 bg-[#12203a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#9cc4ff]">
            Safe floating point comparison validator
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Catch float precision bugs before they corrupt calculations in production.
          </h1>
          <p className="max-w-2xl text-lg text-[#c9d1d9]">
            float-comparison-checker scans your codebase for unsafe equality checks, recommends epsilon-safe replacements,
            and enforces precision discipline directly in CI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Open Dashboard
            </Link>
            <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} className={buttonVariants({ size: "lg", variant: "outline" })}>
              Start For $8/month
            </a>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <ShieldAlert className="mb-3 h-5 w-5 text-[#f85149]" />
          <h2 className="mb-2 text-lg font-semibold">The Problem</h2>
          <p className="text-sm text-[#9da7b3]">
            `total === expected` looks harmless until binary rounding turns equal numbers into near-equal failures or false matches.
          </p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <Code2 className="mb-3 h-5 w-5 text-[#7fb7ff]" />
          <h2 className="mb-2 text-lg font-semibold">The Solution</h2>
          <p className="text-sm text-[#9da7b3]">
            AST-based analyzers identify risky comparisons and output safe{" "}
            <code>Math.abs(a - b) &lt; EPSILON</code> or <code>math.isclose(...)</code> fixes.
          </p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <Gauge className="mb-3 h-5 w-5 text-[#3fb950]" />
          <h2 className="mb-2 text-lg font-semibold">Why Teams Pay</h2>
          <p className="text-sm text-[#9da7b3]">
            Fintech and data-heavy backends avoid flaky tests, reconciliation bugs, and costly postmortems with a lightweight guardrail.
          </p>
        </article>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
          <h2 className="text-3xl font-semibold">What you get on day one</h2>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-[#d1d9e0]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
              CLI scanner across JavaScript, TypeScript, and Python projects.
            </li>
            <li className="flex gap-3 text-sm text-[#d1d9e0]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
              Web API to analyze snippets in pull request checks or internal code quality portals.
            </li>
            <li className="flex gap-3 text-sm text-[#d1d9e0]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
              Risk scoring dashboard that highlights highest-impact precision hotspots first.
            </li>
            <li className="flex gap-3 text-sm text-[#d1d9e0]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#3fb950]" />
              CI docs and commands to enforce precision checks as a required merge gate.
            </li>
          </ul>
        </div>

        <PricingCard />
      </section>

      <section className="mt-12 rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
        <h2 className="mb-6 text-3xl font-semibold">FAQ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="h-4 w-4 text-[#d29922]" />
                {faq.question}
              </h3>
              <p className="text-sm text-[#9da7b3]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
