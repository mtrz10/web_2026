/* ==========================================================
   Hero scrollytelling — hero.js
   Vanilla JS. Satu nilai `progress` (0–1) menggerakkan frame,
   teks (class .aktif), dan rel progres.
   ========================================================== */
(() => {
  'use strict';

  // ---------- Konfigurasi ----------
  const FRAME_COUNT = 50;
  const framePath = (i) => `img/hero/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;

  const LERP_RATE   = 0.14;   // 0–1, makin kecil makin "buttery"
  const FOCAL_Y     = 0.5;    // posisi vertikal produk (landscape)
  const FOCAL_Y_MOB = 0.36;   // posisi vertikal produk (portrait, teks di bawah)

  // ---------- Elemen ----------
  const story  = document.getElementById('hs-story');
  if (!story) return;
  const canvas = document.getElementById('hs-canvas');
  const ctx    = canvas.getContext('2d');
  const loader = document.getElementById('hs-loader');
  const loaderFill = document.getElementById('hs-loader-fill');
  const loaderPct  = document.getElementById('hs-loader-pct');

  const beats = [...story.querySelectorAll('.hs-beat')].map((el) => ({
    el,
    from: parseFloat(el.dataset.from),
    to  : parseFloat(el.dataset.to)
  }));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---------- State ----------
  let frames = [];
  let ready = false;
  let storyTop = 0;
  let runway = 1;
  let target = 0;
  let current = 0;
  let lastDrawn = -1;
  let raf = 0;
  let lastT = 0;
  let activeBeat = -1;

  // ---------- Preload ----------
  function preload(paths, onProgress) {
    return new Promise((resolve) => {
      const imgs = new Array(paths.length);
      let done = 0;
      const finish = () => {
        done++;
        onProgress(done / paths.length);
        if (done === paths.length) resolve(imgs);
      };
      paths.forEach((p, i) => {
        const img = new Image();
        img.onload = finish;
        img.onerror = () => { console.warn('Frame gagal dimuat:', p); finish(); };
        img.src = p;
        imgs[i] = img;
      });
    });
  }

  function showProgress(ratio) {
    loaderFill.style.transform = `scaleX(${ratio})`;
    loaderPct.textContent = Math.round(ratio * 100) + '%';
  }

  // ---------- Canvas ----------
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);
    lastDrawn = -1;
    measure();
    if (ready) renderFrame(Math.round(current));
  }

  // cari frame terdekat yang berhasil dimuat (toleran bila ada frame hilang)
  function frameAt(i) {
    for (let k = i; k >= 0; k--) {
      const img = frames[k];
      if (img && img.complete && img.naturalWidth) return img;
    }
    return null;
  }

  function renderFrame(i) {
    const img = frameAt(i);
    if (!img) return;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const portrait = ch > cw;

    let scale, focalY;
    if (portrait) {
      // portrait: produk lebih besar dari "contain" tapi tetap utuh, digeser ke atas
      scale  = Math.min((cw * 2) / iw, (ch * 0.6) / ih);
      focalY = FOCAL_Y_MOB;
    } else {
      scale  = Math.max(cw / iw, ch / ih);   // cover: frame mengisi seluruh layar
      focalY = FOCAL_Y;
    }
    const dw = iw * scale, dh = ih * scale;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (cw - dw) / 2, ch * focalY - dh / 2, dw, dh);   // frame apa adanya
  }

  // ---------- Progres scroll ----------
  function measure() {
    storyTop = story.getBoundingClientRect().top + window.scrollY;
    runway   = Math.max(1, story.offsetHeight - window.innerHeight);
  }

  function setBeat(progress) {
    let next = beats.findIndex((b) => progress >= b.from && progress < b.to);
    if (next === -1) next = progress < 0.5 ? 0 : beats.length - 1;
    if (next === activeBeat) return;
    beats.forEach((b, i) => {
      b.el.classList.toggle('aktif', i === next);
      b.el.setAttribute('aria-hidden', String(i !== next));
    });
    activeBeat = next;
  }

  // ---------- Loop animasi (lerp) ----------
  function tick(t) {
    const dt = lastT ? Math.min(t - lastT, 64) : 16.7;
    lastT = t;

    // lerp yang tidak bergantung pada frame rate
    const k = 1 - Math.pow(1 - LERP_RATE, dt / 16.7);
    const diff = target - current;
    current = Math.abs(diff) < 0.01 ? target : current + diff * k;

    const idx = Math.round(current);
    if (idx !== lastDrawn) {
      renderFrame(idx);
      lastDrawn = idx;
    }

    if (current !== target) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      lastT = 0;
    }
  }

  function onScroll() {
    if (!ready) return;
    const progress = clamp((window.scrollY - storyTop) / runway, 0, 1);
    target = progress * (FRAME_COUNT - 1);
    story.style.setProperty('--p', progress.toFixed(4));
    setBeat(progress);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // ---------- Tautan ke section di halaman ----------
  story.querySelectorAll('a[data-hs-target]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const el = document.getElementById(a.dataset.hsTarget);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // ---------- Init ----------
  async function init() {
    measure();

    if (reduceMotion) {
      // satu frame statis, semua teks tampil lewat CSS
      frames = await preload([framePath(0)], () => {});
      loader.classList.add('selesai');
      ready = true;
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return;
    }

    frames = await preload(Array.from({ length: FRAME_COUNT }, (_, i) => framePath(i)), showProgress);

    ready = true;
    loader.classList.add('selesai');
    resizeCanvas();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { resizeCanvas(); onScroll(); });
    onScroll();
  }

  init();
})();
