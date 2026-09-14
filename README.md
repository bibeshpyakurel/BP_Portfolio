# BP Portfolio

Personal site for Bibesh Pyakurel: an industry-facing homepage and a research page, deployed to GitHub Pages. No framework, no build dependencies beyond Node, no vendor CSS or JS.

Live: https://bibeshpyakurel.github.io/BP_Portfolio/

## How it works

- `data/portfolio.json` is the single source of truth for all career-facing content: hero copy, stats, experience, projects, skills, publications, education, and profile links.
- `scripts/build-site.mjs` renders `index.html` and `research.html` from that data. Both HTML files are committed so the repo can be previewed without a build, and the deploy workflow regenerates them on every push to `main`.
- `scripts/validate-portfolio.mjs` rejects data that contains emails, phone numbers, non-HTTPS links, restricted language, or missing required fields. It runs before every deploy.
- `assets/css/site/site.css` holds the whole design system: tokens for dark and light themes, layout, components, and responsive rules.
- `assets/js/site/site.js` is progressive enhancement only: theme toggle, mobile menu, scroll reveal, current-section nav, and copy-to-clipboard. The site is fully usable with JavaScript disabled.
- The private `Bibesh_Master_Documents` repository proposes reviewed updates to `data/portfolio.json` through its own workflow.

## Editing

```bash
# 1. edit data/portfolio.json
node scripts/validate-portfolio.mjs data/portfolio.json
node scripts/build-site.mjs
python3 -m http.server 8000   # open http://localhost:8000
```

Content fields worth knowing:

- `profile.stats`: exactly four `{ value, label }` pairs shown under the hero.
- `projects[].featured`: `true` renders a full card in Selected work; `false` renders a compact card under More projects.
- `projects[].metric`: optional `{ value, label }` highlighted on featured cards.
- `projects[].links`: only `https://` URLs render. Leave a link empty rather than pointing at a dead page.
- `publications[].meta`: the one-line descriptor shown above each paper title.

Design tokens live at the top of `site.css`. The dark palette is the default; the light palette applies when the visitor's system prefers light or when they use the toggle, which stores its choice in `localStorage` under `bp-theme`.

## Images

Source photos are resized with `sips` on macOS. Current assets:

| File | Use |
|---|---|
| `portrait-800.jpg`, `portrait-480.jpg` | Hero portrait on both pages |
| `grad-1280.jpg`, `grad-720.jpg` | About section photo |
| `og-image.jpg` | 1200×630 Open Graph and Twitter card image |
| `apple-touch-icon.png`, `favicon.ico` | Icons |

## Deployment

`.github/workflows/static.yml` validates the data, builds the pages, and deploys to GitHub Pages on every push to `main`.
