/* =========================================================
   TCP50 — Earn2Trade · دليل خطة TCP50
   main.js — التفاعل وحركة العناصر
   ========================================================= */

'use strict';

/* ── Scroll Reveal ── */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.rv').forEach((el) => observer.observe(el));
})();

/* ── Progress bars animate on entry ── */
(function initBars() {
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.bar');
          bars.forEach((bar) => {
            const target = bar.getAttribute('data-width') || bar.style.width;
            bar.style.width = '0';
            bar.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
            requestAnimationFrame(() => {
              setTimeout(() => { bar.style.width = target; }, 100);
            });
          });
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('table').forEach((el) => barObserver.observe(el));
})();

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Number counter animation ── */
function animateCounter(el, to, duration = 1200) {
  const start = performance.now();
  const from  = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── Tooltip on spec values ── */
(function initSpecTooltips() {
  const tips = {
    '$50,000': 'رأس المال الافتراضي للتداول خلال التقييم',
    '$3,000':  'الربح الصافي المطلوب لاجتياز التقييم',
    '$1,100':  'أقصى خسارة مسموحة في يوم واحد — تجاوزه يُغلق الحساب',
    '$2,000':  'أقصى خسارة تراكمية طوال فترة التقييم',
    '6':       'أقصى عدد عقود يمكن فتحها في نفس الوقت',
    '10':      'الحد الأدنى لعدد أيام التداول قبل طلب الاجتياز',
  };
  document.querySelectorAll('.spec .val').forEach((el) => {
    const tip = tips[el.textContent.trim()];
    if (!tip) return;
    el.style.cursor = 'help';
    el.setAttribute('title', tip);
  });
})();
