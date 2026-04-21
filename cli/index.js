#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";

import { analyzeJavaScript } from "./analyzers/javascript.js";
import { analyzePython } from "./analyzers/python.js";
import { analyzeTypeScript } from "./analyzers/typescript.js";

const DEFAULT_EXTENSIONS = ["js", "jsx", "mjs", "cjs", "ts", "tsx", "py"];
const JS_EXTENSIONS = new Set(["js", "jsx", "mjs", "cjs"]);
const TS_EXTENSIONS = new Set(["ts", "tsx"]);

const program = new Command();

program
  .name("float-comparison-checker")
  .description("Validate floating point comparisons and suggest epsilon-safe alternatives")
  .argument("[target]", "Directory or glob root to scan", ".")
  .option("-e, --extensions <list>", "Comma-separated extensions to scan", DEFAULT_EXTENSIONS.join(","))
  .option("--epsilon <value>", "Recommended epsilon value", "1e-9")
  .option("--json", "Output machine-readable JSON", false)
  .option("--max-issues <count>", "Stop scanning after this many findings", parseInteger)
  .option("--no-fail", "Exit with code 0 even when issues are detected")
  .action(async (target, options) => {
    const extensions = normalizeExtensions(options.extensions);
    const files = await collectFiles(target, extensions);

    const findings = [];

    for (const file of files) {
      const ext = path.extname(file).replace(".", "").toLowerCase();
      const code = await readFile(file, "utf8");
      const relativePath = path.relative(process.cwd(), file);

      let fileFindings = [];

      if (JS_EXTENSIONS.has(ext)) {
        fileFindings = analyzeJavaScript(code, relativePath, options.epsilon);
      } else if (TS_EXTENSIONS.has(ext)) {
        fileFindings = analyzeTypeScript(code, relativePath, options.epsilon);
      } else if (ext === "py") {
        fileFindings = analyzePython(code, relativePath, options.epsilon);
      }

      findings.push(...fileFindings);

      if (typeof options.maxIssues === "number" && findings.length >= options.maxIssues) {
        break;
      }
    }

    const summary = {
      scannedFiles: files.length,
      issueCount: findings.length,
      riskScore: Math.min(100, findings.length * 12)
    };

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            summary,
            issues: findings
          },
          null,
          2
        )
      );
    } else {
      printSummary(summary, findings);
    }

    if (findings.length > 0 && options.fail) {
      process.exitCode = 1;
    }
  });

program.parse();

function parseInteger(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected integer value, received ${value}`);
  }
  return parsed;
}

function normalizeExtensions(rawExtensions) {
  return rawExtensions
    .split(",")
    .map((entry) => entry.trim().replace(/^\./, "").toLowerCase())
    .filter(Boolean);
}

async function collectFiles(target, extensions) {
  if (extensions.length === 0) {
    return [];
  }

  const pattern = `**/*.{${extensions.join(",")}}`;

  const files = await glob(pattern, {
    cwd: target,
    absolute: true,
    nodir: true,
    ignore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.git/**",
      "**/*.d.ts"
    ]
  });

  return files;
}

function printSummary(summary, findings) {
  if (findings.length === 0) {
    console.log(chalk.green(`No unsafe floating point comparisons found across ${summary.scannedFiles} files.`));
    return;
  }

  console.log(chalk.red(`Found ${summary.issueCount} unsafe floating point comparison(s).`));
  console.log(chalk.yellow(`Risk score: ${summary.riskScore}/100`));
  console.log("");

  findings.forEach((issue) => {
    console.log(chalk.red(`${issue.filePath}:${issue.line}:${issue.column}`));
    console.log(chalk.white(`  ${issue.snippet}`));
    console.log(chalk.cyan(`  Suggestion: ${issue.suggestion}`));
    console.log(chalk.gray(`  Reason: ${issue.reason}`));
    console.log("");
  });
}
