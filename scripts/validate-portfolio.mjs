import fs from "node:fs";

const file = process.argv[2] || "data/portfolio.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => { throw new Error(`Portfolio validation failed: ${message}`); };
if (data.version !== 1) fail("version must be 1");
if (!data.profile || !Array.isArray(data.profile.about) || !data.profile.about.length) fail("profile.about is required");
for (const key of ["experience", "projects", "skills", "publications"]) if (!Array.isArray(data[key])) fail(`${key} must be an array`);
const allIds = [...data.experience, ...data.projects, ...data.publications].map((item) => item.id);
if (allIds.some((id) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) fail("all IDs must be lowercase kebab-case");
if (new Set(allIds).size !== allIds.length) fail("IDs must be unique across managed content");
const walk = (value, trail = "root") => {
  if (typeof value === "string") {
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) fail(`${trail} contains an email address`);
    const isSemanticScholarAuthorUrl = /^https:\/\/(?:www\.)?semanticscholar\.org\/author\/[^/]+\/\d+\/?$/.test(value);
    if (!isSemanticScholarAuthorUrl && /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(value)) fail(`${trail} contains a phone number`);
    if (/\b(?:USCIS|SEVIS|I-?983|passport|alien registration|A-number)\b/i.test(value)) fail(`${trail} contains restricted language`);
    if (/^(?!https:\/\/).+:\/\//.test(value)) fail(`${trail} contains a non-HTTPS URL`);
  } else if (Array.isArray(value)) value.forEach((entry, index) => walk(entry, `${trail}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => walk(entry, `${trail}.${key}`));
};
walk(data);
const categories = new Set(["backend", "data", "ai", "web", "research", "security", "mobile"]);
for (const project of data.projects) if (!project.name || !project.summary || !project.kind || !project.date || project.categories.some((category) => !categories.has(category))) fail(`project ${project.id} is invalid`);
for (const key of ["hero", "lead", "tagline", "availability", "location"]) if (typeof data.profile[key] !== "string" || !data.profile[key]) fail(`profile.${key} is required`);
if (!Array.isArray(data.profile.stats) || data.profile.stats.length !== 4) fail("profile.stats must have exactly 4 entries");
if (!data.profile.education?.degree || !data.profile.education?.school) fail("profile.education is required");
if (data.projects.filter((project) => project.featured).length < 3) fail("at least 3 projects must be featured");
for (const project of data.projects) if (project.metric !== null && project.metric !== undefined && (!project.metric.value || !project.metric.label)) fail(`project ${project.id} has an incomplete metric`);
// A paper without an arXiv record (a journal manuscript in revision) leaves arxivId empty; any arXiv-backed paper must link it.
for (const publication of data.publications) if (!publication.meta || !publication.summary || (publication.arxivId && !publication.links?.arxiv)) fail(`publication ${publication.id} is invalid`);
console.log(`Validated ${data.experience.length} experiences, ${data.projects.length} projects, and ${data.publications.length} publications.`);
