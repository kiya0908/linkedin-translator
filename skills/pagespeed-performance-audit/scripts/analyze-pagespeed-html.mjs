#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

function parseArgs(argv) {
  const args = { format: "md" };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === "--input" && next) {
      args.input = next;
      i += 1;
      continue;
    }

    if (token === "--format" && next) {
      args.format = next;
      i += 1;
      continue;
    }

    if (token === "--out" && next) {
      args.out = next;
      i += 1;
      continue;
    }
  }

  if (!args.input) {
    throw new Error("Missing --input <path-to-pagespeed-html>");
  }

  if (!["md", "json"].includes(args.format)) {
    throw new Error("Invalid --format. Use 'md' or 'json'.");
  }

  return args;
}

function extractArrayLiteralAfter(html, markerIndex) {
  const dataIndex = html.indexOf("data:[", markerIndex);
  if (dataIndex < 0) {
    throw new Error("Could not find 'data:[' near AF_initDataCallback marker.");
  }

  const start = html.indexOf("[", dataIndex);
  if (start < 0) {
    throw new Error("Could not find data array start.");
  }

  let depth = 0;
  let end = -1;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let i = start; i < html.length; i += 1) {
    const ch = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === "[") {
      depth += 1;
      continue;
    }

    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end < 0) {
    throw new Error("Could not find data array end.");
  }

  return html.slice(start, end + 1);
}

function findLhrJsonStrings(node, results) {
  if (
    typeof node === "string" &&
    node.includes('"lighthouseVersion"') &&
    node.includes('"audits"') &&
    node.includes('"categories"')
  ) {
    results.push(node);
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      findLhrJsonStrings(item, results);
    }
    return;
  }

  if (node && typeof node === "object") {
    for (const value of Object.values(node)) {
      findLhrJsonStrings(value, results);
    }
  }
}

function collectLhrsFromHtml(html) {
  const marker = "AF_initDataCallback({key: 'ds:0'";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find AF_initDataCallback ds:0 marker in input HTML.");
  }

  const literal = extractArrayLiteralAfter(html, markerIndex);
  const data = vm.runInNewContext(literal, Object.create(null));

  const jsonStrings = [];
  findLhrJsonStrings(data, jsonStrings);

  const lhrs = jsonStrings
    .map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!lhrs.length) {
    throw new Error("No Lighthouse JSON payload found in the PSI HTML file.");
  }

  return lhrs;
}

function toNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function summarizeRun(lhr) {
  const audits = lhr.audits ?? {};
  const perf = lhr.categories?.performance ?? {};

  const metricIds = [
    "first-contentful-paint",
    "largest-contentful-paint",
    "speed-index",
    "total-blocking-time",
    "cumulative-layout-shift",
    "interactive",
  ];

  const metrics = Object.fromEntries(
    metricIds.map((id) => [
      id,
      {
        score: audits[id]?.score ?? null,
        displayValue: audits[id]?.displayValue ?? null,
        numericValue: audits[id]?.numericValue ?? null,
      },
    ])
  );

  const weightedIssues = (perf.auditRefs ?? [])
    .filter((ref) => toNumber(ref.weight) > 0)
    .map((ref) => {
      const audit = audits[ref.id];
      return {
        id: ref.id,
        title: audit?.title ?? ref.id,
        weight: ref.weight,
        score: audit?.score ?? null,
        displayValue: audit?.displayValue ?? null,
      };
    })
    .filter((item) => typeof item.score === "number" && item.score < 0.9)
    .sort((a, b) => b.weight - a.weight);

  const renderBlocking = audits["render-blocking-insight"];
  const unusedJs = audits["unused-javascript"];
  const imageDelivery = audits["image-delivery-insight"];
  const lcpBreakdown = audits["lcp-breakdown-insight"];

  const topNetwork = (audits["network-requests"]?.details?.items ?? [])
    .map((item) => ({
      url: item.url,
      resourceType: item.resourceType,
      transferSize: toNumber(item.transferSize),
      resourceSize: toNumber(item.resourceSize),
    }))
    .sort((a, b) => b.transferSize - a.transferSize)
    .slice(0, 10);

  const lcpSubparts =
    lcpBreakdown?.details?.items?.find((item) => item.type === "table")?.items ?? [];

  const lcpElement =
    lcpBreakdown?.details?.items?.find((item) => item.type === "node")?.nodeLabel ?? null;

  const lcpElementRenderDelay = toNumber(
    lcpSubparts.find((item) => item.subpart === "elementRenderDelay")?.duration
  );

  const actions = [];

  const renderBlockingLcpSavings = toNumber(renderBlocking?.metricSavings?.LCP);
  if (renderBlockingLcpSavings >= 300) {
    actions.push({
      priority: "P0",
      title: "Reduce render-blocking resources",
      why: "Blocking CSS/resources delay first paint and LCP.",
      evidence: {
        lcpSavingsMs: renderBlockingLcpSavings,
        items: (renderBlocking?.details?.items ?? []).slice(0, 5).map((item) => ({
          url: item.url,
          wastedMs: item.wastedMs,
          totalBytes: item.totalBytes,
        })),
      },
      nextSteps: [
        "Inline critical above-the-fold CSS.",
        "Defer non-critical styles.",
        "Trim first-paint font dependencies.",
      ],
    });
  }

  const unusedJsBytes = toNumber(unusedJs?.details?.overallSavingsBytes);
  if (unusedJsBytes >= 100 * 1024) {
    actions.push({
      priority: "P0",
      title: "Cut unused JavaScript on initial load",
      why: "Large non-critical JS increases parse/eval time and delays render.",
      evidence: {
        estSavingsBytes: unusedJsBytes,
        estSavingsMs: toNumber(unusedJs?.details?.overallSavingsMs),
        items: (unusedJs?.details?.items ?? []).slice(0, 5).map((item) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
        })),
      },
      nextSteps: [
        "Delay analytics/auth SDKs until load or first interaction.",
        "Lazy-mount non-critical widgets.",
        "Split large route chunks where feasible.",
      ],
    });
  }

  const imageSavingsBytes = toNumber(
    (imageDelivery?.details?.items ?? [])[0]?.wastedBytes ??
      imageDelivery?.details?.overallSavingsBytes
  );
  if (imageSavingsBytes >= 40 * 1024) {
    actions.push({
      priority: "P0",
      title: "Serve right-sized images for visible dimensions",
      why: "Oversized images waste bandwidth during first-screen rendering.",
      evidence: {
        estSavingsBytes: imageSavingsBytes,
        items: (imageDelivery?.details?.items ?? []).slice(0, 5).map((item) => ({
          url: item.url,
          wastedBytes: item.wastedBytes,
          totalBytes: item.totalBytes,
          node: item.node?.snippet ?? null,
        })),
      },
      nextSteps: [
        "Use small icon/logo variants for nav and badges.",
        "Add explicit width/height.",
        "Keep hero images only at required resolution.",
      ],
    });
  }

  if (lcpElementRenderDelay >= 600) {
    actions.push({
      priority: "P0",
      title: "Render LCP content immediately (avoid hydration-gated reveal)",
      why: "High element render delay indicates LCP element appears late after resources are available.",
      evidence: {
        lcpElement,
        elementRenderDelayMs: lcpElementRenderDelay,
      },
      nextSteps: [
        "Avoid delaying first-screen title/hero with JS animations.",
        "Use static markup for first viewport text.",
        "Apply motion only after initial paint.",
      ],
    });
  }

  const heavyFonts = topNetwork
    .filter((item) => item.resourceType === "Font" && item.transferSize >= 50 * 1024)
    .slice(0, 5);
  if (heavyFonts.length >= 2) {
    actions.push({
      priority: "P1",
      title: "Reduce first-load font cost",
      why: "Multiple large font files in the critical path increase first paint latency.",
      evidence: {
        heavyFonts,
      },
      nextSteps: [
        "Reduce initial font weights.",
        "Prefer system font for body text.",
        "Move to WOFF2/subset fonts if possible.",
      ],
    });
  }

  return {
    formFactor: lhr.configSettings?.formFactor ?? "unknown",
    fetchTime: lhr.fetchTime ?? null,
    requestedUrl: lhr.requestedUrl ?? null,
    finalUrl: lhr.finalUrl ?? null,
    performanceScore: perf.score ?? null,
    metrics,
    weightedIssues,
    topNetwork,
    actions,
  };
}

