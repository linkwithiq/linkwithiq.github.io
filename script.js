// ---- shared: respect the user's motion preference everywhere, once ----
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- loading screen: draw the logo in, then fill it, then reveal the site ----
(function initLoadingScreen(){
  const loader = document.getElementById('loadingScreen');
  if (!loader) return;

  function finishLoading(){
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
  }

  const outer = document.getElementById('loadingPathOuter');
  const drop = document.getElementById('loadingPathDrop');
  const wordmark = document.getElementById('loadingWordmark');

  if (PREFERS_REDUCED_MOTION || !outer || !drop || typeof outer.getTotalLength !== 'function') {
    // no draw animation — just a quick, simple reveal
    setTimeout(finishLoading, 250);
    return;
  }

  try {
    [outer, drop].forEach(path => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
    });

    let settled = false;
    function safeFinish(){
      if (settled) return;
      settled = true;
      finishLoading();
    }

    // fill in (and reveal the wordmark) once the drop stroke has finished drawing
    function onStrokeDone(e){
      if (e.propertyName !== 'stroke-dashoffset') return;
      drop.removeEventListener('transitionend', onStrokeDone);
      outer.style.fillOpacity = '1';
      drop.style.fillOpacity = '1';
      if (wordmark) wordmark.classList.add('visible');
    }
    drop.addEventListener('transitionend', onStrokeDone);

    // reveal the site once the fill-in has finished
    function onFillDone(e){
      if (e.propertyName !== 'fill-opacity') return;
      outer.removeEventListener('transitionend', onFillDone);
      safeFinish();
    }
    outer.addEventListener('transitionend', onFillDone);

    // wait a frame so the browser registers the starting dashoffset
    // before we transition it, or the "draw" jumps straight to done
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        outer.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.65,0,.35,1)';
        drop.style.transition = 'stroke-dashoffset 1.0s cubic-bezier(.65,0,.35,1) 0.6s';
        outer.style.strokeDashoffset = '0';
        drop.style.strokeDashoffset = '0';
      });
    });

    // timer backup: if transitionend never fires for any reason
    // (interrupted transition, unusual browser behavior), don't strand the user
    setTimeout(safeFinish, 3400);
  } catch (err) {
    // if getTotalLength or anything else throws, don't strand the user
    finishLoading();
  }
})();

// ---- footer year ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navClose = document.getElementById('navClose');
const navLinks = document.getElementById('navLinks');

function openNav(){
  navLinks.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  const firstLink = navLinks.querySelector('a');
  if (firstLink) firstLink.focus({ preventScroll: true });
}
function closeNav(returnFocus){
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (returnFocus) navToggle.focus({ preventScroll: true });
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  if (isOpen) { closeNav(false); } else { openNav(); }
});
if (navClose) navClose.addEventListener('click', () => closeNav(true));

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeNav(false));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeNav(true);
  }
});

// basic focus trap while the mobile menu is open
navLinks.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !navLinks.classList.contains('open')) return;
  const focusables = navLinks.querySelectorAll('a, button');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

// ---- light/dark theme toggle ----
// The <html> element may already have data-theme="light" set by the
// synchronous anti-flash script in <head>; this just wires up the button
// and persists changes the same way (localStorage key 'liq-theme', as
// disclosed in the Privacy Policy — never leaves the device).
(function initThemeToggle(){
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  function isLight(){
    return document.documentElement.getAttribute('data-theme') === 'light';
  }
  function updateLabel(){
    toggle.setAttribute('aria-label', isLight() ? 'Switch to dark theme' : 'Switch to light theme');
  }
  updateLabel();

  toggle.addEventListener('click', () => {
    if (isLight()) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('liq-theme', 'dark'); } catch (e) { /* unavailable — fine, just won't persist */ }
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      try { localStorage.setItem('liq-theme', 'light'); } catch (e) { /* unavailable — fine, just won't persist */ }
    }
    updateLabel();
  });
})();

