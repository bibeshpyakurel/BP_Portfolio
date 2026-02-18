# BP Portfolio

Personal portfolio website showcasing projects, work experience, skills, publications, certifications, and contact details.

## Live Site

This repository is configured for GitHub Pages deployment via GitHub Actions.

## Project Type

- Static HTML5/CSS/JS site
- No build step required
- GitHub Pages compatible

## Current Structure

```text
.
├── index.html
├── README.md
├── CONTENT_INVENTORY.md
├── assets/
│   ├── css/
│   │   ├── app/
│   │   │   └── style.css
│   │   └── vendor/
│   ├── js/
│   │   ├── app/
│   │   │   ├── main.js
│   │   │   └── google_map.js
│   │   └── vendor/
│   ├── img/
│   └── fonts/
└── .github/
	└── workflows/
		└── static.yml
```

## Local Development

Run with a local static server (recommended to avoid file path/browser restrictions):

```bash
cd BP_Portfolio
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Editing Guide

- Main page content and section markup: `index.html`
- Custom styles and design tokens: `assets/css/app/style.css`
- Site interactions/animations/navigation: `assets/js/app/main.js`
- Optional map script (safe no-op when map/API absent): `assets/js/app/google_map.js`
- Images/icons: `assets/img/`
- Icon fonts: `assets/fonts/`

## Deployment (GitHub Pages)

Deployment is handled by `.github/workflows/static.yml`:

- Trigger: push to `main`
- Artifact path: repository root (`.`)
- Published entry point: `index.html`

## Notes

- Keep asset paths relative (e.g., `assets/...`) to stay GitHub Pages-safe.
- If adding new pages (e.g., `blog.html`, `work.html`), keep them at root level unless you also update links.
- If adding a favicon, place it in a committed path and update the `<link rel="shortcut icon">` in `index.html`.

