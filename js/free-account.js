'use strict';

const TCP50_DB_KEY = 'tcp50StoreOrders';
const ORDER_STATUSES = ['تم الاستلام', 'جديد', 'قيد المراجعة', 'بانتظار التواصل', 'تم التواصل', 'مكتمل'];
const SERVICES = {
  free: {
    type: 'free',
    name: '🎁 الحساب المجاني',
    price: 0,
    summary: 'تسجيل متعدد المراحل للحصول على الحساب المجاني مع تعليمات Telegram وRise.'
  },
  paid: {
    type: 'paid',
    name: '💎 خدمة اجتياز اختبار TCP50',
    price: 67,
    summary: 'خدمة مباشرة لاجتياز اختبار TCP50 بعد شراء الحساب من Earn2Trade.'
  }
};

let cart = [];
let notifications = [];

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(TCP50_DB_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(TCP50_DB_KEY, JSON.stringify(orders));
}

function orderNumber() {
  return `FUNX-${Date.now().toString().slice(-6)}`;
}

function createOrder(type, form) {
  const data = new FormData(form);
  return {
    id: orderNumber(),
    type,
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    whatsapp: String(data.get('whatsapp') || '').trim(),
    country: String(data.get('country') || '').trim(),
    createdAt: new Date().toISOString(),
    status: 'تم الاستلام'
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function notify(message) {
  notifications.unshift({ message, time: new Date() });
  notifications = notifications.slice(0, 8);
  renderNotifications();
}

function renderNotifications() {
  const list = document.querySelector('[data-notification-list]');
  const count = document.querySelector('[data-notification-count]');
  if (count) count.textContent = String(notifications.length);
  if (!list) return;
  list.innerHTML = notifications.length
    ? notifications.map((item) => `<div class="fa-notification"><strong>${escapeHTML(item.message)}</strong><span>${formatDate(item.time)}</span></div>`).join('')
    : '<div class="fa-notification is-empty">لا توجد إشعارات بعد.</div>';
}

function renderCart() {
  const itemsEl = document.querySelector('[data-cart-items]');
  const totalEl = document.querySelector('[data-cart-total]');
  const countEls = document.querySelectorAll('[data-cart-count]');
  const checkoutService = document.querySelector('[data-checkout-service]');
  const checkoutSummary = document.querySelector('[data-checkout-summary]');
  const checkoutPrice = document.querySelector('[data-checkout-price]');
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  countEls.forEach((el) => { el.textContent = String(cart.length); });
  if (totalEl) totalEl.textContent = `${total}$`;
  if (itemsEl) {
    itemsEl.innerHTML = cart.length
      ? cart.map((item) => `
        <div class="fa-cart-item">
          <div><strong>${item.name}</strong><span>${item.summary}</span></div>
          <b>${item.price}$</b>
          <button type="button" data-remove-cart="${item.type}">حذف</button>
        </div>
      `).join('')
      : '<div class="fa-cart-empty">السلة فارغة.</div>';
  }
  const active = cart[0];
  if (checkoutService) checkoutService.textContent = active ? active.name : 'لم يتم اختيار خدمة بعد';
  if (checkoutSummary) checkoutSummary.textContent = active ? active.summary : 'أضف خدمة إلى السلة ثم اضغط متابعة.';
  if (checkoutPrice) checkoutPrice.textContent = `${active ? active.price : 0}$`;
}

(function initReveal() {
  const items = document.querySelectorAll('.fa-reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('fa-in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('fa-in');
      if (window.Motion && typeof window.Motion.animate === 'function') {
        window.Motion.animate(entry.target, { opacity: [0, 1], y: [28, 0] }, { duration: .75, easing: [0.2, 0.7, 0.2, 1] });
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  items.forEach((item) => observer.observe(item));
})();

(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: .35 });
  counters.forEach((counter) => observer.observe(counter));
})();

(function initProgress() {
  const bars = document.querySelectorAll('[data-progress-bar]');
  if (!bars.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-live');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .4 });
  bars.forEach((bar) => observer.observe(bar));
})();

(function initInteractions() {
  renderNotifications();
  renderCart();

  document.querySelectorAll('[data-open-notifications]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('[data-notification-panel]')?.classList.toggle('is-open');
    });
  });

  document.querySelectorAll('[data-open-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('[data-cart-drawer]')?.classList.add('is-open');
      notify('تم فتح السلة.');
    });
  });

  document.querySelectorAll('[data-close-cart]').forEach((button) => {
    button.addEventListener('click', () => document.querySelector('[data-cart-drawer]')?.classList.remove('is-open'));
  });

  document.querySelectorAll('[data-select-service]').forEach((el) => {
    el.addEventListener('click', () => {
      const service = SERVICES[el.dataset.selectService];
      if (service) notify(`تم اختيار ${service.name}.`);
    });
  });

  document.querySelectorAll('[data-fullscreen-card]').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.add('is-expanded');
      setTimeout(() => card.classList.remove('is-expanded'), 760);
    });
  });

  document.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const service = SERVICES[button.dataset.addCart];
      if (!service) return;
      cart = [service];
      renderCart();
      document.querySelector('[data-cart-drawer]')?.classList.add('is-open');
      notify(`تمت إضافة ${service.name} إلى السلة.`);
    });
  });

  document.querySelector('[data-cart-items]')?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-cart]');
    if (!remove) return;
    cart = cart.filter((item) => item.type !== remove.dataset.removeCart);
    renderCart();
    notify('تم حذف الخدمة من السلة.');
  });

  document.querySelector('[data-checkout-link]')?.addEventListener('click', () => {
    document.querySelector('[data-cart-drawer]')?.classList.remove('is-open');
    notify('تم الانتقال إلى Checkout.');
  });
})();