// ---- signature "peak" divider, echoing the logo's mountain silhouette ----
function buildPeakRule(el){
  const w = 1200, h = 14;
  const peaks = 24;
  const step = w / peaks;
  let d = `M0 ${h}`;
  for (let i = 0; i < peaks; i++){
    const x0 = i * step;
    const xMid = x0 + step / 2;
    const x1 = x0 + step;
    d += ` L${xMid} 0 L${x1} ${h}`;
  }
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="${d}" fill="none" stroke="rgba(244,235,215,0.16)" stroke-width="1"/>
  </svg>`;
}
document.querySelectorAll('.peak-rule').forEach(buildPeakRule);

// ---- scroll progress bar ----
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ---- back to top ----
const backToTop = document.getElementById('backToTop');
function updateBackToTop(){
  if (!backToTop) return;
  if (window.scrollY > 700) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
}
window.addEventListener('scroll', updateBackToTop, { passive: true });
updateBackToTop();
if (backToTop){
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });
  });
}

// ---- scrollspy: highlight the nav link for the section in view ----
const navSpyLinks = Array.from(document.querySelectorAll('.nav-links a[data-nav]'));
const spySections = navSpyLinks
  .map(link => document.getElementById(link.dataset.nav))
  .filter(Boolean);

if ('IntersectionObserver' in window && spySections.length) {
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navSpyLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.nav === id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  spySections.forEach(section => spyObserver.observe(section));
}

// ---- project filter tabs + search ----
const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');
const filterEmpty = document.getElementById('filterEmpty');
const projectSearch = document.getElementById('projectSearch');

let activeStatusFilter = 'all';

function cardMatchesSearch(card, query){
  if (!query) return true;
  const haystack = card.dataset.searchText || (() => {
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent).join(' ');
    const text = `${title} ${desc} ${tags}`.toLowerCase();
    card.dataset.searchText = text; // cache — the text itself never changes
    return text;
  })();
  return haystack.includes(query);
}

function applyProjectFilters(){
  const query = (projectSearch?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  projectCards.forEach(card => {
    const statusMatch = activeStatusFilter === 'all' || card.dataset.status === activeStatusFilter;
    const searchMatch = cardMatchesSearch(card, query);
    const match = statusMatch && searchMatch;
    card.classList.toggle('filtered-out', !match);
    if (match) visibleCount++;
  });
  if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
}

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-pressed', 'true');
    activeStatusFilter = tab.dataset.filter;
    applyProjectFilters();
  });
});

if (projectSearch) {
  projectSearch.addEventListener('input', applyProjectFilters);
}

// ---- resource search (resources.html) ----
const resourceSearch = document.getElementById('resourceSearch');
if (resourceSearch) {
  const resourceRows = document.querySelectorAll('.resource-row');
  const resourceEmpty = document.getElementById('resourceSearchEmpty');
  resourceSearch.addEventListener('input', () => {
    const query = resourceSearch.value.trim().toLowerCase();
    let visibleCount = 0;
    resourceRows.forEach(row => {
      const text = row.dataset.searchText || (() => {
        const title = row.querySelector('h3')?.textContent || '';
        const desc = row.querySelector('p')?.textContent || '';
        const t = `${title} ${desc}`.toLowerCase();
        row.dataset.searchText = t;
        return t;
      })();
      const match = !query || text.includes(query);
      row.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    if (resourceEmpty) resourceEmpty.hidden = visibleCount !== 0;
  });
}

// ---- copy email button ----
const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      // fallback for browsers without Clipboard API access
      const tmp = document.createElement('textarea');
      tmp.value = email;
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand('copy'); } catch (e2) { /* no-op */ }
      document.body.removeChild(tmp);
    }
    copyEmailBtn.classList.add('copied');
    setTimeout(() => copyEmailBtn.classList.remove('copied'), 1800);
  });
}

// ---- newsletter form (no backend — opens a pre-filled email as a graceful fallback) ----
const newsletterForm = document.getElementById('newsletterForm');
const newsletterNote = document.getElementById('newsletterNote');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput.value.trim();
    const validPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validPattern.test(email)) {
      if (newsletterNote) {
        newsletterNote.textContent = 'That email doesn\'t look quite right — mind checking it?';
        newsletterNote.classList.add('error');
      }
      return;
    }
    if (newsletterNote) {
      newsletterNote.textContent = 'Opening your email app to confirm — thanks!';
      newsletterNote.classList.remove('error');
    }
    const subject = encodeURIComponent('Add me to Link with iQ updates');
    const body = encodeURIComponent(`Please add ${email} to the updates list.`);
    window.location.href = `mailto:linkwithiq@proton.me?subject=${subject}&body=${body}`;
    newsletterForm.reset();
  });
}

// ---- live GitHub stats on project cards ----
// Fetches directly from the browser to api.github.com — no backend, nothing
// proxied or logged on our end (matches what the Privacy Policy already
// discloses about how project-card stats work).
function formatRelativeDate(isoString) {
  const then = new Date(isoString);
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(months / 12);
  return `${years} yr ago`;
}

async function loadProjectStats() {
  const cards = document.querySelectorAll('[data-repo]');
  const requests = Array.from(cards).map(async (card) => {
    const repo = card.dataset.repo;
    const statsEl = card.querySelector('.project-stats');
    if (!repo || !statsEl) return;
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (!res.ok) return; // rate-limited or not found — fail quietly, no fake data
      const data = await res.json();
      const stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
      const updated = data.pushed_at ? formatRelativeDate(data.pushed_at) : null;
      if (stars === null && !updated) return;
      const parts = [];
      if (stars !== null) parts.push(`★ ${stars}`);
      if (updated) parts.push(`updated ${updated}`);
      statsEl.textContent = parts.join(' · ');
      statsEl.hidden = false;
    } catch (err) {
      // network error, offline, blocked by an extension, etc. — leave hidden
    }
  });
  await Promise.all(requests);
}
if (document.querySelector('[data-repo]')) {
  loadProjectStats();
}

// ---- good first issue feed (community.html) ----
async function loadGoodFirstIssues() {
  const list = document.getElementById('goodFirstIssues');
  const fallback = document.getElementById('goodFirstIssuesFallback');
  if (!list) return;
  const org = list.dataset.org;
  if (!org) return;
  try {
    const q = encodeURIComponent(`org:${org} label:"good first issue" state:open type:issue`);
    const res = await fetch(`https://api.github.com/search/issues?q=${q}&per_page=10`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error('request failed');
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      if (fallback) fallback.hidden = false;
      return;
    }
    items.forEach(issue => {
      const li = document.createElement('li');
      li.className = 'issue-row';

      const link = document.createElement('a');
      link.href = issue.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'issue-title';
      link.textContent = issue.title;

      const meta = document.createElement('span');
      meta.className = 'issue-meta';
      const repoName = issue.repository_url ? issue.repository_url.split('/').pop() : '';
      meta.textContent = `${repoName} · #${issue.number}`;

      li.appendChild(link);
      li.appendChild(meta);
      list.appendChild(li);
    });
  } catch (err) {
    // couldn't load live data — say so honestly, never claim "nothing's open"
    // when we simply failed to check
    if (fallback) {
      fallback.textContent = '';
      fallback.appendChild(document.createTextNode("Couldn't load live issues right now — "));
      const link = document.createElement('a');
      link.href = 'https://github.com/linkwithiq';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'browse repositories on GitHub';
      fallback.appendChild(link);
      fallback.appendChild(document.createTextNode(' directly.'));
      fallback.hidden = false;
    }
  }
}

