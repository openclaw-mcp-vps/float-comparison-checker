import { parse } from "@babel/parser";
import { z } from "zod";

import {
  buildEpsilonSuggestion,
  calculateRiskScore,
  createIssueId,
  looksLikeFloatExpression,
  type FloatComparisonIssue,
  type SupportedLanguage
} from "@/lib/float-detector";

const OPERATORS = new Set(["==", "===", "!=", "!=="]);

export const analyzeRequestSchema = z.object({
  code: z.string().min(1, "Code is required."),
  language: z.enum(["javascript", "typescript", "python"]),
  filePath: z.string().min(1).optional(),
  epsilon: z.number().positive().max(1).optional()
});

export interface AnalysisReport {
  language: SupportedLanguage;
  filePath?: string;
  issueCount: number;
  riskScore: number;
  issues: FloatComparisonIssue[];
}

interface AstNode {
  type?: string;
  start?: number;
  end?: number;
  range?: [number, number];
  loc?: {
    start?: {
      line?: number;
      column?: number;
    };
  };
  [key: string]: unknown;
}

export function analyzeCode(
  code: string,
  language: SupportedLanguage,
  filePath?: string,
  epsilon = "1e-9"
): AnalysisReport {
  const issues =
    language === "python"
      ? analyzePythonComparisons(code, filePath, epsilon)
      : analyzeJavaScriptLikeComparisons(code, language, filePath, epsilon);

  return {
    language,
    filePath,
    issueCount: issues.length,
    riskScore: calculateRiskScore(issues),
    issues
  };
}

function analyzeJavaScriptLikeComparisons(
  code: string,
  language: Exclude<SupportedLanguage, "python">,
  filePath?: string,
  epsilon = "1e-9"
): FloatComparisonIssue[] {
  const ast = parse(code, {
    sourceType: "unambiguous",
    allowReturnOutsideFunction: true,
    plugins: language === "typescript" ? ["typescript", "jsx"] : ["jsx"]
  });

  const issues: FloatComparisonIssue[] = [];

  walkNode(ast as unknown as AstNode, (node) => {
    if (node.type !== "BinaryExpression") {
      return;
    }

    const operator = node.operator;

    if (typeof operator !== "string" || !OPERATORS.has(operator)) {
      return;
    }

    const leftNode = node.left as AstNode | undefined;
    const rightNode = node.right as AstNode | undefined;

    if (!leftNode || !rightNode) {
      return;
    }

    const left = getSourceForNode(leftNode, code).trim();
    const right = getSourceForNode(rightNode, code).trim();

    if (!left || !right) {
      return;
    }

    if (!looksLikeFloatExpression(left) && !looksLikeFloatExpression(right)) {
      return;
    }

    const line = node.loc?.start?.line ?? 1;
    const column = (node.loc?.start?.column ?? 0) + 1;
    const snippet = getSourceForNode(node, code).trim();

    issues.push({
      id: createIssueId(filePath, line, column, snippet),
      filePath,
      language,
      line,
      column,
      operator: operator as FloatComparisonIssue["operator"],
      left,
      right,
      snippet,
      severity: "high",
      confidence: "high",
      reason: "Strict or direct equality on floating values can fail because of binary representation rounding.",
      suggestion: buildEpsilonSuggestion(left, right, operator as FloatComparisonIssue["operator"], language, epsilon)
    });
  });

  return issues;
}

function analyzePythonComparisons(code: string, filePath?: string, epsilon = "1e-9"): FloatComparisonIssue[] {
  const issues: FloatComparisonIssue[] = [];
  const lines = code.split(/\r?\n/);
  const pattern = /([A-Za-z_][A-Za-z0-9_\[\].()\s+\-*/%]*)\s*(==|!=)\s*([A-Za-z_0-9\[\].()\s+\-*/%]+)/g;

  lines.forEach((line, lineIndex) => {
    const withoutComments = line.split("#")[0] ?? "";

    if (/\b(isclose|approx)\b/.test(withoutComments)) {
      return;
    }

    for (const match of withoutComments.matchAll(pattern)) {
      const left = (match[1] ?? "").trim();
      const operator = (match[2] ?? "") as FloatComparisonIssue["operator"];
      const right = (match[3] ?? "").trim();

      if (!left || !right || !operator) {
        continue;
      }

      if (!looksLikeFloatExpression(left) && !looksLikeFloatExpression(right)) {
        continue;
      }

      const column = (match.index ?? 0) + 1;
      const snippet = match[0]?.trim() ?? `${left} ${operator} ${right}`;

      issues.push({
        id: createIssueId(filePath, lineIndex + 1, column, snippet),
        filePath,
        language: "python",
        line: lineIndex + 1,
        column,
        operator,
        left,
        right,
        snippet,
        severity: "high",
        confidence: "medium",
        reason: "Direct floating point comparison in Python should use math.isclose for stable numeric behavior.",
        suggestion: buildEpsilonSuggestion(left, right, operator, "python", epsilon)
      });
    }
  });

  return issues;
}

function getSourceForNode(node: AstNode, code: string): string {
  if (typeof node.start === "number" && typeof node.end === "number") {
    return code.slice(node.start, node.end);
  }

  if (Array.isArray(node.range) && node.range.length === 2) {
    return code.slice(node.range[0], node.range[1]);
  }

  return "";
}

function walkNode(node: AstNode, visitor: (node: AstNode) => void): void {
  visitor(node);

  Object.values(node).forEach((value) => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (isAstNode(entry)) {
          walkNode(entry, visitor);
        }
      });
      return;
    }

    if (isAstNode(value)) {
      walkNode(value, visitor);
    }
  });
}

function isAstNode(value: unknown): value is AstNode {
  return typeof value === "object" && value !== null && "type" in value;
}
