'use strict';

/* ══════════════════════════════════════════════════════
   smart-plan.js — خطة اجتياز الاختبار الذكية
   TCP50 · Earn2Trade
══════════════════════════════════════════════════════ */

/* ── Firm configs (JSON-driven, easily extendable) ── */
const FIRMS = [
  {
    id:'tcp50', name:'TCP50 — Earn2Trade', icon:'🏆', active:true,
    accountSize:50000, profitTarget:3000, maxDailyLoss:1100,
    maxTotalDrawdown:2000, minDays:10, maxContracts:6,
    consistencyCap:0.30,
    desc:'الحساب الافتراضي الحالي · TCP50'
  },
  {
    id:'ftmo', name:'FTMO — Challenge', icon:'💼', active:false,
    accountSize:100000, profitTarget:10000, maxDailyLoss:5000,
    maxTotalDrawdown:10000, minDays:4, maxContracts:null,
    consistencyCap:null,
    desc:'قريباً — غير مفعّل'
  },
  {
    id:'fundednext', name:'FundedNext', icon:'🌐', active:false,
    accountSize:100000, profitTarget:8000, maxDailyLoss:4000,
    maxTotalDrawdown:8000, minDays:5, maxContracts:null,
    consistencyCap:null,
    desc:'قريباً — غير مفعّل'
  },
];

/* ── Psychological plan content ── */
const PSYCH = {
  pre: [
    { icon:'🧘', text:'خذ 5 دقائق صمت قبل فتح المنصة — لا تبدأ التداول وأنت متوتر أو مشتت.' },
    { icon:'📋', text:'راجع هدفك اليومي وحدود الخسارة قبل أي صفقة.' },
    { icon:'🚫', text:'لا تتداول إذا كنت نعسان أو مريض أو في حالة انفعالية.' },
    { icon:'📊', text:'اقرأ أخبار اليوم (NFP · CPI · FOMC) وحدد الأوقات الخطيرة لتجنبها.' },
    { icon:'💧', text:'اشرب كوب ماء، ابتعد عن الشاشات لـ 10 دقائق إذا كنت قلقاً.' },
    { icon:'🎯', text:'حدد استراتيجية اليوم مسبقاً: كم صفقة؟ ما الإعداد؟ ما هدف الخروج؟' },
  ],
  during: [
    { icon:'⏱', text:'بعد الوصول للهدف اليومي — أغلق المنصة فوراً ولا تفتح صفقات إضافية.' },
    { icon:'📉', text:'خسرت صفقتين متتاليتين؟ توقف 30 دقيقة ثم أعد التقييم.' },
    { icon:'💰', text:'لا تضاعف الحجم بعد الربح — الثقة الزائدة أخطر من الخسارة.' },
    { icon:'🧠', text:'إذا شعرت بالإحباط بعد خسارة، افتح دفتر ملاحظاتك وسجّل ما حدث.' },
    { icon:'⚠',  text:'تحقق من الحد اليومي بعد كل صفقة — لا تنتظر حتى تصل اللحظة الحرجة.' },
    { icon:'📵', text:'أغلق التنبيهات ومنصات التواصل أثناء جلسة التداول.' },
  ],
  post: [
    { icon:'📝', text:'سجّل كل صفقة في يوميات التداول: لماذا دخلت؟ ماذا تعلمت؟' },
    { icon:'✅', text:'هل التزمت بحجم العقود وقواعد الإدارة؟ إذا نعم — أحسنت.' },
    { icon:'🔍', text:'راجع التداولات في نهاية اليوم بشكل بارد — ليس في لحظة انفعال.' },
    { icon:'🎯', text:'حدد صفقة واحدة تعلمت منها شيئاً — سواء كانت رابحة أو خاسرة.' },
    { icon:'🌙', text:'ابتعد عن منصات التداول والأخبار بعد ساعة من إغلاق جلستك.' },
    { icon:'📈', text:'احتفل بيوم ربحي حتى لو كان صغيراً — الاتساق هو الهدف الحقيقي.' },
  ],
  avoid: [
    { icon:'🚨', text:'الانتقام من السوق بعد خسارة — الرغبة في "استعادة" المال تعني صفقات انفعالية.' },
    { icon:'🎰', text:'مضاعفة الحجم بعد خسارة (Martingale) — محظور تماماً ويخترق قواعد الشركة.' },
    { icon:'🕐', text:'التداول في آخر 30 دقيقة قبل إعادة تعيين اليوم (4:30 مساءً CT).' },
    { icon:'📰', text:'فتح صفقات كبيرة قبل صدور أخبار اقتصادية كبرى دون تحليل مسبق.' },
    { icon:'💬', text:'الاستماع لتوصيات التليجرام أو تويتر دون تحليل شخصي.' },
    { icon:'😴', text:'التداول وأنت متعب — الأخطاء ترتفع بشكل كبير في حالة التعب.' },
  ],
};

