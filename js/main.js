/* KPI Dashboard  */

document.addEventListener('DOMContentLoaded', function () {
  highlightActiveNav();
  initScrollProgress();
  initBarsAnimation();
  initFadeAnimations();
  initCounters();
});

/* ── Active nav link ─────────────────────────────────────── */
function highlightActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

/* ── Scroll progress bar ─────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', function () {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0) bar.style.width = (window.scrollY / total * 100).toFixed(1) + '%';
  }, { passive: true });
}

/* ── Bar animations (triggered on scroll-into-view) ─────── */
function initBarsAnimation() {
  const bars = document.querySelectorAll('.progress-inner, .kpi-bar-inner, .funnel-bar');

  bars.forEach(function (bar) {
    const target = bar.style.width || '0%';
    bar.dataset.targetWidth = target;
    bar.style.transition = 'none';
    bar.style.width = '0%';
  });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      requestAnimationFrame(function () {
        bar.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.width = bar.dataset.targetWidth;
      });
      obs.unobserve(bar);
    });
  }, { threshold: 0.25 });

  bars.forEach(function (bar) { obs.observe(bar); });
}

/* ── Fade-up entrance animations ────────────────────────── */
function initFadeAnimations() {
  const selectors = [
    '.section > .eyebrow',
    '.section > .section-title',
    '.section > .section-sub',
    '.section-soft > .eyebrow',
    '.section-soft > .section-title',
    '.section-soft > .section-sub',
    '.section-dark > .eyebrow',
    '.section-dark > .section-title-dark',
    '.section-dark > .section-sub-dark',
    '.kpi-card',
    '.card',
    '.strategy-card',
    '.funnel-stage',
    '.table-wrap',
    '.chart-wrap',
    '.placeholder-box',
    '.action-note',
  ].join(', ');

  const els = document.querySelectorAll(selectors);

  /* Stagger delays for card grids */
  document.querySelectorAll('.kpi-card').forEach(function (c, i) {
    c.style.animationDelay = Math.min(i * 55, 420) + 'ms';
  });
  document.querySelectorAll('.card-grid .card').forEach(function (c, i) {
    c.style.animationDelay = Math.min(i * 65, 360) + 'ms';
  });
  document.querySelectorAll('.strategy-card').forEach(function (c, i) {
    c.style.animationDelay = (i * 80) + 'ms';
  });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      /* Clear stagger delay after entrance so hover transitions stay snappy */
      const dur = parseFloat(getComputedStyle(el).animationDuration || '0.65') * 1000
                + parseFloat(el.style.animationDelay || '0');
      setTimeout(function () { el.style.animationDelay = ''; }, dur + 50);
      obs.unobserve(el);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });

  els.forEach(function (el) {
    el.classList.add('fade-up');
    obs.observe(el);
  });
}

/* ── Counter animation for numeric card-values ──────────── */
function initCounters() {
  document.querySelectorAll('.card-value').forEach(function (el) {
    /* Skip elements with child elements (e.g. value + unit in a span) */
    if (el.children.length > 0) return;

    const text = el.textContent.trim();
    const m = text.match(/^(-?[\d,]+\.?\d*)(.*)/);
    if (!m) return;

    const target = parseFloat(m[1].replace(/,/g, ''));
    if (isNaN(target) || Math.abs(target) > 99999) return;

    const suffix  = m[2];
    const dec     = m[1].includes('.') ? m[1].split('.')[1].length : 0;
    const DURATION = 850;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);

        const t0 = performance.now();
        function tick(now) {
          const p    = Math.min((now - t0) / DURATION, 1);
          const ease = 1 - Math.pow(1 - p, 3);          /* ease-out cubic */
          el.textContent = (target * ease).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else       el.textContent = target.toFixed(dec) + suffix;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    obs.observe(el);
  });
}
