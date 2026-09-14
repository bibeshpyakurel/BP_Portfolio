// Renders index.html and research.html from data/portfolio.json.
// Run: node scripts/build-site.mjs
import fs from "node:fs/promises";

const SITE = "https://bibeshpyakurel.github.io/BP_Portfolio/";
const data = JSON.parse(await fs.readFile("data/portfolio.json", "utf8"));
const p = data.profile;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const url = (v) => (/^https:\/\//.test(v || "") ? esc(v) : "");
const ext = (href, label, cls = "button button--small") => (url(href) ? `<a class="${cls}" href="${url(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}${ARROW}</a>` : "");
const chips = (items, cls = "chip") => (items?.length ? `<ul class="chips" aria-label="Technologies">${items.map((i) => `<li class="${cls}">${esc(i)}</li>`).join("")}</ul>` : "");
const bullets = (items, cls) => (items?.length ? `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "");

const ARROW = `<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 12 4M6 4h6v6"/></svg>`;
const ICONS = {
  github: `<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`,
  linkedin: `<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M13.6 0H2.4A2.4 2.4 0 0 0 0 2.4v11.2A2.4 2.4 0 0 0 2.4 16h11.2a2.4 2.4 0 0 0 2.4-2.4V2.4A2.4 2.4 0 0 0 13.6 0ZM5 13H3V6h2v7ZM4 5a1.2 1.2 0 1 1 0-2.4A1.2 1.2 0 0 1 4 5Zm9 8h-2V9.6c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.8-.1.1-.1.4-.1.6V13H6.7V6h2v.9c.3-.4.9-1.1 2.1-1.1 1.5 0 2.6 1 2.6 3.1V13Z"/></svg>`,
  scholar: `<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1 0 6l8 5 6.5-4.06V12H16V6L8 1Zm-4.4 8.2V12c0 1.1 2 2.5 4.4 2.5s4.4-1.4 4.4-2.5V9.2L8 12 3.6 9.2Z"/></svg>`,
  sun: `<svg class="icon-sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>`,
  moon: `<svg class="icon-moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
  mail: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  menu: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`
};

const themeScript = `<script>(function(){try{var t=localStorage.getItem("bp-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();</script>`;

const head = ({ title, description, path, ogImage }) => `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(p.name)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(p.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Portrait of ${esc(p.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${ogImage}">
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f7fa" media="(prefers-color-scheme: light)">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="manifest.webmanifest">
${themeScript}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">
<link rel="stylesheet" href="assets/css/site/site.css">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: p.name,
  url: SITE,
  image: SITE + "assets/img/portrait-800.jpg",
  jobTitle: "Software, Data, and AI Engineer",
  alumniOf: { "@type": "CollegeOrUniversity", name: p.education.school, url: p.education.schoolUrl },
  sameAs: [p.links.github, p.links.linkedin, p.links.googleScholar, p.links.semanticScholar]
})}</script>
</head>`;

const header = (page) => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="index.html">${esc(p.name)}</a>
    ${page === "index" ? `<nav class="site-nav" aria-label="Sections">
      <a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#research">Research</a><a href="#about">About</a><a href="#contact">Contact</a><a class="site-nav__switch" href="research.html">Research portfolio →</a>
    </nav>` : `<nav class="site-nav" aria-label="Sections">
      <a href="#interests">Interests</a><a href="#papers">Papers</a><a href="#profiles">Profiles</a><a class="site-nav__switch" href="index.html">Industry portfolio →</a>
    </nav>`}
    <div class="site-header__actions">
      <nav class="portfolio-switch" aria-label="Portfolio paths">
        <a href="index.html"${page === "index" ? ' aria-current="page"' : ""}>Industry</a>
        <a href="research.html"${page === "research" ? ' aria-current="page"' : ""}>Research</a>
      </nav>
      <button class="theme-toggle" type="button" aria-label="Switch theme">${ICONS.sun}${ICONS.moon}</button>
      <button class="theme-toggle menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">${ICONS.menu}</button>
    </div>
  </div>
</header>`;

const footer = (page) => `<footer class="site-footer">
  <span>© ${new Date().getFullYear()} ${esc(p.name)} · ${esc(p.location)}</span>
  <span>${page === "index" ? `<a href="research.html">Research portfolio</a>` : `<a href="index.html">Industry portfolio</a>`} · <a href="https://github.com/bibeshpyakurel/BP_Portfolio" target="_blank" rel="noopener noreferrer">Source on GitHub</a></span>
</footer>
<script defer src="assets/js/site/site.js"></script>
</body>
</html>
`;

const heading = (n, eyebrow, title, intro = "") => `<div class="section-heading reveal">
  <p class="eyebrow">${n} / ${esc(eyebrow)}</p>
  <h2 id="${eyebrow.toLowerCase().replace(/[^a-z]+/g, "-")}-title">${esc(title)}</h2>
  ${intro ? `<p class="section-intro">${esc(intro)}</p>` : ""}
</div>`;

const workCard = (x) => `<article class="work-card reveal">
  <div class="work-card__top"><span class="work-card__kind">${esc(x.kind)}</span><span class="work-card__date">${esc(x.date)}</span></div>
  <h3>${url(x.links.github || x.links.publication) ? `<a href="${url(x.links.github || x.links.publication)}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>` : esc(x.name)}</h3>
  <p class="work-card__summary">${esc(x.summary)}</p>
  ${x.metric ? `<p class="work-card__metric"><strong>${esc(x.metric.value)}</strong><span>${esc(x.metric.label)}</span></p>` : ""}
  ${bullets(x.highlights, "work-card__highlights")}
  <div class="work-card__footer">
    ${chips(x.technologies)}
    <div class="work-card__links">${ext(x.links.github, "Code")}${ext(x.links.live, "Live app")}${ext(x.links.publication, "Paper")}</div>
  </div>
</article>`;

const miniCard = (x) => {
  const href = url(x.links.github || x.links.publication);
  return `<li class="mini-card reveal">
  <span class="mini-card__kind">${esc(x.kind)}</span>
  <h4>${href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a>` : esc(x.name)}</h4>
  <p>${esc(x.summary)}</p>
  <div class="mini-card__meta"><span>${esc(x.date)}</span><span>${esc(x.technologies.slice(0, 3).join(" · "))}</span></div>
</li>`;
};

const timelineItem = (x) => `<li class="timeline-item reveal">
  <div class="timeline-item__when">${esc(x.startDate)} – ${esc(x.endDate)}<small>${esc(x.location)}</small></div>
  <div>
    <h3>${esc(x.role)} <span>· ${url(x.url) ? `<a href="${url(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.organization)}</a>` : esc(x.organization)}</span></h3>
    <p class="timeline-item__summary">${esc(x.summary)}</p>
    ${bullets(x.highlights, "timeline-item__highlights")}
    ${chips(x.skills)}
  </div>
</li>`;

const paperCard = (x, i) => `<article class="paper-card reveal" aria-labelledby="${esc(x.id)}-title">
  <div class="paper-card__marker"><span>${esc(x.date.slice(-4))}</span><span>0${i + 1}</span></div>
  <div class="paper-card__content">
    <p class="paper-meta">${esc(x.meta)}</p>
    <h3 id="${esc(x.id)}-title">${esc(x.title)}</h3>
    <p class="paper-authors">${x.authors.map((a) => (a === p.name ? `<strong>${esc(a)}</strong>` : esc(a))).join(" · ")}</p>
    <p class="paper-card__summary">${esc(x.summary)}</p>
    <div class="paper-links">${ext(x.links.arxiv, "arXiv")}${ext(x.links.pdf, "PDF")}${ext(x.links.doi, "DOI")}${ext(x.links.code, "Code & data")}</div>
  </div>
</article>`;

const featured = data.projects.filter((x) => x.featured);
const more = data.projects.filter((x) => !x.featured);

const indexHtml = `${head({ title: `${p.name} | Software, Data & AI Engineer`, description: p.headline, path: "", ogImage: "assets/img/og-image.jpg" })}
<body>
${header("index")}
<main id="main" tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <div>
      <p class="eyebrow">${esc(p.tagline)}</p>
      <h1 id="hero-title">${esc(p.hero)}</h1>
      <p class="lead">${esc(p.lead)}</p>
      <div class="actions">
        <a class="button button--primary" href="#projects">Selected projects</a>
        <a class="button" href="research.html">Read the research</a>
      </div>
      <ul class="hero__links" aria-label="Profiles">
        <li><a href="${url(p.links.github)}" target="_blank" rel="noopener noreferrer">${ICONS.github}GitHub</a></li>
        <li><a href="${url(p.links.linkedin)}" target="_blank" rel="noopener noreferrer">${ICONS.linkedin}LinkedIn</a></li>
        <li><a href="${url(p.links.googleScholar)}" target="_blank" rel="noopener noreferrer">${ICONS.scholar}Google Scholar</a></li>
      </ul>
    </div>
    <figure class="hero__portrait">
      <img src="assets/img/portrait-800.jpg" srcset="assets/img/portrait-480.jpg 480w, assets/img/portrait-800.jpg 800w" sizes="(max-width: 820px) 300px, 380px" width="800" height="800" alt="Portrait of ${esc(p.name)}" fetchpriority="high" decoding="async">
      <span>${esc(p.location.split(" · ")[0])}</span>
    </figure>
  </section>

  <dl class="stats" aria-label="Highlights">
    ${p.stats.map((s) => `<div class="stat reveal"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("\n    ")}
  </dl>

  <section id="experience" class="section" aria-labelledby="experience-title">
    ${heading("01", "Experience", "Where I have worked", "Five internships and a research lead role, across backend engineering, data platforms, and applied AI.")}
    <ol class="timeline">
      ${data.experience.map(timelineItem).join("\n      ")}
    </ol>
    ${data.alsoExperience?.length ? `<div class="also"><strong>Also:</strong> <ul>${data.alsoExperience.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>` : ""}
  </section>

  <section id="projects" class="section" aria-labelledby="projects-title">
    ${heading("02", "Projects", "Selected projects", "Products with real users and research that ships as code. Each one is on GitHub.")}
    <div class="work-grid">
      ${featured.map(workCard).join("\n      ")}
    </div>
    <div class="more-work">
      <h3>More projects</h3>
      <ul class="mini-grid">
        ${more.map(miniCard).join("\n        ")}
      </ul>
    </div>
  </section>

  <section id="research" class="section" aria-labelledby="research-title">
    ${heading("03", "Research", "Papers", "Applied computer vision and multimodal model evaluation, with an emphasis on rigorous benchmarks and reproducible conclusions.")}
    <div class="paper-list">
      ${data.publications.map(paperCard).join("\n      ")}
    </div>
    <div class="research-cta reveal">
      <a class="button" href="research.html">Explore the research portfolio${ARROW}</a>
      <span>Interests: ${esc(p.researchInterests.map((r) => r.title).join(" · "))}</span>
    </div>
  </section>

  <section id="skills" class="section" aria-labelledby="skills-title">
    ${heading("04", "Skills", "What I work with")}
    <div class="skills-grid">
      ${data.skills.map((g) => `<div class="skill-group reveal"><h3>${esc(g.category)}</h3>${chips(g.items)}</div>`).join("\n      ")}
    </div>
  </section>

  <section id="about" class="section" aria-labelledby="about-title">
    ${heading("05", "About", "Trained as an engineer, poet at heart")}
    <div class="about-grid">
      <div class="about-copy reveal">
        ${p.about.map((t) => `<p>${esc(t)}</p>`).join("\n        ")}
      </div>
      <figure class="about-photo reveal">
        <img src="assets/img/grad-720.jpg" srcset="assets/img/grad-720.jpg 540w, assets/img/grad-1280.jpg 960w" sizes="(max-width: 820px) 360px, 420px" width="540" height="720" alt="${esc(p.name)} in graduation regalia outside the Weidner Center at UW–Green Bay" loading="lazy" decoding="async">
        <figcaption>Graduation, December 2025 · UW–Green Bay</figcaption>
      </figure>
    </div>
    <div class="education reveal">
      <div class="education__when">${esc(p.education.dates)}</div>
      <div>
        <h3>${esc(p.education.degree)} <span>· <a href="${url(p.education.schoolUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.education.school)}</a></span></h3>
        ${bullets(p.education.notes, "")}
      </div>
    </div>
    <div class="about-cards">
      ${p.beyond.map((b) => `<div class="about-card reveal"><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join("\n      ")}
    </div>
  </section>

  <section id="contact" class="section" aria-labelledby="contact-title">
    <div class="contact reveal">
      <div class="contact__intro">
        <p class="eyebrow">06 / Contact</p>
        <h2 id="contact-title">Let's build something that matters.</h2>
        <p class="lead">${esc(p.availability)} Email is the fastest way to reach me; LinkedIn works too.</p>
      </div>
      <ul class="contact-grid" aria-label="Ways to reach me">
        <li><a class="contact-tile" href="mailto:bibespyakurel1100@gmail.com">${ICONS.mail}<span class="contact-tile__label">Email</span><span class="contact-tile__value">Send a message</span>${ARROW}</a></li>
        <li><a class="contact-tile" href="${url(p.links.linkedin)}" target="_blank" rel="noopener noreferrer">${ICONS.linkedin}<span class="contact-tile__label">LinkedIn</span><span class="contact-tile__value">in/bibeshpyakurel</span>${ARROW}</a></li>
        <li><a class="contact-tile" href="${url(p.links.github)}" target="_blank" rel="noopener noreferrer">${ICONS.github}<span class="contact-tile__label">GitHub</span><span class="contact-tile__value">@bibeshpyakurel</span>${ARROW}</a></li>
        <li><a class="contact-tile" href="${url(p.links.googleScholar)}" target="_blank" rel="noopener noreferrer">${ICONS.scholar}<span class="contact-tile__label">Google Scholar</span><span class="contact-tile__value">Papers and citations</span>${ARROW}</a></li>
      </ul>
      <p class="contact__foot">
        <button class="link-button" type="button" data-copy="bibespyakurel1100@gmail.com" aria-describedby="copy-status">Copy email address</button>
        <span>·</span>
        <a href="${url(p.links.semanticScholar)}" target="_blank" rel="noopener noreferrer">Semantic Scholar</a>
        <span>·</span>
        <span>${esc(p.location)}</span>
      </p>
      <p id="copy-status" class="copy-status" aria-live="polite"></p>
    </div>
  </section>
</main>
${footer("index")}`;

const researchHtml = `${head({ title: `${p.name} | Research Portfolio`, description: "Research interests, papers, and academic profiles in computer vision and multimodal AI.", path: "research.html", ogImage: "assets/img/og-image.jpg" })}
<body>
${header("research")}
<main id="main" tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <div>
      <p class="eyebrow">Research portfolio · Graduate study</p>
      <h1 id="hero-title">Applied AI for problems in the physical world.</h1>
      <p class="lead">I am ${esc(p.name)}. My current work combines computer vision, multimodal model evaluation, and careful measurement of systems used outside the lab.</p>
      <div class="actions">
        <a class="button button--primary" href="#papers">Read the papers</a>
        <a class="button" href="#profiles">Academic profiles</a>
      </div>
    </div>
    <figure class="hero__portrait">
      <img src="assets/img/portrait-800.jpg" srcset="assets/img/portrait-480.jpg 480w, assets/img/portrait-800.jpg 800w" sizes="(max-width: 820px) 300px, 380px" width="800" height="800" alt="Portrait of ${esc(p.name)}" fetchpriority="high" decoding="async">
      <span>Research · Software · Data</span>
    </figure>
  </section>

  <section id="interests" class="section" aria-labelledby="direction-title">
    ${heading("01", "Direction", "Research interests")}
    <div class="interests-grid">
      ${p.researchInterests.map((r, i) => `<article class="interest-card reveal"><span class="interest-card__number">0${i + 1}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join("\n      ")}
    </div>
  </section>

  <section id="papers" class="section" aria-labelledby="work-title">
    ${heading("02", "Work", "Research papers", "Two arXiv preprints that show the methods and questions shaping my research.")}
    <div class="paper-list">
      ${data.publications.map(paperCard).join("\n      ")}
    </div>
  </section>

  <section id="profiles" class="section" aria-labelledby="connect-title">
    ${heading("03", "Connect", "Research profiles", "Find my papers, follow new work, or get in touch about research opportunities.")}
    <div class="profile-links">
      <a href="${url(p.links.googleScholar)}" target="_blank" rel="noopener noreferrer"><span>Google Scholar</span>${ARROW}</a>
      <a href="${url(p.links.semanticScholar)}" target="_blank" rel="noopener noreferrer"><span>Semantic Scholar</span>${ARROW}</a>
      <a href="${url(p.links.linkedin)}" target="_blank" rel="noopener noreferrer"><span>LinkedIn</span>${ARROW}</a>
      <a href="${url(p.links.github)}" target="_blank" rel="noopener noreferrer"><span>GitHub</span>${ARROW}</a>
    </div>
  </section>
</main>
${footer("research")}`;

await fs.writeFile("index.html", indexHtml, "utf8");
await fs.writeFile("research.html", researchHtml, "utf8");
console.log(`Built index.html (${featured.length} featured + ${more.length} more projects, ${data.experience.length} roles) and research.html (${data.publications.length} papers).`);
