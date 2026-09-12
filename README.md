# BP Portfolio

Portfolio site with an industry-facing homepage and a dedicated research page, built as a static HTML/CSS/JS application and deployed on GitHub Pages.

## Architecture

### Runtime model
- `index.html` is the industry-facing page; `research.html` is the academic-facing page.
- `assets/css/site/portfolio.css` contains design tokens, theme definitions, layout, and section-level overrides.
- `assets/css/site/research.css` styles the standalone research page.
- `assets/js/site/portfolio.js` owns all behavior:
  - navigation/scroll interactions
  - theme switching + persistence
  - reveal/motion interactions
  - project filtering/search
  - copy-to-clipboard actions
  - GitHub metrics fetch + cache

### External dependencies
- Vendor JS/CSS are loaded from local `assets/.../vendor` paths (not CDN).
- This keeps deploy simple (no build step) and avoids runtime dependency on third-party CDNs.

### Data flow
- Career-facing content is stored in `data/portfolio.json` and rendered by
  `assets/js/site/portfolio-content.js` before the main interaction script runs.
- The private `Bibesh_Master_Documents` repository proposes reviewed updates to
  this data file through a privacy-scoped AI workflow.
- Existing static HTML remains a fallback if managed data cannot load.
- Dynamic data is limited to GitHub metrics:
  - fetched client-side from GitHub public API
  - cached in `localStorage` with TTL
  - rendered into metric cards

## Key Decisions

1. Static-first deployment
- Decision: no framework/build pipeline.
- Why: low operational complexity, fast hosting on GitHub Pages, easy editing.
- Tradeoff: larger manual CSS/JS maintenance surface.

2. Theme system via HTML attribute
- Decision: use `data-theme` on `<html>` and token-driven CSS.
- Why: predictable theming and easy persistence.
- Config source: `index.html` root attribute `data-github-username` (for metrics username).

3. Single-file section composition
- Decision: keep all sections in one document.
- Why: straightforward portfolio browsing and anchor navigation.
- Tradeoff: `index.html` is long and requires careful section-level discipline.

4. Client-side GitHub metrics with pagination
- Decision: metrics fetched in browser with paginated repo/events requests.
- Why: improves accuracy for higher-activity accounts without backend.
- Tradeoff: private data is not available without authenticated backend/token flow.

5. Defensive overrides for layout stability
- Decision: section-specific “hard lock” selectors for fragile areas (hero, contact, about, grids).
- Why: ensures consistent rendering despite legacy/template CSS interactions.
- Tradeoff: higher selector specificity and potential cascade complexity.

## GitHub Metrics Design

Implemented in `assets/js/site/portfolio.js` under `githubMetrics()`.

- Username source: `<html data-github-username="...">`
- Fetches:
  - `GET /users/:username`
  - paginated `GET /users/:username/repos?per_page=100`
  - paginated `GET /users/:username/events/public?per_page=100`
- Outputs:
  - Total Public Repos
  - Public Push Commits (30 days)
  - Top Languages (Top 3)
- Cache key: `bp-github-metrics-v6`

## Project Structure

```text
.
├── index.html
├── research.html
├── README.md
├── CONTENT_INVENTORY.md
├── assets/
│   ├── css/
│   │   ├── site/portfolio.css
│   │   └── vendor/
│   ├── js/
│   │   ├── site/portfolio.js
│   │   └── vendor/
│   ├── img/
│   └── fonts/
└── .github/workflows/static.yml
```

## Local Development

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Editing Guide

- Page content/sections: `index.html`
- Design tokens/layout/theme CSS: `assets/css/site/portfolio.css`
- Behavior and integrations: `assets/js/site/portfolio.js`
- GitHub username config: `index.html` (`data-github-username`)
- Managed experience, projects, research publications, skills, about text, and
  Google Scholar link: `data/portfolio.json`
- The research page also renders its paper list and research-profile links from
  the same data after the first successful master-documents sync.
- The research page's paper summaries and profile links are also written into
  `research.html`; update both places when a paper or profile URL changes.

Validate and rebuild managed data locally with:

```bash
node scripts/validate-portfolio.mjs data/portfolio.json
node scripts/build-portfolio-data.mjs
```

## Deployment

GitHub Pages deploy is handled by `.github/workflows/static.yml` on push to `main`.

## Known Tradeoffs

- Large CSS file with historical overrides; continue gradual cleanup by section.
- Single-page architecture is simple but can grow hard to maintain without modular CSS conventions.