/* ── Common trading mistakes ── */
const MISTAKES = [
  {
    icon:'🔴', title:'تجاوز الحد اليومي',
    desc:'فتح صفقات بعد الاقتراب من حد الخسارة اليومي ($1,100) أو تجاوزه.',
    fix:'ضع تنبيهاً يدوياً عند الوصول لـ $700 خسارة يومية وأغلق المنصة.',
  },
  {
    icon:'🎲', title:'خرق قاعدة الاتساق',
    desc:'تحقيق أكثر من 30% من الهدف الإجمالي ($900) في يوم واحد — يُلغي الطلب.',
    fix:'ضع حداً أقصى للربح اليومي في منصتك: $850 أو أقل.',
  },
  {
    icon:'📅', title:'عدم إكمال الحد الأدنى للأيام',
    desc:'محاولة طلب الاجتياز قبل تسجيل 10 أيام تداول فعلية على الأقل.',
    fix:'سجّل تاريخ أول يوم تداول وعدّ الأيام يدوياً في التقويم.',
  },
  {
    icon:'💨', title:'التداول خلال ساعات منخفضة السيولة',
    desc:'فتح صفقات كبيرة في جلسة آسيا أو قبيل إغلاق نيويورك — سبريد واسع وحركة غير منطقية.',
    fix:'ركّز تداولك بين 9:30 ص و 3:00 م CT (جلسة نيويورك).',
  },
  {
    icon:'⚖', title:'تجاوز عدد العقود المسموح',
    desc:'فتح أكثر من 6 عقود في نفس الوقت يخالف شروط Earn2Trade.',
    fix:'ضع تنبيهاً في المنصة، أو استخدم حساباً يمنع الدخول تلقائياً.',
  },
  {
    icon:'😤', title:'التداول الانتقامي',
    desc:'بعد خسارة متتالية، يحاول المتداول "استعادة" المال بصفقات أكبر أو عشوائية.',
    fix:'قاعدة ذهبية: خسارتان متتاليتان = إغلاق المنصة لـ 30 دقيقة على الأقل.',
  },
];

/* ── Trading sessions (UTC hours) ── */
const SESSIONS = [
  { name:'سيدني',  flag:'🇦🇺', startUTC:21, endUTC:6,  color:'#9B5CFF', activity:'منخفض' },
  { name:'طوكيو',  flag:'🇯🇵', startUTC:0,  endUTC:9,  color:'#1DB8FF', activity:'منخفض-متوسط' },
  { name:'لندن',   flag:'🇬🇧', startUTC:8,  endUTC:17, color:'#F4C44E', activity:'عالي' },
  { name:'نيويورك',flag:'🇺🇸', startUTC:13, endUTC:22, color:'#33E5A1', activity:'الأعلى ✦' },
];