// ---- contributor avatars (community.html, project.html) ----
async function loadContributorAvatars() {
  const container = document.getElementById('contributorAvatars');
  const fallback = document.getElementById('contributorFallback');
  if (!container) return;
  const repos = (container.dataset.repos || '').split(',').map(r => r.trim()).filter(Boolean);
  if (repos.length === 0) return; // no repo(s) specified yet — nothing to fetch
  try {
    const results = await Promise.all(repos.map(repo =>
      fetch(`https://api.github.com/repos/${repo}/contributors?per_page=30`, {
        headers: { Accept: 'application/vnd.github+json' }
      }).then(res => (res.ok ? res.json() : []))
    ));
    const seen = new Map();
    results.flat().forEach(c => {
      if (c && c.login && !seen.has(c.login)) seen.set(c.login, c);
    });
    const contributors = Array.from(seen.values());
    if (contributors.length === 0) {
      if (fallback) fallback.hidden = false;
      return;
    }
    contributors.forEach(c => {
      const a = document.createElement('a');
      a.href = c.html_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'contributor-avatar-link';
      a.title = c.login;
      const img = document.createElement('img');
      img.src = c.avatar_url;
      img.alt = c.login;
      img.width = 40;
      img.height = 40;
      img.loading = 'lazy';
      a.appendChild(img);
      container.appendChild(a);
    });
  } catch (err) {
    if (fallback) {
      fallback.textContent = '';
      fallback.appendChild(document.createTextNode("Couldn't load contributor data right now — check "));
      const link = document.createElement('a');
      link.href = 'https://github.com/linkwithiq';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'the repositories on GitHub';
      fallback.appendChild(link);
      fallback.appendChild(document.createTextNode(' directly.'));
      fallback.hidden = false;
    }
  }
}

if (document.getElementById('goodFirstIssues')) loadGoodFirstIssues();
if (document.getElementById('contributorAvatars')) loadContributorAvatars();

if (!PREFERS_REDUCED_MOTION && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.mission-card, .project-card, .resource-row, .process-step, .founder, .faq-item'
  );
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));
}