function pickRun(runs, formFactor) {
  return runs.find((run) => run.formFactor === formFactor) ?? null;
}

function buildReport(inputPath, lhrs) {
  const runs = lhrs.map(summarizeRun);
  const mobile = pickRun(runs, "mobile");
  const desktop = pickRun(runs, "desktop");

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: path.resolve(inputPath),
    runCount: runs.length,
    runs,
    mobile,
    desktop,
  };
}

function printMetric(run, id) {
  const metric = run?.metrics?.[id];
  return metric?.displayValue ?? "-";
}

function formatPercent(score) {
  if (typeof score !== "number") return "-";
  return `${Math.round(score * 100)}`;
}

function toMd(report) {
  const lines = [];
  const mobile = report.mobile;
  const desktop = report.desktop;

  lines.push(`# PSI Performance Analysis`);
  lines.push("");
  lines.push(`- Source: \`${report.sourceFile}\``);
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Runs detected: ${report.runCount}`);
  lines.push("");
  lines.push("## Baseline");
  lines.push("");
  lines.push("| Run | Score | FCP | LCP | Speed Index | TBT | CLS | TTI |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|");

  for (const run of report.runs) {
    lines.push(
      `| ${run.formFactor} | ${formatPercent(run.performanceScore)} | ${printMetric(
        run,
        "first-contentful-paint"
      )} | ${printMetric(run, "largest-contentful-paint")} | ${printMetric(
        run,
        "speed-index"
      )} | ${printMetric(run, "total-blocking-time")} | ${printMetric(
        run,
        "cumulative-layout-shift"
      )} | ${printMetric(run, "interactive")} |`
    );
  }

  lines.push("");

  if (mobile) {
    lines.push("## Mobile Priority Findings");
    lines.push("");

    const issues = mobile.weightedIssues.slice(0, 5);
    if (!issues.length) {
      lines.push("- No weighted failing metric was detected.");
    } else {
      for (const issue of issues) {
        lines.push(
          `- ${issue.title} (\`${issue.id}\`): score ${issue.score}, weight ${issue.weight}, value ${issue.displayValue ?? "-"}`
        );
      }
    }

    lines.push("");
    lines.push("## Recommended Actions");
    lines.push("");

    if (!mobile.actions.length) {
      lines.push("- No high-confidence action inferred from current PSI payload.");
    } else {
      mobile.actions.forEach((action, index) => {
        lines.push(`${index + 1}. [${action.priority}] ${action.title}`);
        lines.push(`   - Why: ${action.why}`);
        lines.push(`   - Evidence: \`${JSON.stringify(action.evidence)}\``);
        lines.push(`   - Next: ${action.nextSteps.join(" ")}`);
      });
    }
    lines.push("");
  }

  lines.push("## Next Step");
  lines.push("");
  lines.push("- Implement top `P0` actions, then re-run PSI and compare deltas.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = fs.readFileSync(args.input, "utf8");
  const lhrs = collectLhrsFromHtml(raw);
  const report = buildReport(args.input, lhrs);
  const output = args.format === "json" ? JSON.stringify(report, null, 2) : toMd(report);

  if (args.out) {
    fs.writeFileSync(args.out, output, "utf8");
  } else {
    process.stdout.write(output);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`analyze-pagespeed-html: ${message}\n`);
  process.exit(1);
}
