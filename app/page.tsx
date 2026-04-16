"use client";
import { useState } from "react";

function analyzeCode(code: string): { line: number; text: string; suggestion: string }[] {
  const issues: { line: number; text: string; suggestion: string }[] = [];
  const lines = code.split("\n");
  const pattern = /([\w.]+)\s*={2,3}\s*([\d.]+(?:e[+-]?\d+)?)|([\d.]+(?:e[+-]?\d+)?)\s*={2,3}\s*([\w.]+)/gi;
  lines.forEach((line, i) => {
    if (pattern.test(line)) {
      issues.push({
        line: i + 1,
        text: line.trim(),
        suggestion: `Use Math.abs(a - b) < Number.EPSILON instead of strict equality`
      });
    }
    pattern.lastIndex = 0;
  });
  return issues;
}

export default function Page() {
  const [code, setCode] = useState("");
  const [results, setResults] = useState<{ line: number; text: string; suggestion: string }[]>([]);
  const [checked, setChecked] = useState(false);

  function handleCheck() {
    setResults(analyzeCode(code));
    setChecked(true);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold text-[#58a6ff] mb-4">Float Comparison Checker</h1>
        <p className="text-lg text-[#8b949e] mb-8">Paste code below to instantly detect unsafe floating point equality checks and get safer alternatives.</p>
        <textarea
          className="w-full h-40 bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-sm font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff] resize-none"
          placeholder={`// Example:\nif (0.1 + 0.2 == 0.3) { ... }\nif (result === 1.0) { ... }`}
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button
          onClick={handleCheck}
          className="mt-4 px-8 py-3 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors"
        >
          Analyze Code
        </button>
        {checked && (
          <div className="mt-6 text-left">
            {results.length === 0 ? (
              <p className="text-green-400 font-medium">No unsafe float comparisons detected.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((r, i) => (
                  <li key={i} className="bg-[#161b22] border border-[#f85149] rounded-lg p-4">
                    <p className="text-xs text-[#8b949e] mb-1">Line {r.line}</p>
                    <code className="text-sm text-[#f85149] block mb-2">{r.text}</code>
                    <p className="text-sm text-[#58a6ff]">{r.suggestion}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Pricing */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-center text-[#c9d1d9] mb-8">Upgrade to Pro</h2>
        <div className="border border-[#58a6ff] rounded-xl p-8 bg-[#161b22] max-w-sm mx-auto text-center">
          <p className="text-[#58a6ff] font-semibold text-sm uppercase tracking-widest mb-2">Pro</p>
          <p className="text-5xl font-bold text-[#c9d1d9] mb-1">$8<span className="text-xl font-normal text-[#8b949e]">/mo</span></p>
          <ul className="text-sm text-[#8b949e] my-6 space-y-2 text-left">
            <li className="flex items-center gap-2"><span className="text-[#58a6ff]">✓</span> Batch file validation</li>
            <li className="flex items-center gap-2"><span className="text-[#58a6ff]">✓</span> VS Code &amp; JetBrains plugin</li>
            <li className="flex items-center gap-2"><span className="text-[#58a6ff]">✓</span> CI/CD API access</li>
            <li className="flex items-center gap-2"><span className="text-[#58a6ff]">✓</span> Priority support</li>
          </ul>
          <a
            href={process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#"}
            className="block w-full py-3 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors"
          >
            Get Pro Access
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-center text-[#c9d1d9] mb-8">FAQ</h2>
        <div className="space-y-6">
          <div className="border border-[#30363d] rounded-lg p-5">
            <h3 className="font-semibold text-[#c9d1d9] mb-2">Why are float comparisons dangerous?</h3>
            <p className="text-sm text-[#8b949e]">Floating point numbers have limited precision. <code className="text-[#58a6ff]">0.1 + 0.2</code> does not equal exactly <code className="text-[#58a6ff]">0.3</code> in binary, so strict equality checks can silently fail.</p>
          </div>
          <div className="border border-[#30363d] rounded-lg p-5">
            <h3 className="font-semibold text-[#c9d1d9] mb-2">What is the epsilon approach?</h3>
            <p className="text-sm text-[#8b949e]">Instead of <code className="text-[#58a6ff]">a === b</code>, use <code className="text-[#58a6ff]">Math.abs(a - b) &lt; Number.EPSILON</code> to check if two floats are close enough to be considered equal.</p>
          </div>
          <div className="border border-[#30363d] rounded-lg p-5">
            <h3 className="font-semibold text-[#c9d1d9] mb-2">Which languages does the checker support?</h3>
            <p className="text-sm text-[#8b949e]">The free checker works on JavaScript and TypeScript. Pro unlocks Python, Java, C++, Go, and Rust analysis with language-specific best practices.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
