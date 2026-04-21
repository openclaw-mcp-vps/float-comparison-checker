import { parse } from "acorn";

const OPERATORS = new Set(["==", "===", "!=", "!=="]);
const FLOAT_HINT_REGEX = /\b(amount|price|ratio|probability|score|balance|tax|interest|percent|average|mean|variance|distance|velocity|temperature)\b/i;

function walk(node, visitor) {
  visitor(node);

  for (const value of Object.values(node)) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry && typeof entry.type === "string") {
          walk(entry, visitor);
        }
      }
      continue;
    }

    if (value && typeof value.type === "string") {
      walk(value, visitor);
    }
  }
}

function looksLikeFloatExpression(expression) {
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

  if (/(parseFloat|Number|Math\.|toFixed|toPrecision)/.test(trimmed)) {
    return true;
  }

  return /[+\-*/%]/.test(trimmed);
}

function buildSuggestion(left, right, operator, epsilon) {
  const absoluteDiff = `Math.abs(${left} - ${right})`;
  return operator === "==" || operator === "==="
    ? `${absoluteDiff} < ${epsilon}`
    : `${absoluteDiff} >= ${epsilon}`;
}

export function analyzeJavaScript(code, filePath, epsilon) {
  const ast = parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowHashBang: true,
    locations: true
  });

  const findings = [];

  walk(ast, (node) => {
    if (node.type !== "BinaryExpression") {
      return;
    }

    if (!OPERATORS.has(node.operator)) {
      return;
    }

    const left = code.slice(node.left.start, node.left.end).trim();
    const right = code.slice(node.right.start, node.right.end).trim();

    if (!looksLikeFloatExpression(left) && !looksLikeFloatExpression(right)) {
      return;
    }

    findings.push({
      filePath,
      line: node.loc.start.line,
      column: node.loc.start.column + 1,
      operator: node.operator,
      left,
      right,
      snippet: code.slice(node.start, node.end).trim(),
      suggestion: buildSuggestion(left, right, node.operator, epsilon),
      reason: "Direct float equality can break because binary floating point cannot exactly represent many decimal values.",
      severity: "high",
      confidence: "high",
      language: "javascript"
    });
  });

  return findings;
}
