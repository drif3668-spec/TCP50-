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

/* ── Arab Countries Trading Times ── */
(function initArabTimes() {
  const COUNTRIES = [
    {code:'DZ',name:'الجزائر',   flag:'🇩🇿',offset:1,dst:false},
    {code:'EG',name:'مصر',       flag:'🇪🇬',offset:2,dst:false},
    {code:'SA',name:'السعودية',  flag:'🇸🇦',offset:3,dst:false},
    {code:'MA',name:'المغرب',    flag:'🇲🇦',offset:1,dst:false},
    {code:'TN',name:'تونس',      flag:'🇹🇳',offset:1,dst:false},
    {code:'LY',name:'ليبيا',     flag:'🇱🇾',offset:2,dst:false},
    {code:'IQ',name:'العراق',    flag:'🇮🇶',offset:3,dst:false},
    {code:'AE',name:'الإمارات',  flag:'🇦🇪',offset:4,dst:false},
    {code:'QA',name:'قطر',       flag:'🇶🇦',offset:3,dst:false},
    {code:'KW',name:'الكويت',    flag:'🇰🇼',offset:3,dst:false},
    {code:'BH',name:'البحرين',   flag:'🇧🇭',offset:3,dst:false},
    {code:'OM',name:'عمان',      flag:'🇴🇲',offset:4,dst:false},
    {code:'JO',name:'الأردن',    flag:'🇯🇴',offset:3,dst:false},
    {code:'LB',name:'لبنان',     flag:'🇱🇧',offset:2,dstOffset:3,dst:true},
    {code:'PS',name:'فلسطين',    flag:'🇵🇸',offset:2,dstOffset:3,dst:true},
    {code:'SY',name:'سوريا',     flag:'🇸🇾',offset:2,dstOffset:3,dst:true},
    {code:'SD',name:'السودان',   flag:'🇸🇩',offset:3,dst:false},
    {code:'YE',name:'اليمن',     flag:'🇾🇪',offset:3,dst:false},
    {code:'MR',name:'موريتانيا', flag:'🇲🇷',offset:0,dst:false},
  ];

  function isUSDST(d) {
    const y=d.getFullYear(), mar=new Date(y,2,1), nov=new Date(y,10,1);
    return d >= new Date(y,2,8+(7-mar.getDay())%7) && d < new Date(y,10,1+(7-nov.getDay())%7);
  }
  function isLocalDST(d) {
    const y=d.getFullYear(), m31=new Date(y,2,31), o31=new Date(y,9,31);
    return d >= new Date(y,2,31-m31.getDay()) && d < new Date(y,9,31-o31.getDay());
  }
  function fmt(h) {
    const n=((h%24)+24)%24, hr=Math.floor(n), mn=Math.round((n-hr)*60);
    const h12=hr===0?12:hr>12?hr-12:hr, ap=hr<12?'ص':'م';
    return `${h12}:${String(mn).padStart(2,'0')} ${ap}`;
  }
  function calc(c,date) {
    const usDST=isUSDST(date), ct=usDST?-5:-6;
    const off=(c.dst&&isLocalDST(date))?(c.dstOffset||c.offset+1):c.offset;
    const sL=(17-ct)+off, nyO=(9.5-ct)+off, nyC=(15-ct)+off, avd=(16.5-ct)+off;
    return {usDST,off,
      start:{t:fmt(sL),nd:sL>=24},end:{t:fmt(sL),nd:true},
      nyOpen:{t:fmt(nyO),nd:nyO>=24},nyClose:{t:fmt(nyC),nd:nyC>=24},avoid:{t:fmt(avd),nd:avd>=24}};
  }

  const NOW=new Date();

  function renderBtns() {
    const el=document.getElementById('countryBtns'); if(!el) return;
    el.innerHTML=COUNTRIES.map(c=>`<button class="cbtn" data-code="${c.code}" onclick="selectArabCountry('${c.code}')">${c.flag} ${c.name}</button>`).join('');
  }
  function renderGrid() {
    const el=document.getElementById('arabGrid'); if(!el) return;
    el.innerHTML=COUNTRIES.map(c=>{
      const t=calc(c,NOW);
      return `<div class="ac-card" data-code="${c.code}" onclick="selectArabCountry('${c.code}')">
        <div class="acf">${c.flag}</div>
        <div class="acn">${c.name}</div>
        <div class="acst">${t.start.t}${t.start.nd?' <span style="font-size:10px;color:var(--muted)">(+1)</span>':''}</div>
        <div class="acl">بداية يوم التداول</div>
        ${c.dst?'<div class="acd">⏰ يتأثر بالتوقيت الصيفي</div>':''}
      </div>`;
    }).join('');
  }

  window.selectArabCountry=function(code){
    const c=COUNTRIES.find(x=>x.code===code); if(!c) return;
    const t=calc(c,NOW);
    document.querySelectorAll('.cbtn').forEach(b=>b.classList.toggle('active',b.dataset.code===code));
    document.querySelectorAll('.ac-card').forEach(b=>b.classList.toggle('ac-active',b.dataset.code===code));
    const panel=document.getElementById('countryDetail'); if(!panel) return;
    panel.style.display='block';
    panel.innerHTML=`
      <div class="cp-head">
        <div class="cp-flag">${c.flag}</div>
        <div class="cp-name-box">
          <h3>${c.name}</h3>
          <p>UTC+${t.off} · ${t.usDST?'التوقيت الصيفي الأمريكي CDT':'التوقيت الشتوي الأمريكي CST'}</p>
        </div>
      </div>
      <div class="tg-grid">
        <div class="tg-box tg-start">
          <div class="tg-lbl">▶ بداية يوم التداول</div>
          <div class="tg-val">${t.start.t}${t.start.nd?' ✦':''}</div>
          <div class="tg-note">${t.start.nd?'اليوم التالي (بعد منتصف الليل)':'نفس اليوم'}</div>
        </div>
        <div class="tg-box tg-end">
          <div class="tg-lbl">⏹ نهاية يوم التداول</div>
          <div class="tg-val">${t.end.t} ✦</div>
          <div class="tg-note">اليوم التالي بعد 24 ساعة من البداية</div>
        </div>
        <div class="tg-box tg-best">
          <div class="tg-lbl">🏆 أفضل وقت للتداول</div>
          <div class="tg-val">${t.nyOpen.t}${t.nyOpen.nd?' ✦':''} ← ${t.nyClose.t}${t.nyClose.nd?' ✦':''}</div>
          <div class="tg-note">جلسة نيويورك — الأعلى حيوية وسيولة</div>
        </div>
        <div class="tg-box tg-avoid">
          <div class="tg-lbl">⚠ تجنّب الفتح بعد</div>
          <div class="tg-val">${t.avoid.t}${t.avoid.nd?' ✦':''}</div>
          <div class="tg-note">آخر 30 دقيقة قبل إعادة تعيين اليوم</div>
        </div>
      </div>
      ${c.dst?`<div class="dst-badge">⏰ هذه الدولة تطبّق التوقيت الصيفي — التوقيت الحالي المعروض: UTC+${t.off}</div>`:''}
    `;
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  };

  renderBtns(); renderGrid();
})();

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
