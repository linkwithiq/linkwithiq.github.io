# Project brief for AI assistants — Link with iQ

Paste this whole file at the start of a session with any AI model, then give it your task.

## What this project is
**Link with iQ** (https://linkwithiq.github.io) is an independent research and development organization building practical, private, and open technology. It is founded, owned, and maintained by **Ajit (asrbmy)**. The site is early-stage: content is honest about that.

- Contact: linkwithiq@proton.me
- GitHub org: https://github.com/linkwithiq
- Hosting: GitHub Pages, deployed straight from the repo root.

## Tech stack
- Static HTML, CSS, and JavaScript. **No build step, no framework, no npm dependencies.**
- One shared `styles.css` (design tokens as CSS custom properties) and one shared `script.js`.
- Every `.html` file is a complete, standalone document with the same header, footer, and loading screen. If you change shared markup (nav, footer), change it on **every** page.
- Pages in subfolders (`blog/`, `research/`) use `../` prefixes for asset paths.
- Fonts: Oswald, JetBrains Mono, Inter via Google Fonts `<link>` tags (no CSS `@import`).

## Pages
index, about, resources, blog, research, news, community, changelog, project, policy, terms, uses, now (hidden placeholder), 404. Also: feed.xml (RSS), sitemap.xml, manifest.json, robots.txt, llms.txt, humans.txt, `.well-known/security.txt`.

## Non-negotiable rules (the project's policy)
1. **No cookies, no analytics, no tracking, no ad or social pixels.**
2. **No fabricated social proof**: no invented testimonials, user counts, press quotes, or star counts. If data can't load, show an honest "couldn't load" message or nothing.
3. **No new third-party embeds, scripts, or services** unless `terms.html` is updated to disclose them and Ajit signs off.
4. The only external requests the site makes: Google Fonts, and the public GitHub API from the browser (project stats, good-first-issue list, contributor avatars). Anything new must be disclosed in `terms.html`.
5. **Removed on purpose, do not re-add:** the light/dark theme toggle and the site search. Ajit asked for these to be removed everywhere, including changelog, community, and project pages.
6. Never claim something the site doesn't do. Keep `policy.html`, `terms.html`, `changelog.html`, and the README accurate to the real code.
7. Email address is always `linkwithiq@proton.me`. Never reintroduce `hello@linkwithiq.dev`.

## Security and technical conventions
- Every page has a strict `<meta>` Content-Security-Policy. Pages that call the GitHub API need `connect-src 'self' https://api.github.com`; avatars need `img-src ... https://avatars.githubusercontent.com`. Don't loosen the CSP. Scripts are allowed by hash, not `'unsafe-inline'`: after editing any inline `<script>`, run `python3 scripts/csp_hashes.py`.
- Only use URLs from the GitHub API after checking the host (`safeGitHubUrl` in `script.js`).
- Build DOM from API data with `createElement` and `textContent`, never `innerHTML` with remote data.
- External links use `rel="noopener noreferrer"` (links to Ajit's own sites also carry `me`).
- Skip link is `<a href="#top" class="skip-link">`, and `<main id="top" tabindex="-1">`.
- Respect `prefers-reduced-motion` and `forced-colors`.

## Accessibility status
- Meets WCAG 2.1 AA and 2.2 AA (contrast checked, focus not obscured via `[id]{scroll-margin-top:92px}`, target size).
- Partial AAA work: link and green status text lifted to 7:1; main controls 44×44px. **Do not claim full AAA compliance.**

## Brand tokens (styles.css `:root`)
`--ink #1a1108`, `--ink-soft`, `--ink-panel`, `--cream #f4ebd7`, `--cream-dim`, `--rust #f0823a` (graphic fills), `--link #f29659` (small accent text), `--on-accent` (dark text on rust), `--signal`/`--signal-br` (green status). Dark, warm, mountain-peak logo motif. Founder logo marks: `assets/asrbmy-mark-cream.png`, `assets/asrbmy-mark-rust.png`.

## Quality checks before finishing any task
1. Run `python3 scripts/check_site.py`. It checks internal links and anchors (including `blog/` and `research/`), CSP coverage of inline scripts, sitemap freshness, feeds, JSON-LD, weight budget, and that removed features haven't crept back. It must print "All checks passed". (A GitHub Actions workflow runs it too.)
2. If you add a page, add it to `sitemap.xml` (with `<lastmod>`) and link it in the footer, or add it to the exclusion list in the checker on purpose.
3. If you change behavior, update `CHANGELOG.md` / `changelog.html` truthfully.
4. Check at phone width (about 390px) and desktop; no horizontal scroll.
5. Report plainly what you changed and anything you could not verify.

## Open items (waiting on Ajit)
- `now.html` is a placeholder template: it is `noindex`, out of the sitemap, and unlinked from footers until real content arrives.
- `feed.xml` dates are placeholders (1 Aug 2026) until real publish dates are supplied.
- Blog posts (`blog/`), the research note (`research/`), `data/projects.js` and the logo exports are in the repo. `project.html?slug=…` is filled in by `script.js` from `data/projects.js`.
- GitHub Sponsors is `linkwithiq` (`.github/FUNDING.yml`); Ajit has no custom domain.
- Possible additions needing Ajit's yes: Giscus comments (needs a terms disclosure), project screenshots.

## How to work with Ajit
Do one feature at a time. Explain briefly what you changed. Stay inside the policy rules above, and ask before anything that touches privacy, third parties, or public claims. If something can't be verified, say so.
