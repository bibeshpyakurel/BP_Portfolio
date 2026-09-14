// Fails the build if Lighthouse scores drop below the floor. Run after the site is served locally.
// Usage: node scripts/check-lighthouse.mjs <lighthouse-report.json>
import fs from "node:fs";
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const floors = { performance: 85, accessibility: 100, "best-practices": 95, seo: 95 };
const scores = Object.fromEntries(Object.entries(floors).map(([k]) => [k, Math.round(report.categories[k].score * 100)]));
let failed = false;
for (const [k, floor] of Object.entries(floors)) {
  const ok = scores[k] >= floor;
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"} ${k}: ${scores[k]} (floor ${floor})`);
}
if (failed) { console.error("Lighthouse floors not met."); process.exit(1); }
