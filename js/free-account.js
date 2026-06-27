'use strict';

(function initReveal() {
  const items = document.querySelectorAll('.fa-reveal');
  if (!items.length) return;
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

(function initCounters() {
  const counters = document.querySelectorAll('.fa-stat strong[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const duration = 1400;
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString('en-US') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((counter) => observer.observe(counter));
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

  const black = new THREE.MeshStandardMaterial({
    color: 0x101010,
    roughness: .26,
    metalness: .22
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf7c948,
    roughness: .18,
    metalness: .85,
    emissive: 0x4d3300,
    emissiveIntensity: .1
  });
  const white = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: .42,
    metalness: .04
  });

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

  const bars = [0.55, .85, 1.15, 1.55].map((height, index) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.18, height, .18), gold);
    bar.position.set(-1.3 + index * .36, -.66 + height / 2, .55);
    return bar;
  });
  bars.forEach((bar) => group.add(bar));

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
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate(now) {
    const t = now * .001;
    group.rotation.y = Math.sin(t * .55) * .16;
    group.rotation.x = Math.sin(t * .4) * .04;
    group.position.y = Math.sin(t * 1.1) * .08;
    bars.forEach((bar, index) => {
      bar.scale.y = 1 + Math.sin(t * 1.8 + index) * .06;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(animate);
})();
