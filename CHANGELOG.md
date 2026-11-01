# Changelog

All notable changes to Link with iQ are documented here. This file mirrors the [live changelog](https://linkwithiq.github.io/changelog.html) — if the two ever disagree, the live page is the one being actively edited; open an issue and we'll sync this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates are month-precision (`YYYY-MM`) to match what's actually tracked on the live site — no fabricated day-level precision.

## [Unreleased] — roadmap

Roughly ordered by what's likely to land soonest. Nothing here is promised; see [`now.html`](https://linkwithiq.github.io/now.html) for what's actually being worked on right now.

- **Soon** — GitHub Discussions (Giscus) integration, so people can comment on blog posts and project updates with their GitHub login
- **Soon** — Resource Finder pilot region launch, once the initial dataset is verified
- **Exploring** — Study With iQ: a second (Python) learning track, once the web-basics track has been tested by real learners
- **Exploring** — Report It pilot city, pending a city with usable public-works reporting intake ([research note](https://linkwithiq.github.io/research.html))

## 2026-10

### Added
- Accessibility statement (`accessibility.html`) and brand kit (`brand.html`)
- Offline support via a small service worker (`sw.js`) that caches only this site's own files in the visitor's browser
- GitHub issue and pull-request templates, a weekly external link check, Dependabot for Actions, and an optional pre-commit hook
- Automated accessibility test (axe-core) in CI, and a page-weight budget in `check_site.py`
- Better 404 page with a page list and a "did you mean" suggestion; a "Report a problem" footer link; JSON Feed (`feed.json`); three new FAQ answers; `CODE_OF_CONDUCT.md`

### Changed
- Inline links in text are now underlined (WCAG 1.4.1); the copy-email button's accessible name now includes its visible text (WCAG 2.5.3)
- Fonts (Oswald, Inter, JetBrains Mono) are now self-hosted in `assets/fonts/`; Google Fonts is no longer used
- Accent text and green status text lightened to reach 7:1 contrast; main controls are at least 44×44px
- Privacy policy updated to match (fonts, offline cache, no theme preference)

- "In short" summaries on the Policy and Terms pages; ready-to-copy boilerplate on the brand kit; latest release tag on project cards when a release exists
- Optional "Comfortable reading" button (larger, more widely spaced text, saved in this browser only; disclosed in `terms.html`)
- Visual regression check (`scripts/visual_check.js` + workflow), `scripts/update_lastmod.py`, and `docs/LAUNCH_CHECKLIST.md`

- Project detail pages (`project.html?slug=…`) now work: `script.js` fills them from `data/projects.js`, with a "Details" link on every home-page project card
- `.github/FUNDING.yml` (GitHub Sponsors: linkwithiq); per-post social images and BlogPosting/Article structured data for blog posts and the research note; blog and research pages are in the sitemap

### Security
- Inline scripts are now allowed by hash instead of `'unsafe-inline'` in the Content-Security-Policy; `scripts/csp_hashes.py` regenerates the hashes and `check_site.py` fails if one is missing
- Links and avatar images from the GitHub API are only used if they point at github.com or avatars.githubusercontent.com

### Fixed
- Blog and research pages brought in line with the rest of the site (self-hosted fonts, hash-based CSP, current email, footer links, skip link)
- Service worker now registers from the site root so it also covers `blog/` and `research/`
- Spacing: less dead space under page titles on inner pages; on phones and tablets the home page headline and buttons now come before the large logo
- Heading levels no longer skip (footer headings, post lists); axe best-practice rules now pass
- `project.html` shows a "couldn't find that project" message instead of a blank page when nothing has filled in the template

### Removed
- The "Theme preference" claim from the privacy policy (the theme toggle no longer exists)

## 2026-08

### Added
- Full site expansion: Blog, Research, News, Policy, Community, and Terms & Privacy pages, plus live GitHub-powered project stats, contributor avatars, and a good-first-issue feed on the Community page
- Hand-traced SVG logo (replacing the original raster version), with a draw-in loading animation on first visit
- `linkwithiq.github.io` launched — homepage, project cards, and Resources section went live

---

*This file was added retroactively alongside the live Changelog page and doesn't yet track changes prior to the initial 2026-08 entries above.*
