import fs from "node:fs/promises";

const data = JSON.parse(await fs.readFile("data/portfolio.json", "utf8"));
const serialized = JSON.stringify(data, null, 2).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
await fs.writeFile("assets/js/site/portfolio-data.js", `globalThis.BP_PORTFOLIO_DATA = Object.freeze(${serialized});\n`, "utf8");
console.log("Built assets/js/site/portfolio-data.js");