(function initForms() {
  document.querySelectorAll('[data-order-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const type = form.dataset.orderForm;
      const order = createOrder(type, form);
      const orders = getOrders();
      orders.unshift(order);
      saveOrders(orders);
      form.reset();

      const orderId = document.querySelector('[data-free-order-id]');
      if (orderId) orderId.textContent = order.id;

      document.querySelectorAll('.fa-wizard-steps button').forEach((step, index) => {
        step.classList.toggle('is-active', index >= 1 && index <= 4);
      });
      document.querySelectorAll('.fa-wizard-panel').forEach((panel) => panel.classList.remove('is-active'));
      document.querySelector('[data-success="free"]')?.classList.add('is-active');
      document.querySelector('[data-order-tracker]')?.classList.add('is-active');

      launchConfetti();
      notify(`تم إنشاء طلب جديد: ${order.id}`);
    });
  });
})();

function launchConfetti() {
  const layer = document.createElement('div');
  layer.className = 'fa-confetti';
  for (let i = 0; i < 44; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--d', `${Math.random() * 1.2 + .8}s`);
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1800);
}

(function initHeroWorld() {
  const canvas = document.getElementById('faHeroWorld');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
  camera.position.z = 10;

  const gold = new THREE.MeshStandardMaterial({ color: 0xf7c948, roughness: .14, metalness: .75, transparent: true, opacity: .78 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: .05, transmission: .6, transparent: true, opacity: .36 });
  scene.add(new THREE.AmbientLight(0xfff2bf, 1.2));
  const light = new THREE.PointLight(0xf7c948, 3.4, 30);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);
  for (let i = 0; i < 18; i += 1) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * .22 + .08, 32, 32), i % 3 ? glass : gold);
    sphere.position.set((Math.random() - .5) * 12, (Math.random() - .5) * 7, (Math.random() - .5) * 5);
    group.add(sphere);
  }
  const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 420 }, () => (Math.random() - .5) * 14), 3)),
    new THREE.PointsMaterial({ color: 0xf7c948, size: .025, transparent: true, opacity: .72 })
  );
  scene.add(particles);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
  }

  function animate(now) {
    const t = now * .001;
    group.rotation.y = t * .08;
    particles.rotation.y = -t * .04;
    light.position.set(Math.sin(t) * 5, Math.cos(t * .8) * 3, 5);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();

(function initFloatingCard() {
  const canvas = document.getElementById('faThreeCard');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  camera.position.set(0, 0, 7);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xfff0c5, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 4, 5);
  scene.add(key);
  const black = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: .24, metalness: .3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf7c948, roughness: .16, metalness: .85 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .42, metalness: .04 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, .36, 80), white);
  base.position.y = -1.35;
  group.add(base);
  const card = new THREE.Mesh(new THREE.BoxGeometry(3.55, 2.18, .18, 8, 8, 2), black);
  card.rotation.set(-.08, -.34, .04);
  group.add(card);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(3.74, 2.36, .08), gold);
  rim.position.z = -.08;
  rim.rotation.copy(card.rotation);
  group.add(rim);
  for (let i = 0; i < 8; i += 1) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .08, 48), gold);
    coin.position.set(Math.cos(i) * 2.15, Math.sin(i * 1.7) * .75 + .1, Math.sin(i) * .55);
    group.add(coin);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    camera.updateProjectionMatrix();
  }
  function animate(now) {
    const t = now * .001;
    group.rotation.y = Math.sin(t * .55) * .16;
    group.position.y = Math.sin(t * 1.1) * .08;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();

(function initAdmin() {
  const body = document.getElementById('adminOrdersBody');
  const empty = document.getElementById('adminEmpty');
  const tabs = document.querySelectorAll('[data-admin-filter]');
  if (!body || !tabs.length) return;
  let filter = 'free';
  function render() {
    const orders = getOrders().filter((order) => order.type === filter);
    body.innerHTML = orders.map((order) => `
      <tr>
        <td>${escapeHTML(order.name)}</td>
        <td>${escapeHTML(order.email)}</td>
        <td>${escapeHTML(order.whatsapp)}</td>
        <td>${escapeHTML(order.country)}</td>
        <td>${escapeHTML(formatDate(order.createdAt))}</td>
        <td><select data-status-id="${order.id}">${ORDER_STATUSES.map((status) => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
        <td><button type="button" data-delete-id="${order.id}">حذف</button></td>
      </tr>
    `).join('');
    if (empty) empty.hidden = orders.length > 0;
  }
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filter = tab.dataset.adminFilter;
      tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
      render();
    });
  });
  body.addEventListener('change', (event) => {
    const select = event.target.closest('[data-status-id]');
    if (!select) return;
    saveOrders(getOrders().map((order) => order.id === select.dataset.statusId ? { ...order, status: select.value } : order));
  });
  body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;
    saveOrders(getOrders().filter((order) => order.id !== button.dataset.deleteId));
    render();
  });
  render();
})();
