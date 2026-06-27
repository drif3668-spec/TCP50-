/* ═══════════════════════════════════════════════════════════════
   FUNX.AI — FULL STORE SYSTEM (Admin Panel + Checkout + Products)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── Config ──────────────────────────────────────────────────
const DB_KEY = 'funxStoreOrders';
const ADMIN_EMAIL = 'funx.admin.427@gmail.com';
const ADMIN_PASSWORD = 'FUNX-ADMIN';
const ADMIN_SESSION_KEY = 'funxAdminSession';

// ─── Order Statuses ──────────────────────────────────────────
const ORDER_STATUSES = [
  'جديد',
  'قيد المراجعة',
  'تم التواصل',
  'بإنتظار الدفع',
  'قيد التنفيذ',
  'تم الإنجاز',
  'مرفوض'
];

// ─── Products / Services ─────────────────────────────────────
const PRODUCTS = [
  {
    id: 'free-account',
    type: 'free',
    name: 'الحساب المجاني 50,000$',
    price: 0,
    category: 'حسابات مجانية',
    enabled: true,
    summary: 'احصل على حساب ممول مجاني بقيمة 50,000$ لأول 250 شخص فقط.',
    description: 'عرض محدود لأول 250 شخص مع برنامج VIP لإدارة رأس المال ومتابعة الصفقات.',
    features: [
      'حساب ممول بقيمة 50,000$',
      'برنامج VIP لإدارة رأس المال',
      'متابعة احترافية للصفقات',
      'مراجعة الأداء وتقليل المخاطر'
    ],
    requirements: [
      'الانضمام إلى قناة Telegram الرسمية',
      'دعوة 5 أشخاص إلى القناة',
      'فتح حساب Rise',
      'إرسال Gmail المرتبط بحساب Rise'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'paid-pass',
    type: 'paid',
    name: 'خدمة اجتياز اختبار TCP50',
    price: 67,
    category: 'خدمات مدفوعة',
    enabled: true,
    summary: 'خدمة احترافية لاجتياز اختبار TCP50 على منصة Earn2Trade.',
    description: 'نساعدك على اجتياز اختبار TCP50 باحترافية مع خطة تداول منضبطة وإدارة مخاطر.',
    features: [
      'اجتياز اختبار TCP50',
      'خطة تداول منضبطة',
      'إدارة مخاطر احترافية',
      'متابعة مستمرة حتى الإنجاز'
    ],
    paymentPlan: [
      { amount: 33, label: 'قبل بدء العمل' },
      { amount: 34, label: 'بعد اكتمال الخدمة' }
    ],
    createdAt: new Date().toISOString()
  }
];

// ─── Data Layer ──────────────────────────────────────────────
function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(DB_KEY, JSON.stringify(orders));
}

function generateOrderNumber() {
  return `FUNX-${Date.now().toString().slice(-6)}`;
}

function createOrder(type, formEl) {
  const data = new FormData(formEl);
  return {
    id: generateOrderNumber(),
    type: type,
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    whatsapp: String(data.get('whatsapp') || '').trim(),
    country: String(data.get('country') || '').trim(),
    notes: String(data.get('notes') || '').trim(),
    createdAt: new Date().toISOString(),
    status: 'جديد',
    history: [
      { status: 'جديد', timestamp: new Date().toISOString() }
    ]
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDateTime(value) {
  return new Intl.DateTimeFormat('ar', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function getStatusBadgeClass(status) {
  const map = {
    'جديد': 'fa-admin-badge-new',
    'قيد المراجعة': 'fa-admin-badge-review',
    'تم التواصل': 'fa-admin-badge-contacted',
    'بإنتظار الدفع': 'fa-admin-badge-payment',
    'قيد التنفيذ': 'fa-admin-badge-progress',
    'تم الإنجاز': 'fa-admin-badge-completed',
    'مرفوض': 'fa-admin-badge-rejected'
  };
  return map[status] || 'fa-admin-badge-new';
}

// ─── Notification System ─────────────────────────────────────
const notifications = [];

function addNotification(message) {
  notifications.unshift({ message, time: new Date() });
  if (notifications.length > 8) notifications.length = 8;
  renderNotifications();
}

function renderNotifications() {
  const list = document.querySelector('[data-fa-notif-list]');
  if (!list) return;
  list.innerHTML = notifications.length
    ? notifications.map(n =>
        `<div class="fa-admin-notif-item">
          <span>${escapeHtml(n.message)}</span>
          <small>${formatDateTime(n.time)}</small>
        </div>`
      ).join('')
    : '<div class="fa-admin-empty">لا توجد إشعارات.</div>';

  const count = document.querySelector('[data-fa-notif-count]');
  if (count) count.textContent = notifications.length;
}

// ─── Admin Login ─────────────────────────────────────────────
(function initAdminLogin() {
  const form = document.querySelector('[data-fa-admin-login-form]');
  if (!form) return;

  const errorDiv = form.querySelector('[data-fa-login-error]');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '').trim();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'active');
      window.location.href = 'funx-admin.html';
      return;
    }

    if (errorDiv) {
      errorDiv.textContent = '❌ البريد الإلكتروني أو كلمة السر غير صحيحة.';
      errorDiv.classList.add('is-visible');
    } else {
      alert('❌ البريد الإلكتروني أو كلمة السر غير صحيحة.');
    }
  });
})();

// ─── Admin Dashboard ─────────────────────────────────────────
(function initAdminDashboard() {
  // Guard: only run on admin page
  if (!document.querySelector('[data-fa-admin-dashboard]')) return;

  // Auth check
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== 'active') {
    window.location.href = 'funx-admin-login.html';
    return;
  }

  // ── DOM refs ──
  const dashboard = document.querySelector('[data-fa-admin-dashboard]');
  const topbar = dashboard.querySelector('[data-fa-admin-topbar]');
  const statsGrid = dashboard.querySelector('[data-fa-admin-stats]');
  const notifBar = dashboard.querySelector('[data-fa-admin-notif-bar]');
  const tabsContainer = dashboard.querySelector('[data-fa-admin-tabs]');
  const filtersContainer = dashboard.querySelector('[data-fa-admin-filters]');
  const tableWrap = dashboard.querySelector('[data-fa-admin-table-wrap]');
  const tableBody = tableWrap?.querySelector('tbody');
  const emptyState = tableWrap?.querySelector('[data-fa-admin-empty]');
  const modal = document.querySelector('[data-fa-admin-modal]');
  const modalOverlay = document.querySelector('[data-fa-admin-modal-overlay]');
  const sections = dashboard.querySelectorAll('[data-fa-admin-section]');

  // Store section references by name
  const sectionMap = {};
  sections.forEach(s => {
    const name = s.getAttribute('data-fa-admin-section');
    if (name) sectionMap[name] = s;
  });

  // ── State ──
  let currentFilter = 'free';
  let currentTab = 'orders'; // 'orders' | 'products'

  // ── Logout ──
  document.querySelectorAll('[data-fa-admin-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      window.location.href = 'funx-admin-login.html';
    });
  });

  // ── Render orders ──
  function renderOrders() {
    const orders = getOrders().filter(o => o.type === currentFilter);

    if (tableBody) {
      tableBody.innerHTML = orders.length
        ? orders.map(order => `
            <tr>
              <td><a href="#" class="fa-admin-order-link" data-order-id="${escapeHtml(order.id)}">${escapeHtml(order.name)}</a></td>
              <td>${escapeHtml(order.email)}</td>
              <td dir="ltr">${escapeHtml(order.whatsapp)}</td>
              <td>${escapeHtml(order.country)}</td>
              <td>${formatDateTime(order.createdAt)}</td>
              <td><span class="fa-admin-badge ${getStatusBadgeClass(order.status)}">${escapeHtml(order.status)}</span></td>
              <td>
                <div class="fa-admin-actions">
                  <button type="button" class="fa-admin-action-btn fa-admin-action-btn-view" data-fa-view-order="${escapeHtml(order.id)}">عرض</button>
                  <button type="button" class="fa-admin-action-btn fa-admin-action-btn-delete" data-fa-delete-order="${escapeHtml(order.id)}">حذف</button>
                </div>
              </td>
            </tr>
          `).join('')
        : '';
    }

    if (emptyState) emptyState.hidden = orders.length > 0;

    // Update stats
    updateStats();
  }

  // ── Update stats ──
  function updateStats() {
    const allOrders = getOrders();
    const freeOrders = allOrders.filter(o => o.type === 'free');
    const paidOrders = allOrders.filter(o => o.type === 'paid');
    const completed = allOrders.filter(o => o.status === 'تم الإنجاز');
    const pending = allOrders.filter(o => o.status === 'جديد' || o.status === 'قيد المراجعة');

    const statEls = statsGrid?.querySelectorAll('[data-fa-stat]');
    if (statEls) {
      statEls.forEach(el => {
        const key = el.getAttribute('data-fa-stat');
        switch (key) {
          case 'total-free': el.textContent = freeOrders.length; break;
          case 'total-paid': el.textContent = paidOrders.length; break;
          case 'completed': el.textContent = completed.length; break;
          case 'pending': el.textContent = pending.length; break;
          case 'total-all': el.textContent = allOrders.length; break;
        }
      });
    }
  }

  // ── Open modal with order detail ──
  function openOrderModal(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || !modal) return;

    // Fill modal fields
    modal.querySelector('[data-fa-modal-name]').textContent = order.name;
    modal.querySelector('[data-fa-modal-email]').textContent = order.email;
    modal.querySelector('[data-fa-modal-whatsapp]').textContent = order.whatsapp;
    modal.querySelector('[data-fa-modal-country]').textContent = order.country;
    modal.querySelector('[data-fa-modal-date]').textContent = formatDateTime(order.createdAt);
    modal.querySelector('[data-fa-modal-id]').textContent = order.id;

    const statusSelect = modal.querySelector('[data-fa-modal-status]');
    if (statusSelect) {
      statusSelect.innerHTML = ORDER_STATUSES.map(s =>
        `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`
      ).join('');
      statusSelect.dataset.orderId = order.id;
    }

    // History
    const historyEl = modal.querySelector('[data-fa-modal-history]');
    if (historyEl) {
      const history = order.history || [];
      historyEl.innerHTML = history.length
        ? history.map(h =>
            `<div class="fa-admin-modal-history-item">
              <span>${escapeHtml(h.status)}</span>
              <span>${formatDateTime(h.timestamp)}</span>
            </div>`
          ).join('')
        : '<div class="fa-admin-empty">لا يوجد سجل حركات.</div>';
    }

    // Notes
    const notesEl = modal.querySelector('[data-fa-modal-notes]');
    if (notesEl) {
      notesEl.value = order.notes || '';
      notesEl.dataset.orderId = order.id;
    }

    // Update status action
    const updateBtn = modal.querySelector('[data-fa-modal-update-status]');
    if (updateBtn) updateBtn.dataset.orderId = order.id;

    // Telegram link
    const telegramEl = modal.querySelector('[data-fa-modal-telegram]');
    if (telegramEl) telegramEl.href = `https://t.me/${order.whatsapp.replace(/[^a-zA-Z0-9_]/g, '')}`;

    // Show modal
    modalOverlay?.classList.add('is-open');
  }

  // ── Close modal ──
  function closeOrderModal() {
    modalOverlay?.classList.remove('is-open');
  }

  // ── Switch tab/section ──
  function switchTab(tabName) {
    currentTab = tabName;
    tabsContainer?.querySelectorAll('[data-fa-admin-tab]').forEach(t => {
      t.classList.toggle('is-active', t.getAttribute('data-fa-admin-tab') === tabName);
    });

    // Show/hide sections
    Object.keys(sectionMap).forEach(key => {
      const show = (tabName === 'products' && key === 'products') ||
                   (tabName !== 'products' && key !== 'products');
      sectionMap[key].classList.toggle('is-visible', show);
    });

    if (tabName === 'products') {
      renderProducts();
    } else {
      renderOrders();
    }
  }

  // ── Render Products ──
  function renderProducts() {
    const grid = document.querySelector('[data-fa-admin-products-grid]');
    if (!grid) return;

    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fa-admin-product-card ${p.enabled ? '' : 'disabled'}">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="fa-admin-product-price">${p.price === 0 ? 'مجاني' : `${p.price}$`}</div>
        <p>${escapeHtml(p.summary)}</p>
        <div class="fa-admin-product-actions">
          <button class="edit-btn" data-fa-edit-product="${escapeHtml(p.id)}">تعديل</button>
          <button class="toggle-btn" data-fa-toggle-product="${escapeHtml(p.id)}">
            ${p.enabled ? 'تعطيل' : 'تفعيل'}
          </button>
        </div>
      </div>
    `).join('');
  }

  // ── Edit Product Modal ──
  const productModal = document.querySelector('[data-fa-admin-product-modal]');
  const productForm = productModal?.querySelector('[data-fa-admin-product-form]');

  function openProductModal(productId) {
    if (!productModal || !productForm) return;
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    productForm.dataset.editId = product.id;
    productForm.querySelector('[name="name"]').value = product.name;
    productForm.querySelector('[name="price"]').value = product.price;
    productForm.querySelector('[name="summary"]').value = product.summary;
    productForm.querySelector('[name="description"]').value = product.description;
    productForm.querySelector('[name="category"]').value = product.category;
    productForm.querySelector('[name="enabled"]').checked = product.enabled;

    document.querySelector('[data-fa-admin-product-modal-overlay]')?.classList.add('is-open');
  }

  function closeProductModal() {
    document.querySelector('[data-fa-admin-product-modal-overlay]')?.classList.remove('is-open');
  }

  // ── Event Delegation ──
  dashboard.addEventListener('click', e => {
    const target = e.target;

    // View order
    const viewBtn = target.closest('[data-fa-view-order]');
    if (viewBtn) {
      openOrderModal(viewBtn.getAttribute('data-fa-view-order'));
      return;
    }

    // Delete order
    const deleteBtn = target.closest('[data-fa-delete-order]');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-fa-delete-order');
      if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        saveOrders(getOrders().filter(o => o.id !== id));
        renderOrders();
        addNotification(`تم حذف الطلب ${id}`);
      }
      return;
    }

    // Order link in table
    const orderLink = target.closest('[data-order-id]');
    if (orderLink) {
      e.preventDefault();
      openOrderModal(orderLink.getAttribute('data-order-id'));
      return;
    }

    // Edit product
    const editBtn = target.closest('[data-fa-edit-product]');
    if (editBtn) {
      openProductModal(editBtn.getAttribute('data-fa-edit-product'));
      return;
    }

    // Toggle product
    const toggleBtn = target.closest('[data-fa-toggle-product]');
    if (toggleBtn) {
      const id = toggleBtn.getAttribute('data-fa-toggle-product');
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        product.enabled = !product.enabled;
        renderProducts();
        addNotification(`${product.enabled ? 'تفعيل' : 'تعطيل'} ${product.name}`);
      }
      return;
    }
  });

  // ── Tabs ──
  tabsContainer?.addEventListener('click', e => {
    const tab = e.target.closest('[data-fa-admin-tab]');
    if (tab) switchTab(tab.getAttribute('data-fa-admin-tab'));
  });

  // ── Filter buttons ──
  filtersContainer?.addEventListener('click', e => {
    const btn = e.target.closest('[data-fa-admin-filter]');
    if (btn) {
      currentFilter = btn.getAttribute('data-fa-admin-filter');
      filtersContainer.querySelectorAll('[data-fa-admin-filter]').forEach(b =>
        b.classList.toggle('is-active', b === btn)
      );
      renderOrders();
    }
  });

  // ── Search ──
  const searchInput = filtersContainer?.querySelector('[data-fa-admin-search]');
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const rows = tableBody?.querySelectorAll('tr') || [];
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });

  // ── Modal close ──
  modalOverlay?.addEventListener('click', e => {
    if (e.target === modalOverlay) closeOrderModal();
  });
  modal?.querySelector('[data-fa-modal-close]')?.addEventListener('click', closeOrderModal);
  modal?.querySelector('[data-fa-modal-cancel]')?.addEventListener('click', closeOrderModal);

  // ── Update status from modal ──
  modal?.addEventListener('change', e => {
    const select = e.target.closest('[data-fa-modal-status]');
    if (!select) return;
    const orderId = select.dataset.orderId;
    const newStatus = select.value;
    const orders = getOrders().map(o => {
      if (o.id === orderId) {
        const history = o.history || [];
        history.push({ status: newStatus, timestamp: new Date().toISOString() });
        return { ...o, status: newStatus, history };
      }
      return o;
    });
    saveOrders(orders);
    renderOrders();
    addNotification(`تم تحديث حالة الطلب ${orderId} إلى "${newStatus}"`);
  });

  // ── Save notes ──
  modal?.addEventListener('blur', e => {
    const textarea = e.target.closest('[data-fa-modal-notes]');
    if (!textarea) return;
    const orderId = textarea.dataset.orderId;
    const orders = getOrders().map(o => {
      if (o.id === orderId) return { ...o, notes: textarea.value };
      return o;
    });
    saveOrders(orders);
  }, true);

  // ── Product form save ──
  productForm?.addEventListener('submit', e => {
    e.preventDefault();
    const id = productForm.dataset.editId;
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    product.name = productForm.querySelector('[name="name"]').value;
    product.price = Number(productForm.querySelector('[name="price"]').value);
    product.summary = productForm.querySelector('[name="summary"]').value;
    product.description = productForm.querySelector('[name="description"]').value;
    product.category = productForm.querySelector('[name="category"]').value;
    product.enabled = productForm.querySelector('[name="enabled"]').checked;

    renderProducts();
    closeProductModal();
    addNotification(`تم تحديث المنتج ${product.name}`);
  });

  productForm?.querySelector('[data-fa-product-cancel]')?.addEventListener('click', closeProductModal);
  document.querySelector('[data-fa-admin-product-modal-overlay]')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeProductModal();
  });

  // ── Add new product ──
  document.querySelector('[data-fa-admin-add-product]')?.addEventListener('click', () => {
    if (!productForm) return;
    productForm.dataset.editId = '';
    productForm.reset();
    productForm.querySelector('[name="name"]').value = '';
    productForm.querySelector('[name="price"]').value = '0';
    productForm.querySelector('[name="summary"]').value = '';
    productForm.querySelector('[name="description"]').value = '';
    productForm.querySelector('[name="category"]').value = 'خدمات';
    productForm.querySelector('[name="enabled"]').checked = true;

    document.querySelector('[data-fa-admin-product-modal-overlay]')?.classList.add('is-open');
  });

  // ── Export ──
  document.querySelectorAll('[data-fa-admin-export]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-fa-admin-export'); // 'csv' | 'json'
      const orders = getOrders().filter(o => o.type === currentFilter);

      if (type === 'json') {
        const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funx-orders-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addNotification('تم تصدير البيانات بصيغة JSON');
      } else if (type === 'csv') {
        const headers = ['id', 'type', 'name', 'email', 'whatsapp', 'country', 'status', 'createdAt', 'notes'];
        const rows = orders.map(o => headers.map(h => `"${String(o[h] || '').replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funx-orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        addNotification('تم تصدير البيانات بصيغة CSV');
      }
    });
  });

  // ── Notif bar close ──
  notifBar?.querySelector('[data-fa-notif-close]')?.addEventListener('click', () => {
    notifBar.style.display = 'none';
  });

  // ── Init ──
  switchTab('orders');
  renderOrders();
  addNotification('مرحباً بك في لوحة الإدارة');
})();

// ─── Order Forms ─────────────────────────────────────────────
(function initOrderForms() {
  document.querySelectorAll('[data-fa-order-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const type = form.getAttribute('data-fa-order-form');
      const order = createOrder(type, form);
      const orders = getOrders();
      orders.unshift(order);
      saveOrders(orders);
      form.reset();

      // Show success
      const orderIdEl = document.querySelector('[data-fa-order-id]');
      if (orderIdEl) orderIdEl.textContent = order.id;

      // Handle wizard steps if present
      const wizard = form.closest('[data-fa-wizard]');
      if (wizard) {
        const steps = wizard.querySelectorAll('.fa-wizard-steps button');
        steps.forEach((step, idx) => {
          step.classList.toggle('is-active', idx >= 1 && idx <= 4);
        });
        wizard.querySelectorAll('.fa-wizard-panel').forEach(p => p.classList.remove('is-active'));
        const successPanel = wizard.querySelector(`[data-fa-success="${type}"]`);
        if (successPanel) successPanel.classList.add('is-active');
        const tracker = wizard.querySelector('[data-fa-order-tracker]');
        if (tracker) tracker.classList.add('is-active');
      }

      // Confetti
      launchConfetti();

      addNotification(`🎉 تم استلام الطلب بنجاح! رقم الطلب: ${order.id}`);
    });
  });
})();

// ─── Confetti ────────────────────────────────────────────────
function launchConfetti() {
  const layer = document.createElement('div');
  layer.className = 'fa-confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 44; i++) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--d', `${Math.random() * 1.2 + 0.8}s`);
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2000);
}

// ─── Reveal Animations ──────────────────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('.fa-reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('fa-in'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('fa-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  items.forEach(item => observer.observe(item));
})();

// ─── Counter Animation ──────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-fa-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute('data-fa-count') || 0);
      const prefix = el.getAttribute('data-fa-prefix') || '';
      const suffix = el.getAttribute('data-fa-suffix') || '';
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
  }, { threshold: 0.35 });
  counters.forEach(counter => observer.observe(counter));
})();

// ─── Progress Bar Animation ─────────────────────────────────
(function initProgress() {
  const bars = document.querySelectorAll('[data-fa-progress-bar]');
  if (!bars.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-live');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(bar => observer.observe(bar));
})();

// ─── Footer Year ─────────────────────────────────────────────
(function setFooterYear() {
  const el = document.querySelector('[data-fa-year]');
  if (el) el.textContent = new Date().getFullYear();
})();
