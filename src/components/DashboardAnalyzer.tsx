"use client";

import { useMemo, useState } from "react";
import { Loader2, Play, ShieldCheck } from "lucide-react";

import CodeAnalysisResults from "@/components/CodeAnalysisResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type FloatComparisonIssue, type SupportedLanguage } from "@/lib/float-detector";

const languageExamples: Record<SupportedLanguage, string> = {
  javascript: `const tax = orderSubtotal * 0.0825;
const expectedTax = 2.06;

if (tax === expectedTax) {
  approveInvoice();
}`,
  typescript: `const weightedScore = features.reduce((sum, value) => sum + value / features.length, 0);

if (weightedScore == threshold) {
  releaseModel();
}`,
  python: `average = sum(readings) / len(readings)
if average == expected_average:
    trigger_alert()`
};

interface AnalysisApiResponse {
  summary: {
    issueCount: number;
    riskScore: number;
    language: SupportedLanguage;
    filePath?: string;
  };
  issues: FloatComparisonIssue[];
  error?: string;
}

export default function DashboardAnalyzer() {
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const [code, setCode] = useState<string>(languageExamples.typescript);
  const [filePath, setFilePath] = useState<string>("src/calculations/settlement.ts");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisApiResponse | null>(null);

  const integrationSnippet = useMemo(
    () => `# Install in your project
npm install --save-dev float-comparison-checker

# Run in CI
npx float-comparison-checker . --extensions ts,tsx,js,jsx,py`,
    []
  );

  async function runAnalysis(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language,
          code,
          filePath
        })
      });

      const json = (await response.json()) as AnalysisApiResponse;

      if (!response.ok) {
        throw new Error(json.error || "Analysis failed.");
      }

      setResult(json);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unexpected error while running analysis.";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  function onLanguageChange(nextLanguage: SupportedLanguage): void {
    setLanguage(nextLanguage);
    setCode(languageExamples[nextLanguage]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inline Analyzer</CardTitle>
          <CardDescription>
            Paste a risky code snippet to detect unsafe equality checks and receive epsilon-safe alternatives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm md:col-span-1">
              <span className="text-[#9da7b3]">Language</span>
              <select
                value={language}
                onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] outline-none focus:border-[#2f81f7]"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-[#9da7b3]">File path (optional)</span>
              <input
                value={filePath}
                onChange={(event) => setFilePath(event.target.value)}
                placeholder="src/calculations/pricing.ts"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-[#e6edf3] placeholder:text-[#6f7681] outline-none focus:border-[#2f81f7]"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="text-[#9da7b3]">Code to scan</span>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={12}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-[#dbe2ea] outline-none focus:border-[#2f81f7]"
            />
          </label>

          <Button type="button" onClick={runAnalysis} disabled={isLoading || code.trim().length === 0} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isLoading ? "Scanning..." : "Run Analysis"}
          </Button>

          {error ? <p className="text-sm text-[#f85149]">{error}</p> : null}
        </CardContent>
      </Card>

      {result ? (
        <CodeAnalysisResults
          issues={result.issues}
          issueCount={result.summary.issueCount}
          riskScore={result.summary.riskScore}
          filePath={result.summary.filePath}
        />
      ) : null}

      <Card className="border-[#204a87] bg-[#111b2d]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-[#7fb7ff]" />
            CI/CD Integration
          </CardTitle>
          <CardDescription className="text-[#bfd9ff]">
            Add the CLI in your pipeline to block pull requests with unsafe float comparisons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-[#274a77] bg-[#0d1117] p-3 text-sm text-[#8dd6ff]">
            <code>{integrationSnippet}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
