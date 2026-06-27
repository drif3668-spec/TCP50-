'use strict';

const TCP50_DB_KEY = 'tcp50StoreOrders';
const ORDER_STATUSES = ['جديد', 'قيد المراجعة', 'تم التواصل', 'مكتمل'];

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

function createOrder(type, form) {
  const data = new FormData(form);
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    whatsapp: String(data.get('whatsapp') || '').trim(),
    country: String(data.get('country') || '').trim(),
    createdAt: new Date().toISOString(),
    status: 'جديد'
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
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
        window.Motion.animate(
          entry.target,
          { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0)'] },
          { duration: .75, easing: [0.2, 0.7, 0.2, 1] }
        );
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  items.forEach((item) => observer.observe(item));
})();

(function initStore() {
  const selectors = document.querySelectorAll('[data-service-select]');
  const panels = document.querySelectorAll('[data-service-panel]');
  const cartTitle = document.getElementById('cartTitle');
  const cartDesc = document.getElementById('cartDesc');
  const addBtn = document.getElementById('addToCartBtn');
  const nextBtn = document.getElementById('cartNextBtn');
  if (!selectors.length || !panels.length) return;

  const services = {
    free: {
      title: '🎁 الحساب المجاني',
      desc: 'تم اختيار الحساب المجاني. يمكنك إضافة الخدمة للسلة ثم متابعة الخطوات.',
      target: '#free-form'
    },
    paid: {
      title: '💎 خدمة اجتياز الاختبار',
      desc: 'تم اختيار خدمة اجتياز اختبار TCP50. يمكنك إضافة الخدمة للسلة ثم متابعة الطلب.',
      target: '#paid-account'
    }
  };
  let current = 'free';
  let cart = [];

  function setService(type) {
    current = type;
    selectors.forEach((button) => button.classList.toggle('is-active', button.dataset.serviceSelect === type));
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.servicePanel === type));
    if (cartTitle) cartTitle.textContent = services[type].title;
    if (cartDesc) cartDesc.textContent = services[type].desc;
    document.getElementById('service-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectors.forEach((button) => {
    button.addEventListener('click', () => setService(button.dataset.serviceSelect));
  });

  addBtn?.addEventListener('click', () => {
    cart = [current];
    addBtn.textContent = 'تمت الإضافة إلى السلة';
    addBtn.classList.add('is-added');
    setTimeout(() => {
      addBtn.textContent = 'إضافة إلى السلة';
      addBtn.classList.remove('is-added');
    }, 1600);
  });

  nextBtn?.addEventListener('click', () => {
    if (!cart.includes(current)) cart = [current];
    document.querySelector(services[current].target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll('[data-show-form]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.showForm;
      const form = document.querySelector(`[data-order-form="${type}"]`);
      if (form) {
        form.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  document.querySelectorAll('[data-order-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const type = form.dataset.orderForm;
      const order = createOrder(type, form);
      const orders = getOrders();
      orders.unshift(order);
      saveOrders(orders);
      form.reset();
      form.hidden = true;
      const success = document.querySelector(`[data-success="${type}"]`);
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
})();

(function initParallax() {
  const visual = document.querySelector('.fa-hero-visual');
  const card = document.querySelector('.fa-funded-card');
  if (!visual || !card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - .5) * -12;
    card.style.transform = `rotateY(${x - 12}deg) rotateX(${y + 7}deg) rotateZ(-3deg) translateY(-8px)`;
  });
  visual.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
})();

(function initThreeCard() {
  const canvas = document.getElementById('faThreeCard');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  camera.position.set(0, 0, 7);

  const group = new THREE.Group();
  scene.add(group);

  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(3, 4, 5);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xfff0c5, 1.25));

  const black = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: .26, metalness: .22 });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf7c948,
    roughness: .18,
    metalness: .85,
    emissive: 0x4d3300,
    emissiveIntensity: .1
  });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .42, metalness: .04 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, .36, 80), white);
  base.position.y = -1.35;
  group.add(base);

  const card = new THREE.Mesh(new THREE.BoxGeometry(3.55, 2.18, .18, 8, 8, 2), black);
  card.position.set(.05, .1, 0);
  card.rotation.set(-.08, -.34, .04);
  group.add(card);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(3.74, 2.36, .08), gold);
  rim.position.set(.05, .1, -.08);
  rim.rotation.copy(card.rotation);
  group.add(rim);

  [0.55, .85, 1.15, 1.55].forEach((height, index) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.18, height, .18), gold);
    bar.position.set(-1.3 + index * .36, -.66 + height / 2, .55);
    group.add(bar);
  });

  const arrow = new THREE.Mesh(new THREE.ConeGeometry(.2, .54, 4), gold);
  arrow.position.set(.65, .72, .56);
  arrow.rotation.set(0, 0, -.78);
  group.add(arrow);

  const coinGeo = new THREE.CylinderGeometry(.34, .34, .08, 48);
  for (let i = 0; i < 8; i += 1) {
    const coin = new THREE.Mesh(coinGeo, gold);
    coin.position.set(Math.cos(i) * 2.15, Math.sin(i * 1.7) * .75 + .1, Math.sin(i) * .55);
    coin.rotation.set(Math.random() * .6, Math.random() * .8, Math.random() * .5);
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
    group.rotation.x = Math.sin(t * .4) * .04;
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
        <td>
          <select data-status-id="${order.id}">
            ${ORDER_STATUSES.map((status) => `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </td>
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
    const orders = getOrders().map((order) => (
      order.id === select.dataset.statusId ? { ...order, status: select.value } : order
    ));
    saveOrders(orders);
  });

  body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;
    saveOrders(getOrders().filter((order) => order.id !== button.dataset.deleteId));
    render();
  });

  render();
})();
