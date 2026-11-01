# Launch and maintenance checklist

## Before the first public push
- [ ] Fill in `now.html` (or leave it hidden: it is `noindex`, out of the sitemap, and unlinked from footers). When it has real content, remove the `noindex`, add it to `sitemap.xml`, restore the footer link, and remove it from the exclusion list in `scripts/check_site.py`.
- [ ] Replace the placeholder dates in `feed.xml` and `feed.json` (all items say 1 Aug 2026).
- [ ] Confirm the six project repos linked from the home page exist under github.com/linkwithiq (the Details pages and live stats depend on them).
- [ ] GitHub Sponsors: `.github/FUNDING.yml` points at `linkwithiq`. Make sure Sponsors is enabled for that account, or GitHub shows an error on the file; otherwise delete the file.
- [ ] Delete stray files at the repo root: `gitignore` (the real one is `.gitignore`), `security.txt` (the real one is `.well-known/security.txt`), `favicon-512-maskable.png`, `og-about.png`, `og-community.png`, `og-index.png` (the real ones live under `assets/`).
- [ ] `python3 scripts/check_site.py` and `node scripts/a11y_check.js` both pass.

## GitHub repository settings
- [ ] **Pages:** Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
- [ ] **HTTPS:** tick "Enforce HTTPS" on the Pages settings page.
- [ ] **Branch protection** on `main`: require a pull request, and require the status checks "Check site" and "Accessibility" to pass.
- [ ] **Security:** enable Private vulnerability reporting (Settings → Code security) so `SECURITY.md` works as written.
- [ ] **Topics:** add a few (for example `open-source`, `privacy`, `accessibility`, `static-site`) and a short description.
- [ ] **Social preview:** upload `assets/og/og-index.png` (Settings → Social preview).
- [ ] **Actions:** after the first push, run "External links" and "Visual check" once from the Actions tab. Download the `visual-baselines` artifact into `tests/visual/` and commit it.

## Every time you change something
- Edited an inline `<script>`? Run `python3 scripts/csp_hashes.py`.
- Added a page? Add it to `sitemap.xml` and the footer, or to the exclusion list in `scripts/check_site.py` on purpose.
- Added anything that contacts another site, or stores something in the browser? Update `terms.html` first.
- Changed behaviour? Add a truthful line to `CHANGELOG.md` and `changelog.html`.
- After editing pages: `python3 scripts/update_lastmod.py` once they are committed.

## Calendar reminders
- **By 2027-08-31:** renew `.well-known/security.txt` (its `Expires` date).
- **Every few months:** review `policy.html` and `terms.html` against what the site actually does; update "Last updated".