/* ── Arab countries for sessions ── */
const SESSION_COUNTRIES = [
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

/* ── Daily tips pool ── */
const TIPS = [
  'ابدأ بعقد واحد حتى تؤكد الاتجاه.',
  'انتظر التأكيد — لا تتسرّع في الدخول.',
  'أغلق عند الهدف دون جشع.',
  'سجّل كل صفقة في يوميات التداول.',
  'تجنّب الأخبار الكبرى إذا لم تتحضر لها.',
  'الصبر ميزة، لا تتداول لمجرد الملل.',
  'احترم الحد اليومي — الراحة ليست فشلاً.',
  'يوم قليل الصفقات أفضل من يوم مضغوط.',
  'خسرت؟ سجّل السبب ثم انتظر فرصة جديدة.',
  'القناعة باليوم الجيد أفضل من الخسارة من الطمع.',
  'راجع الإعداد قبل الدخول — ثم ثق بنفسك.',
  'الاتساق أهم من الربح العالي في يوم واحد.',
  'اتبع الخطة حتى لو لم يكن السوق "مناسباً".',
  'لا تحاول استرداد الخسارة بصفقة واحدة كبيرة.',
  'التوقف عند الهدف اليومي هو الانضباط الحقيقي.',
  'كل يوم صفحة جديدة — انسَ أمس وركّز اليوم.',
  'نجاح الاجتياز بدأ من لحظة اتباعك للقواعد.',
  'ثق بالإعداد، لا بالنتيجة الفورية.',
  'أفضل المتداولين يعرفون متى يتوقفون.',
  'قرار عدم التداول هو قرار تداول ذكي.',
];

/* ══════════════════════════════════════
   State
══════════════════════════════════════ */
let PLAN = null;
let SIM = { balance: 50000, earnedProfit: 0, days: [] };
let barChartInst = null;
let selectedFirm = FIRMS[0];

/* ══════════════════════════════════════
   Init
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderFirms();
  renderMistakes();
  renderPsych('pre');
  renderSessionBtns();
});

/* ══════════════════════════════════════
   Firm selector
══════════════════════════════════════ */
function renderFirms() {
  const g = document.getElementById('firmGrid'); if (!g) return;
  g.innerHTML = FIRMS.map(f => `
    <div class="firm-card ${f.id === selectedFirm.id ? 'active' : ''} ${!f.active ? 'disabled-firm' : ''}"
         style="${!f.active ? 'opacity:.45;cursor:not-allowed' : 'cursor:pointer'}"
         onclick="${f.active ? `selectFirm('${f.id}')` : ''}">
      <span class="fi">${f.icon}</span>
      <div>
        <div class="fn">${f.name}</div>
        <div class="fd">${f.desc}</div>
      </div>
      <div class="fcheck"></div>
    </div>`).join('');
}

window.selectFirm = function(id) {
  const f = FIRMS.find(x => x.id === id);
  if (!f || !f.active) return;
  selectedFirm = f;
  renderFirms();
  // Update labels
  document.getElementById('acctSizeLabel').textContent = '$' + f.accountSize.toLocaleString();
  document.getElementById('profitTargetLabel').textContent = '$' + f.profitTarget.toLocaleString();
  document.getElementById('maxDailyLossLabel').textContent = '$' + f.maxDailyLoss.toLocaleString();
  document.getElementById('acctSize').value = f.accountSize;
  document.getElementById('profitTarget').value = f.profitTarget;
  document.getElementById('maxDailyLoss').value = f.maxDailyLoss;
};

/* ══════════════════════════════════════
   Plan Generator
══════════════════════════════════════ */
function generatePlan() {
  const errEl = document.getElementById('formError');
  errEl.style.display = 'none';

  const minD   = parseInt(document.getElementById('minDaily').value) || 50;
  const maxD   = parseInt(document.getElementById('maxDaily').value) || 750;
  const days   = parseInt(document.getElementById('planDays').value) || 10;
  const firm   = selectedFirm;
  const consistencyCap = firm.consistencyCap ? Math.floor(firm.profitTarget * firm.consistencyCap) : maxD;
  const effectiveMax   = Math.min(maxD, consistencyCap);
  const effectiveMin   = Math.max(minD, 25);
  const TARGET = firm.profitTarget + 50; // slight overshoot for safety

  // Validation
  if (effectiveMin > effectiveMax) {
    return showErr('الحد الأدنى يجب أن يكون أصغر من الحد الأقصى.');
  }
  if (effectiveMin * days > TARGET) {
    return showErr(`الحد الأدنى (${effectiveMin}$) × ${days} يوم = ${effectiveMin*days}$ يتجاوز الهدف. قلّل الحد الأدنى أو زد عدد الأيام.`);
  }
  if (effectiveMax * days < TARGET) {
    return showErr(`الحد الأقصى (${effectiveMax}$) × ${days} يوم = ${effectiveMax*days}$ أقل من الهدف. رفع الحد الأقصى أو زد عدد الأيام.`);
  }
  if (days < firm.minDays) {
    return showErr(`أدنى عدد أيام مطلوب لهذه الشركة: ${firm.minDays} يوم.`);
  }

  // Show loading
  document.getElementById('spLoading').style.display = 'flex';
  document.getElementById('spResults').style.display = 'none';

  setTimeout(() => {
    const profits = buildDistribution(days, effectiveMin, effectiveMax, TARGET);
    const analysis = analyze(profits, firm);

    PLAN = { profits, days, effectiveMin, effectiveMax, firm, analysis, TARGET };
    SIM  = { balance: firm.accountSize, earnedProfit: 0, days: [] };

    document.getElementById('spLoading').style.display = 'none';
    document.getElementById('spResults').style.display = 'block';
    document.getElementById('spResults').classList.add('results-anim');

    renderDashboard();
    renderCircle(analysis.successRate);
    renderSafetyBar(analysis.safetyScore);
    renderDayCards();
    renderAICard();
    renderPlanAnalysis();
    renderStats();
    renderBarChart();
    renderSimStats();
    populateSimDaySelect();

    document.getElementById('spResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 1800);

  function showErr(msg) {
    errEl.textContent = '⚠ ' + msg;
    errEl.style.display = 'block';
  }
}

/* ── Distribution algorithm ── */
function buildDistribution(days, mn, mx, target) {
  let profits = [];
  let remaining = target;

  for (let i = 0; i < days; i++) {
    const left   = days - i;
    const capMax = Math.min(mx, remaining - (left - 1) * mn);
    const capMin = Math.max(mn, remaining - (left - 1) * mx);
    const safeMax = Math.max(capMax, capMin);
    const safeMin = Math.min(capMax, capMin);

    // Natural distribution (slight bell curve)
    const r1 = Math.random(), r2 = Math.random();
    const rand = (r1 + r2) / 2; // roughly normal 0-1
    let p = safeMin + rand * (safeMax - safeMin);
    p = Math.round(p / 25) * 25;
    p = Math.max(safeMin, Math.min(safeMax, p));

    profits.push(p);
    remaining -= p;
  }

  // Fix rounding drift
  const total = profits.reduce((a, b) => a + b, 0);
  const diff  = target - total;
  if (Math.abs(diff) > 0) profits[profits.length - 1] += diff;

  return profits;
}

/* ── Analysis ── */
function analyze(profits, firm) {
  const total  = profits.reduce((a, b) => a + b, 0);
  const max    = Math.max(...profits);
  const min    = Math.min(...profits);
  const avg    = total / profits.length;
  const cap    = firm.consistencyCap ? Math.floor(firm.profitTarget * firm.consistencyCap) : Infinity;

  const variance = profits.reduce((s, p) => s + (p - avg) ** 2, 0) / profits.length;
  const stdDev   = Math.sqrt(variance);
  const cv       = stdDev / avg; // coefficient of variation

  const consistencyOK = max <= cap;
  const maxPct = firm.consistencyCap ? (max / firm.profitTarget * 100).toFixed(1) : 'N/A';

  // Success rate model
  let sr = 88;
  if (max > cap * 0.95)       sr -= 8;
  if (avg > cap * 0.7)        sr -= 5;
  if (cv > 0.45)              sr -= 4;
  if (profits.length < firm.minDays + 2) sr -= 3;
  if (!consistencyOK)         sr -= 12;
  sr = Math.max(55, Math.min(96, sr));

  // Safety score 0-100
  let ss = 85;
  if (!consistencyOK)         ss -= 20;
  if (cv > 0.4)               ss -= 10;
  if (avg > 700)              ss -= 8;
  if (profits.length <= firm.minDays) ss -= 5;
  ss = Math.max(20, Math.min(100, ss));

  const riskLabel = ss >= 75 ? 'آمن جداً' : ss >= 50 ? 'خطر متوسط' : 'خطر عالٍ';
  const riskColor = ss >= 75 ? '#33E5A1'  : ss >= 50 ? '#F4C44E'  : '#FF5C72';

  return {
    total, max, min, avg: +avg.toFixed(0), stdDev: +stdDev.toFixed(0), cv: +cv.toFixed(2),
    successRate: sr, safetyScore: ss, riskLabel, riskColor,
    consistencyOK, maxPct,
    bestDay:  profits.indexOf(max) + 1,
    worstDay: profits.indexOf(min) + 1,
  };
}

/* ══════════════════════════════════════
   Renderers
══════════════════════════════════════ */
function renderDashboard() {
  const { profits, firm, analysis } = PLAN;
  const stats = [
    { label:'هدف الربح الإجمالي', val:'$' + analysis.total.toLocaleString(), sub:'الهدف: $' + firm.profitTarget, color:'var(--emerald)' },
    { label:'عدد أيام الخطة',     val:profits.length + ' يوم', sub:'الحد الأدنى: ' + firm.minDays + ' أيام', color:'var(--blue)' },
    { label:'متوسط الربح اليومي', val:'$' + analysis.avg, sub:'ضمن الحدود المسموحة', color:'var(--gold)' },
    { label:'أعلى يوم مستهدف',   val:'$' + analysis.max.toLocaleString(), sub:`اليوم ${analysis.bestDay} · ${analysis.consistencyOK?'✔ ضمن الاتساق':'✘ يخالف قاعدة الاتساق'}`, color: analysis.consistencyOK?'var(--emerald)':'var(--crimson)' },
    { label:'أدنى يوم مستهدف',   val:'$' + analysis.min.toLocaleString(), sub:`اليوم ${analysis.worstDay}`, color:'var(--muted)' },
    { label:'الحد اليومي للخسارة', val:'$' + firm.maxDailyLoss.toLocaleString(), sub:'لا تتجاوزه أبداً', color:'var(--crimson)' },
  ];
  document.getElementById('dashGrid').innerHTML = stats.map(s => `
    <div class="dash-stat">
      <div class="ds-label">${s.label}</div>
      <div class="ds-val" style="color:${s.color}">${s.val}</div>
      <div class="ds-sub">${s.sub}</div>
    </div>`).join('');
}

function renderCircle(pct) {
  const CIRCUMFERENCE = 2 * Math.PI * 50; // r=50 → 314.16
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const color  = pct >= 80 ? '#33E5A1' : pct >= 65 ? '#F4C44E' : '#FF5C72';
  const fill   = document.getElementById('circFill');
  const text   = document.getElementById('circPct');
  const badge  = document.getElementById('successBadge');

  fill.style.stroke = color;
  // Animate
  setTimeout(() => { fill.style.strokeDashoffset = offset; }, 200);
  setTimeout(() => { text.textContent = pct + '%'; text.style.fill = color; }, 400);

  const lbl = pct >= 80 ? '✔ نسبة نجاح ممتازة' : pct >= 65 ? '⚠ نسبة قبول — تحسين مطلوب' : '✘ الخطة عالية المخاطرة';
  const col = pct >= 80 ? 'var(--emerald)' : pct >= 65 ? 'var(--gold)' : 'var(--crimson)';
  badge.innerHTML = `<span style="color:${col};font-family:'Cairo';font-weight:700">${lbl}</span>`;
}

function renderSafetyBar(score) {
  const bar   = document.getElementById('safetyBar');
  const label = document.getElementById('safetyLabel');
  const color = score >= 75 ? '#33E5A1' : score >= 50 ? '#F4C44E' : '#FF5C72';
  const txt   = score >= 75 ? 'آمن جداً' : score >= 50 ? 'خطر متوسط' : 'خطر عالٍ';
  bar.style.background = color;
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = score + '%'; }, 300);
  label.textContent = txt + ' (' + score + '%)';
  label.style.color = color;
}

function renderDayCards() {
  const { profits, firm } = PLAN;
  let cum = 0;
  document.getElementById('dayGrid').innerHTML = profits.map((p, i) => {
    cum += p;
    const barW = (p / firm.profitTarget * 100).toFixed(1);
    const cumPct = Math.min(100, (cum / firm.profitTarget * 100)).toFixed(0);
    const tip = TIPS[(i * 3 + 7) % TIPS.length];
    return `
    <div class="day-card" style="--i:${i}">
      <div class="dc-num">اليوم ${i + 1} · ${i < 5 ? 'الأسبوع الأول' : i < 10 ? 'الأسبوع الثاني' : 'الأسبوع الثالث'}</div>
      <div class="dc-profit">+$${p.toLocaleString()}</div>
      <div class="dc-cum">تراكمي: $${cum.toLocaleString()} — ${cumPct}% من الهدف</div>
      <div class="dc-bar-track"><div class="dc-bar" style="width:0" data-w="${barW}"></div></div>
      <div class="dc-tip">${tip}</div>
    </div>`;
  }).join('');

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.dc-bar').forEach(b => {
      b.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
      b.style.width = b.dataset.w + '%';
    });
  }, 400);
}

