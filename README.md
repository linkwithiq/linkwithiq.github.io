# Link with iQ — linkwithiq.github.io

Source for the Link with iQ website. Static HTML/CSS/JS, no build step, no dependencies — deploys straight to GitHub Pages.

Owned & maintained by **Ajit** ([asrbmy](https://asrbmy.github.io)).

## Site map

```
index.html          — homepage (mission, projects, resources teaser, process, FAQ, about teaser, contact)
about.html           — full About page (story, values, founder, timeline)
resources.html        — dedicated Resources page
blog.html             — Blog index
blog/*.html            — individual posts
research.html          — Research index
research/*.html        — individual research notes
news.html             — Announcements
policy.html            — Where we stand (licensing, AI use, accessibility, data)
terms.html            — Terms of Use & Privacy Policy
404.html              — Themed not-found page (GitHub Pages serves this automatically)

styles.css            — design system + layout (single stylesheet, shared by every page)
script.js             — all interactive behavior (shared by every page)

manifest.json, robots.txt, sitemap.xml — PWA/SEO metadata
assets/               — logo exports (PNG + SVG) and favicons
```

Every page shares the same header, footer, loading screen, and `<script src="script.js">` — there's no build step stitching them together; each `.html` file is a complete, independent document. Pages inside a subfolder (`blog/`, `research/`) use `../` prefixes for their asset paths.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages (linkwithiq.github.io)

1. Create (or use) the repo named exactly `linkwithiq.github.io` under the `linkwithiq` GitHub account/org.
2. Copy everything in this folder into the repo root, preserving the folder structure (`blog/`, `research/`, `assets/` all need to stay as subfolders).
3. Commit and push to `main`:
   ```bash
   git init
   git add .
   git commit -m "Launch Link with iQ site"
   git branch -M main
   git remote add origin https://github.com/linkwithiq/linkwithiq.github.io.git
   git push -u origin main
   ```
4. In the repo's **Settings → Pages**, set the source to `Deploy from a branch` → `main` → `/ (root)`.
5. Visit `https://linkwithiq.github.io` to confirm it's live.

## Features

- **Project filters** — the Projects grid has All / Live / In Progress / Concept tabs (`data-status` on each `.project-card`).
- **FAQ accordion** — native `<details>`/`<summary>`, no JS required, fully keyboard- and screen-reader-accessible.
- **Scroll progress bar** and **back-to-top button**.
- **Scrollspy nav** — the active section is highlighted in the top nav as you scroll through the homepage.
- **Copy-email button** with "Copied!" feedback (falls back to `document.execCommand` for older browsers without `navigator.clipboard`).
- **Newsletter capture** — validates the email client-side, then opens a pre-filled `mailto:` since there's no backend.
- **Loading screen** — on first paint, the logo draws itself in (SVG stroke animation, ~3 seconds total), fills solid, reveals the "Link with iQ" wordmark beneath it, then crossfades into the site. Respects `prefers-reduced-motion`, and has three independent fail-safes (a `transitionend`-driven primary path, a `setTimeout` backup, and a hard 6-second timeout in an inline script independent of the main bundle) so it can never trap a visitor on a stuck screen.
- **Accessibility** — skip-to-content link, focus trap + Escape-to-close on the mobile nav, `scroll-margin-top` on every section so anchor links don't land underneath the sticky header, visible focus states on every interactive element type.
- **SEO** — Open Graph + Twitter Card tags, canonical URLs, JSON-LD `Organization` structured data, `robots.txt`, `sitemap.xml`, a web manifest.
- **Security** — a `<meta>`-based Content-Security-Policy and Referrer-Policy on every page, all external links use `rel="noopener noreferrer"`.

## Logo

`assets/svg/` holds the logo mark as clean vector paths, traced directly from the original artwork, in four color variants matching the site's design tokens (`logo-mark-rust.svg`, `logo-mark-cream.svg`, `logo-mark-ink.svg`, `logo-mark-currentcolor.svg`). The favicon and the inline marks in the header/hero/footer all use these vectors rather than a raster image.

## A note on the content

The projects, blog posts, and research notes in this repo are realistic **placeholder content** — Link with iQ is a genuinely early-stage project, and the copy is written to be honest about that (no fabricated user counts, press coverage, or testimonials). Swap in real project details and real posts as they happen. The Terms & Privacy page is written to accurately describe what this specific static site does and doesn't collect today — update it if that changes (e.g. if you add analytics or a backend).

## Known bugs found and fixed during development

Documenting these because the fixes are non-obvious and could easily be reintroduced by a future edit:

- **`backdrop-filter` on `.site-header` was trapping the fixed-position mobile nav overlay inside the header's own (short) box instead of the full viewport**, because `backdrop-filter` (like `filter`/`transform`) creates a new CSS containing block for `position: fixed` descendants. Fixed by moving the blur effect to a `.site-header::before` pseudo-element instead, so `.site-header` itself has no filter property and doesn't trap its fixed-position children. Confirmed via real Chrome testing (reproduced the bug, measured the incorrect ~124px height, fixed it, remeasured at the correct full-viewport height).
- The CSS `inset` shorthand isn't supported in every rendering environment; all usages across the site use explicit `top/right/bottom/left` instead.

## Design tokens

CSS custom properties in `styles.css` (`:root`):

- `--ink` / `--ink-soft` / `--ink-panel` — background surfaces, darkest to lightest
- `--cream` / `--cream-dim` — primary and secondary text
- `--rust` / `--rust-deep` — brand accent orange and its darker variant
- `--link` — currently aliased to `--rust`; kept as a separate token so accent-colored text (links, small labels) can be retuned independently of large graphic fills (buttons, the logo, the progress bar) without touching every usage individually
- `--on-accent` — always-dark text color for anything sitting on top of an accent-colored surface (e.g. button labels), decoupled from the page background token
- `--signal` / `--signal-br` — secondary green accent (status indicators)
- `--hair` / `--hair-strong` — border/divider opacity levels

## License

The code in this repository — HTML, CSS, JS, and the site's own SVG logo marks — is licensed under [MIT](LICENSE).

Written content (blog posts, research notes, page copy) is **not** covered by that MIT grant and follows the narrower terms in [`terms.html`](terms.html#licensing) instead: quoting with attribution and a link back is welcome, wholesale republishing as your own isn't.

