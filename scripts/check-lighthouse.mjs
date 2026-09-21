// Fails the build if Lighthouse scores drop below the floor. Run after the site is served locally.
// Takes the median across the reports given: Total Blocking Time is dominated by main-thread
// contention on a shared runner, which swings the performance score by 20+ points between
// otherwise identical runs, so a single sample cannot gate a deploy.
// Usage: node scripts/check-lighthouse.mjs <report.json> [...more-reports.json]
import fs from "node:fs";

const paths = process.argv.slice(2);
if (paths.length === 0) { console.error("usage: check-lighthouse.mjs <report.json> [...]"); process.exit(2); }

const reports = paths.map((path) => JSON.parse(fs.readFileSync(path, "utf8")));
const floors = { performance: 85, accessibility: 100, "best-practices": 95, seo: 95 };
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

let failed = false;
for (const [category, floor] of Object.entries(floors)) {
  const runs = reports.map((report) => Math.round(report.categories[category].score * 100));
  const score = median(runs);
  const ok = score >= floor;
  if (!ok) failed = true;
  const spread = runs.length > 1 ? `  [runs: ${runs.join(", ")}]` : "";
  console.log(`${ok ? "PASS" : "FAIL"} ${category}: ${score} (floor ${floor})${spread}`);
}
if (failed) { console.error("Lighthouse floors not met."); process.exit(1); }
