const FLOAT_HINT_REGEX = /\b(amount|price|ratio|probability|score|balance|tax|interest|percent|average|mean|variance|distance|velocity|temperature)\b/i;

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

  return /[+\-*/%]/.test(trimmed);
}

function buildSuggestion(left, right, operator, epsilon) {
  const isClose = `math.isclose(${left}, ${right}, rel_tol=${epsilon}, abs_tol=1e-12)`;
  return operator === "==" ? isClose : `not ${isClose}`;
}

export function analyzePython(code, filePath, epsilon) {
  const findings = [];
  const lines = code.split(/\r?\n/);
  const pattern = /([A-Za-z_][A-Za-z0-9_\[\].()\s+\-*/%]*)\s*(==|!=)\s*([A-Za-z_0-9\[\].()\s+\-*/%]+)/g;

  lines.forEach((rawLine, index) => {
    const line = rawLine.split("#")[0] ?? "";

    if (!line || /\b(isclose|approx)\b/.test(line)) {
      return;
    }

    for (const match of line.matchAll(pattern)) {
      const left = (match[1] ?? "").trim();
      const operator = (match[2] ?? "").trim();
      const right = (match[3] ?? "").trim();

      if (!left || !right || !operator) {
        continue;
      }

      if (!looksLikeFloatExpression(left) && !looksLikeFloatExpression(right)) {
        continue;
      }

      findings.push({
        filePath,
        line: index + 1,
        column: (match.index ?? 0) + 1,
        operator,
        left,
        right,
        snippet: match[0].trim(),
        suggestion: buildSuggestion(left, right, operator, epsilon),
        reason: "Python float equality is brittle for computed values. Use math.isclose to stabilize comparisons.",
        severity: "high",
        confidence: "medium",
        language: "python"
      });
    }
  });

  return findings;
}