function renderAICard() {
  const { analysis, profits, firm } = PLAN;
  const cap = firm.consistencyCap ? Math.floor(firm.profitTarget * firm.consistencyCap) : null;
  const consistBadge = analysis.consistencyOK
    ? `<span class="ok-badge">✔ قاعدة الاتساق محترمة (أعلى يوم ${analysis.maxPct}%)</span>`
    : `<span class="violation-badge">✘ يخالف قاعدة الاتساق — ${analysis.maxPct}% في يوم واحد</span>`;

  const tips = [
    { icon:'🎯', label:'الاستراتيجية المُثلى', val:`تداول 2-3 صفقات يومياً بحجم عقد واحد ومستهدف $${Math.round(analysis.avg/3)} لكل صفقة.` },
    { icon:'🛡', label:'نقطة التوقف اليومي',  val:`إذا وصلت الخسارة إلى $${Math.floor(firm.maxDailyLoss * 0.65)} توقف تماماً لهذا اليوم.` },
    { icon:'⚡', label:'التوقيت الأمثل',      val:'ركّز على جلسة نيويورك 9:30 ص - 3:00 م CT للسيولة القصوى.' },
    { icon:'📐', label:'نسبة المخاطرة المثالية', val:`لا تخاطر بأكثر من 0.5%-1% من رأس المال في الصفقة الواحدة ($${Math.floor(firm.accountSize * 0.007)}-$${Math.floor(firm.accountSize * 0.01)}).` },
  ];

  document.getElementById('aiCard').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:20px">
      ${consistBadge}
      <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)">
        معامل التباين: ${analysis.cv} · الانحراف: $${analysis.stdDev}
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
      ${tips.map(t => `
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px">
          <div style="font-size:18px;margin-bottom:6px">${t.icon}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px">${t.label}</div>
          <div style="font-size:13.5px;line-height:1.6;color:#d5dce9">${t.val}</div>
        </div>`).join('')}
    </div>`;
}

function renderPlanAnalysis() {
  const { analysis, profits, firm } = PLAN;
  const items = [
    {
      icon:'📊', label:'مستوى المخاطرة', color: analysis.riskColor,
      val: analysis.riskLabel,
      sub: `معامل التباين ${analysis.cv} · ${analysis.cv < 0.3 ? 'خطة متسقة ومستقرة' : analysis.cv < 0.5 ? 'تباين مقبول' : 'تباين مرتفع — الخطة غير متسقة'}`,
    },
    {
      icon:'🏆', label:'أفضل يوم', color:'var(--gold)',
      val: `اليوم ${analysis.bestDay} (+$${analysis.max})`,
      sub: 'لا تفتح صفقات إضافية بعد تحقيق الهدف اليومي',
    },
    {
      icon:'📉', label:'أصعب يوم', color:'var(--crimson)',
      val: `اليوم ${analysis.worstDay} (+$${analysis.min})`,
      sub: 'الأيام الصعبة طبيعية — حافظ على الانضباط',
    },
  ];
  document.getElementById('planAnalysis').innerHTML = items.map(it => `
    <div class="sp-card" style="text-align:center">
      <div style="font-size:28px;margin-bottom:10px">${it.icon}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px">${it.label}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-weight:800;font-size:18px;color:${it.color};margin-bottom:8px">${it.val}</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.5">${it.sub}</div>
    </div>`).join('');
}

function renderStats() {
  const { analysis, profits, firm } = PLAN;
  const medianArr = [...profits].sort((a, b) => a - b);
  const median    = medianArr[Math.floor(medianArr.length / 2)];
  const profitDays= profits.filter(p => p >= analysis.avg * 0.9).length;

  const stats = [
    { label:'إجمالي الربح المستهدف', val:'$' + analysis.total.toLocaleString(), color:'var(--emerald)' },
    { label:'متوسط الربح اليومي',   val:'$' + analysis.avg, color:'var(--blue)' },
    { label:'الوسيط (Median)',       val:'$' + median.toLocaleString(), color:'var(--gold)' },
    { label:'الانحراف المعياري',     val:'$' + analysis.stdDev, color:'var(--muted)' },
    { label:'أعلى يوم مستهدف',      val:'$' + analysis.max.toLocaleString(), color:'var(--gold)' },
    { label:'أدنى يوم مستهدف',      val:'$' + analysis.min.toLocaleString(), color:'var(--muted)' },
    { label:'أيام فوق المتوسط',     val:profitDays + ' / ' + profits.length, color:'var(--emerald)' },
    { label:'نسبة الاتساق',         val: analysis.consistencyOK ? '✔ ممتاز' : '✘ مخالفة', color: analysis.consistencyOK ? 'var(--emerald)' : 'var(--crimson)' },
  ];
  document.getElementById('statsGrid').innerHTML = stats.map(s => `
    <div class="dash-stat">
      <div class="ds-label">${s.label}</div>
      <div class="ds-val" style="color:${s.color}">${s.val}</div>
    </div>`).join('');
}

function renderBarChart() {
  if (barChartInst) { barChartInst.destroy(); }
  const ctx = document.getElementById('barChart').getContext('2d');
  const { profits, analysis } = PLAN;
  const cap = PLAN.firm.consistencyCap ? Math.floor(PLAN.firm.profitTarget * PLAN.firm.consistencyCap) : Infinity;

  barChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: profits.map((_, i) => 'ي' + (i + 1)),
      datasets: [{
        label: 'الربح اليومي ($)',
        data: profits,
        backgroundColor: profits.map(p => p > cap ? 'rgba(255,92,114,.7)' : 'rgba(51,229,161,.5)'),
        borderColor: profits.map(p => p > cap ? '#FF5C72' : '#33E5A1'),
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => '$' + ctx.parsed.y.toLocaleString(),
          },
          backgroundColor: '#0d1322',
          borderColor: 'rgba(255,255,255,.1)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#9DB2CE',
        },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#7A8FA6', font: { size: 11 } } },
        y: {
          grid: { color: 'rgba(255,255,255,.04)' },
          ticks: { color: '#7A8FA6', callback: v => '$' + v, font: { size: 11 } },
          beginAtZero: true,
        },
      },
    },
  });
}

/* ══════════════════════════════════════
   Simulation
══════════════════════════════════════ */
function populateSimDaySelect() {
  const sel = document.getElementById('simDaySelect'); if (!sel || !PLAN) return;
  sel.innerHTML = PLAN.profits.map((_, i) =>
    `<option value="${i + 1}">يوم ${i + 1}</option>`).join('');
}

function renderSimStats() {
  const { firm } = PLAN || { firm: FIRMS[0] };
  const target = firm.profitTarget;
  const maxDD  = firm.maxDailyLoss;
  const needed = target - SIM.earnedProfit;
  const pct    = Math.min(100, (SIM.earnedProfit / target * 100)).toFixed(1);

  const el = document.getElementById('simStats'); if (!el) return;

  const items = [
    { label:'رصيد الحساب الحالي', val:'$' + SIM.balance.toLocaleString(), warn: SIM.balance < firm.accountSize - firm.maxTotalDrawdown, danger: SIM.balance < firm.accountSize - firm.maxTotalDrawdown * 0.8 },
    { label:'الربح المحقق',       val:'$' + SIM.earnedProfit.toLocaleString(), warn: false, danger: false, color: SIM.earnedProfit >= target ? 'var(--emerald)' : 'var(--text)' },
    { label:'المتبقي للهدف',      val: needed <= 0 ? '✔ تم الاجتياز!' : '$' + needed.toLocaleString(), warn: false, danger: false, color: needed <= 0 ? 'var(--emerald)' : 'var(--gold)' },
    { label:'نسبة الإنجاز',       val: pct + '%', warn: false, danger: false, color: +pct >= 100 ? 'var(--emerald)' : 'var(--blue)' },
  ];

  el.innerHTML = items.map(it => {
    const cls = it.danger ? 'ss-danger' : it.warn ? 'ss-warn' : '';
    return `<div class="sim-stat ${cls}">
      <div class="ss-label">${it.label}</div>
      <div class="ss-val" style="color:${it.color || 'var(--text)'}">${it.val}</div>
    </div>`;
  }).join('');
}

window.addSimDay = function() {
  if (!PLAN) return;
  const inp = document.getElementById('simDayInput');
  const val = parseFloat(inp.value);
  if (isNaN(val)) return;

  const { firm } = PLAN;
  const alertEl = document.getElementById('simAlert');
  alertEl.style.display = 'none';

  // Check daily loss
  if (val < -firm.maxDailyLoss) {
    alertEl.style.display = 'block';
    alertEl.innerHTML = `⛔ تجاوزت حد الخسارة اليومية ($${firm.maxDailyLoss})! هذا يُلغي الاختبار تلقائياً.`;
    alertEl.style.background = 'rgba(255,92,114,.15)';
    alertEl.style.color = 'var(--crimson)';
    SIM.balance += val;
    SIM.earnedProfit += val;
  } else if (val > 0 && val > firm.profitTarget * firm.consistencyCap) {
    alertEl.style.display = 'block';
    alertEl.innerHTML = `⚠ هذا الربح ($${val}) يتجاوز سقف قاعدة الاتساق ($${Math.floor(firm.profitTarget * firm.consistencyCap)}). قد يُلغي الطلب.`;
    alertEl.style.background = 'rgba(244,196,78,.1)';
    alertEl.style.color = 'var(--gold)';
    SIM.balance += val;
    SIM.earnedProfit += val;
  } else {
    SIM.balance += val;
    SIM.earnedProfit += val;
  }

  SIM.days.push(val);
  inp.value = '';
  renderSimStats();

  if (SIM.earnedProfit >= firm.profitTarget && SIM.days.length >= firm.minDays) {
    alertEl.style.display = 'block';
    alertEl.innerHTML = `🎉 مبروك! أكملت الهدف في ${SIM.days.length} يوم. يمكنك الآن تقديم طلب الاجتياز!`;
    alertEl.style.background = 'rgba(51,229,161,.12)';
    alertEl.style.color = 'var(--emerald)';
  }
};

window.resetSim = function() {
  if (!PLAN) return;
  SIM = { balance: PLAN.firm.accountSize, earnedProfit: 0, days: [] };
  document.getElementById('simAlert').style.display = 'none';
  document.getElementById('simDayInput').value = '';
  renderSimStats();
};

/* ══════════════════════════════════════
   Trading Sessions
══════════════════════════════════════ */
function isUSDST(d) {
  const y=d.getFullYear(), mar=new Date(y,2,1), nov=new Date(y,10,1);
  return d >= new Date(y,2,8+(7-mar.getDay())%7) && d < new Date(y,10,1+(7-nov.getDay())%7);
}
function isLocalDST(d) {
  const y=d.getFullYear(), m31=new Date(y,2,31), o31=new Date(y,9,31);
  return d >= new Date(y,2,31-m31.getDay()) && d < new Date(y,9,31-o31.getDay());
}
function fmtH(h) {
  const n=((h%24)+24)%24, hr=Math.floor(n), mn=Math.round((n-hr)*60);
  const h12=hr===0?12:hr>12?hr-12:hr, ap=hr<12?'ص':'م';
  return `${h12}:${String(mn).padStart(2,'0')} ${ap}`;
}
function isSessionActive(startUTC, endUTC, nowUTC) {
  if (startUTC < endUTC) return nowUTC >= startUTC && nowUTC < endUTC;
  return nowUTC >= startUTC || nowUTC < endUTC; // crosses midnight
}

function renderSessionBtns() {
  const el = document.getElementById('sessionCountryBtns'); if (!el) return;
  el.innerHTML = SESSION_COUNTRIES.map(c =>
    `<button class="cbtn" data-code="${c.code}" onclick="selectSessionCountry('${c.code}')">${c.flag} ${c.name}</button>`
  ).join('');
}

window.selectSessionCountry = function(code) {
  const c = SESSION_COUNTRIES.find(x => x.code === code); if (!c) return;
  document.querySelectorAll('#sessionCountryBtns .cbtn').forEach(b =>
    b.classList.toggle('active', b.dataset.code === code));

  const now = new Date();
  const usDST = isUSDST(now);
  const cOff  = (c.dst && isLocalDST(now)) ? (c.dstOffset || c.offset + 1) : c.offset;
  const nowUTC = now.getUTCHours() + now.getUTCMinutes() / 60;
  const nowLocal = ((nowUTC + cOff) % 24 + 24) % 24;

  const el = document.getElementById('sessionDisplay'); if (!el) return;

  const cards = SESSIONS.map(s => {
    const sLocal = ((s.startUTC + cOff) % 24 + 24) % 24;
    const eLocal = ((s.endUTC   + cOff) % 24 + 24) % 24;
    const active = isSessionActive(s.startUTC, s.endUTC, nowUTC);

    return `
    <div class="session-card ${active ? 'active' : ''}"
         style="${active ? `border-color:${s.color}40;background:${s.color}0d` : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:22px">${s.flag}</span>
          <div>
            <div style="font-family:'Cairo';font-weight:700;font-size:15px">${s.name}
              ${active ? `<span class="session-live" style="margin-right:6px;font-size:12px;color:${s.color}">● مفتوحة الآن</span>` : ''}
            </div>
            <div style="font-size:11.5px;color:var(--muted)">${s.activity}</div>
          </div>
        </div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:${s.color};font-weight:700">
          ${fmtH(sLocal)} — ${fmtH(eLocal)}
        </span>
      </div>
      <div style="background:rgba(255,255,255,.04);border-radius:6px;height:8px;overflow:hidden">
        <div style="height:100%;background:${s.color};opacity:${active?'.7':'.2'};
          border-radius:6px;width:100%;transition:opacity .3s"></div>
      </div>
      ${active ? `<div style="margin-top:8px;font-size:12px;color:${s.color}">
        ★ هذه الجلسة مفتوحة الآن — الوقت المحلي لديك: ${fmtH(nowLocal)}</div>` : ''}
    </div>`;
  });

  el.innerHTML = `
    <div style="margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)">
        ${c.flag} ${c.name} · UTC+${cOff} · الوقت الآن: ${fmtH(nowLocal)}
        ${c.dst?'· يتأثر بالتوقيت الصيفي':''}
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
      ${cards.join('')}
    </div>
    <div style="margin-top:16px;padding:12px 16px;background:rgba(51,229,161,.06);border:1px solid rgba(51,229,161,.15);border-radius:10px;font-size:13px;color:var(--muted)">
      💡 جلسة نيويورك هي الأنسب لتداول مؤشرات الآجلة (Futures) مع أعلى سيولة وحركة.
    </div>`;
};

/* ══════════════════════════════════════
   Psychological Plan
══════════════════════════════════════ */
function renderPsych(tab) {
  const el = document.getElementById('psychContent'); if (!el) return;
  document.querySelectorAll('.ptab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const items = PSYCH[tab] || [];
  el.innerHTML = `<div class="ptab-content active">
    ${items.map(it => `
      <div class="psych-item">
        <div class="pi-icon">${it.icon}</div>
        <div class="pi-text">${it.text}</div>
      </div>`).join('')}
  </div>`;
}

window.showPsych = renderPsych;

/* ══════════════════════════════════════
   Mistakes Grid
══════════════════════════════════════ */
function renderMistakes() {
  const el = document.getElementById('mistakesGrid'); if (!el) return;
  el.innerHTML = MISTAKES.map(m => `
    <div class="risk-card">
      <div class="rc-icon">${m.icon}</div>
      <div class="rc-title">${m.title}</div>
      <div class="rc-desc">${m.desc}</div>
      <div class="rc-fix">✔ الحل: ${m.fix}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   PDF / Print
══════════════════════════════════════ */
window.downloadPDF = function() {
  if (!PLAN) {
    alert('يرجى إنشاء الخطة أولاً قبل التحميل.');
    return;
  }
  window.print();
};

/* ══════════════════════════════════════
   Scroll reveal for this page
══════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

/* ══════════════════════════════════════
   Auto-refresh live session indicator every 60s
══════════════════════════════════════ */
let _sessionRefreshTimer = null;
(function watchSessionTimer() {
  const el = document.getElementById('sessionCountryBtns');
  if (!el) return;
  _sessionRefreshTimer = setInterval(() => {
    const activeBtn = el.querySelector('.cbtn.active');
    if (activeBtn) window.selectSessionCountry(activeBtn.dataset.code);
  }, 60000);
})();
