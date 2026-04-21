import { AlertTriangle, CheckCircle2, Code2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type FloatComparisonIssue } from "@/lib/float-detector";

interface CodeAnalysisResultsProps {
  issues: FloatComparisonIssue[];
  issueCount: number;
  riskScore: number;
  filePath?: string;
}

export default function CodeAnalysisResults({
  issues,
  issueCount,
  riskScore,
  filePath
}: CodeAnalysisResultsProps) {
  if (issueCount === 0) {
    return (
      <Card className="border-[#1b4f30] bg-[#0f2a1c]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#3fb950]">
            <CheckCircle2 className="h-5 w-5" />
            No unsafe float equality checks found
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">Analysis Summary</CardTitle>
            <Badge variant={riskScore >= 60 ? "danger" : riskScore >= 30 ? "warning" : "success"}>
              Risk score {riskScore}/100
            </Badge>
          </div>
          <p className="text-sm text-[#9da7b3]">
            {issueCount} issue{issueCount === 1 ? "" : "s"} detected
            {filePath ? ` in ${filePath}` : " in snippet"}.
          </p>
        </CardHeader>
      </Card>

      {issues.map((issue) => (
        <Card key={issue.id} className="border-[#4a2a2a] bg-[#201419]">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="danger" className="uppercase">
                {issue.severity}
              </Badge>
              <span className="text-xs text-[#9da7b3]">
                line {issue.line}, col {issue.column}
              </span>
            </div>
            <CardTitle className="flex items-center gap-2 text-lg text-[#ffb4b4]">
              <AlertTriangle className="h-4 w-4" />
              Unsafe floating comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#d1d9e0]">{issue.reason}</p>
            <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9da7b3]">Detected code</p>
              <pre className="overflow-x-auto text-sm text-[#ff7b72]">
                <code>{issue.snippet}</code>
              </pre>
            </div>
            <div className="rounded-md border border-[#1f3f6f] bg-[#101a2b] p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#7fb7ff]">
                <Code2 className="h-3.5 w-3.5" />
                Recommended replacement
              </p>
              <pre className="overflow-x-auto text-sm text-[#8dd6ff]">
                <code>{issue.suggestion}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
