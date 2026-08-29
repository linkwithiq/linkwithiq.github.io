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

// ---- project filter tabs ----
const filterTabs = document.querySelectorAll('.filter-tab');
const projectCards = document.querySelectorAll('.project-card');
const filterEmpty = document.getElementById('filterEmpty');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-pressed', 'true');

    const filter = tab.dataset.filter;
    let visibleCount = 0;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.status === filter;
      card.classList.toggle('filtered-out', !match);
      if (match) visibleCount++;
    });
    if (filterEmpty) filterEmpty.hidden = visibleCount !== 0;
  });
});

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
    window.location.href = `mailto:hello@linkwithiq.dev?subject=${subject}&body=${body}`;
    newsletterForm.reset();
  });
}

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
