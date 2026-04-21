import tsParser from "@typescript-eslint/parser";

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

function sourceForNode(node, code) {
  if (Array.isArray(node.range) && node.range.length === 2) {
    return code.slice(node.range[0], node.range[1]);
  }

  if (typeof node.start === "number" && typeof node.end === "number") {
    return code.slice(node.start, node.end);
  }

  return "";
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

export function analyzeTypeScript(code, filePath, epsilon) {
  const ast = tsParser.parse(code, {
    sourceType: "module",
    ecmaVersion: "latest",
    range: true,
    loc: true,
    ecmaFeatures: {
      jsx: true
    }
  });

  const findings = [];

  walk(ast, (node) => {
    if (node.type !== "BinaryExpression") {
      return;
    }

    if (!OPERATORS.has(node.operator)) {
      return;
    }

    const left = sourceForNode(node.left, code).trim();
    const right = sourceForNode(node.right, code).trim();

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
      snippet: sourceForNode(node, code).trim(),
      suggestion: buildSuggestion(left, right, node.operator, epsilon),
      reason: "Direct float equality can fail in TypeScript and JavaScript due to rounding in IEEE 754 numbers.",
      severity: "high",
      confidence: "high",
      language: "typescript"
    });
  });

  return findings;
}
