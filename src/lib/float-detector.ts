export type SupportedLanguage = "javascript" | "typescript" | "python";
export type ComparisonOperator = "==" | "===" | "!=" | "!==";

export interface FloatComparisonIssue {
  id: string;
  filePath?: string;
  language: SupportedLanguage;
  line: number;
  column: number;
  operator: ComparisonOperator;
  left: string;
  right: string;
  snippet: string;
  severity: "high" | "medium";
  confidence: "high" | "medium";
  reason: string;
  suggestion: string;
}

const FLOAT_IDENTIFIER_HINTS = [
  "amount",
  "price",
  "rate",
  "ratio",
  "probability",
  "score",
  "balance",
  "tax",
  "interest",
  "total",
  "percent",
  "average",
  "mean",
  "variance",
  "std",
  "distance",
  "velocity",
  "weight",
  "temperature"
];

const FLOAT_HINT_REGEX = new RegExp(`\\b(${FLOAT_IDENTIFIER_HINTS.join("|")})\\b`, "i");

export function looksLikeFloatExpression(expression: string): boolean {
  const trimmed = expression.trim();

  if (!trimmed) {
    return false;
  }

  if (/\d+\.\d+/.test(trimmed) || /\d+e[+-]?\d+/i.test(trimmed)) {
    return true;
  }

  if (FLOAT_HINT_REGEX.test(trimmed)) {
    return true;
  }

  if (/(parseFloat|Number|toFixed|toPrecision|Math\.)/.test(trimmed)) {
    return true;
  }

  // Mathematical operations are a strong signal that rounding behavior may be involved.
  if (/[+\-*/%]/.test(trimmed)) {
    return true;
  }

  return false;
}

export function buildEpsilonSuggestion(
  left: string,
  right: string,
  operator: ComparisonOperator,
  language: SupportedLanguage,
  epsilon = "1e-9"
): string {
  if (language === "python") {
    const isClose = `math.isclose(${left}, ${right}, rel_tol=${epsilon}, abs_tol=1e-12)`;
    return operator === "==" || operator === "===" ? isClose : `not ${isClose}`;
  }

  const absoluteDiff = `Math.abs(${left} - ${right})`;
  return operator === "==" || operator === "==="
    ? `${absoluteDiff} < ${epsilon}`
    : `${absoluteDiff} >= ${epsilon}`;
}

export function createIssueId(filePath: string | undefined, line: number, column: number, snippet: string): string {
  const basis = `${filePath ?? "inline"}:${line}:${column}:${snippet}`;
  let hash = 0;

  for (let index = 0; index < basis.length; index += 1) {
    hash = (hash << 5) - hash + basis.charCodeAt(index);
    hash |= 0;
  }

  return `issue_${Math.abs(hash)}`;
}

export function calculateRiskScore(issues: FloatComparisonIssue[]): number {
  if (issues.length === 0) {
    return 0;
  }

  const weighted = issues.reduce((total, issue) => total + (issue.severity === "high" ? 12 : 6), 0);
  return Math.min(100, weighted);
}
