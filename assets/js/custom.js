/* ============================================================
   RETRO GAME PORTFOLIO — VU HUY TRUONG
   Contra × Metal Slug × Mario × SNES Arcade
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     LOADING SCREEN — CONTRA BOOT SEQUENCE
  ══════════════════════════════════════════ */
  const BOOT_LINES = [
    'INITIALIZING GAME ENGINE.....OK',
    'LOADING SPRITE DATA..........OK',
    'VERIFYING SAVE FILE..........OK',
    'BINDING PLAYER CONTROLS......OK',
    'SPAWNING PLAYER 1............OK',
    '▶ PRESS START TO CONTINUE'
  ];

  function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;

    if (sessionStorage.getItem('booted')) {
      screen.style.display = 'none';
      return;
    }

    const log        = document.getElementById('boot-log');
    const bar        = document.getElementById('loading-bar-fill');
    const pressStart = document.getElementById('press-start');
    let i = 0;

    function showLine() {
      const el = document.createElement('div');
      el.className = 'boot-line';
      el.textContent = BOOT_LINES[i];
      if (log) log.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));

      const isLast = i === BOOT_LINES.length - 1;

      if (!isLast && bar) {
        bar.style.width = ((i + 1) / (BOOT_LINES.length - 1) * 90) + '%';
      }

      if (isLast) {
        if (bar) bar.style.width = '100%';
        setTimeout(() => pressStart && pressStart.classList.add('visible'), 300);
        pressStart?.addEventListener('click', dismiss, { once: true });
        document.addEventListener('keydown', function onKey(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            document.removeEventListener('keydown', onKey);
            dismiss();
          }
        });
        return;
      }

      i++;
      setTimeout(showLine, 230);
    }

    function dismiss() {
      screen.classList.add('fade-out');
      setTimeout(() => {
        screen.style.display = 'none';
        sessionStorage.setItem('booted', '1');
      }, 500);
    }

    setTimeout(showLine, 400);
  }

  /* ══════════════════════════════════════════
     HERO CANVAS — SCROLLING PIXEL MOUNTAINS
  ══════════════════════════════════════════ */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');

    let W, H, raf;
    let offset = 0;
    let heroVisible = true;

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    function terrainY(x, off, seed, amp, freq, base) {
      const ox = x + off + seed;
      return H * base
        + Math.sin(ox * freq)             * amp
        + Math.sin(ox * freq * 2.3 + 1)  * amp * 0.35
        + Math.sin(ox * freq * 0.47 + 2) * amp * 0.55;
    }

    const layers = [
      { seed: 0,   amp: 65,  freq: 0.007, base: 0.62, color: '#0a0a28', speed: 0.10 },
      { seed: 400, amp: 45,  freq: 0.011, base: 0.70, color: '#0f0030', speed: 0.22 },
      { seed: 800, amp: 30,  freq: 0.017, base: 0.78, color: '#001500', speed: 0.40 },
      { seed: 200, amp: 16,  freq: 0.026, base: 0.86, color: '#002200', speed: 0.65 },
    ];

    function drawLayer(layer, off) {
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 2; x += 2) {
        ctx.lineTo(x, terrainY(x, off * layer.speed, layer.seed, layer.amp, layer.freq, layer.base));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }

    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.52,
      r: Math.random() * 1.6 + 0.3,
      phase: Math.random() * Math.PI * 2
    }));

    function drawStars(ts) {
      stars.forEach(s => {
        const a = 0.45 + 0.55 * Math.sin(s.phase + ts * 0.0009);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
        ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
      });
    }

    function drawGrid() {
      const gridY = H * 0.87;
      ctx.strokeStyle = 'rgba(0,255,65,0.06)';
      ctx.lineWidth = 1;
      for (let x = (offset * 0.5 % 32); x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, gridY); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, gridY); ctx.lineTo(W, gridY);
      ctx.strokeStyle = 'rgba(0,255,65,0.10)'; ctx.stroke();
    }

    const heroObs = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) { last = performance.now(); loop(last); }
      else cancelAnimationFrame(raf);
    });
    heroObs.observe(canvas);

    let last = 0;
    function loop(ts) {
      if (!heroVisible) return;
      const dt = Math.min(ts - last, 50);
      last = ts;
      offset += dt * 0.038;

      ctx.clearRect(0, 0, W, H);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,   '#00000e');
      sky.addColorStop(0.55,'#040020');
      sky.addColorStop(1,   '#060606');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      drawStars(ts);

      for (let y = 0; y < H * 0.88; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.07)';
        ctx.fillRect(0, y, W, 2);
      }

      layers.forEach(l => drawLayer(l, offset));
      drawGrid();

      raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    loop(performance.now());
  }

  /* ══════════════════════════════════════════
     HUD — SCORE COUNTER
  ══════════════════════════════════════════ */
  function initHudScore() {
    const el = document.getElementById('hud-score-val');
    if (!el) return;
    let score = 0, target = 0;

    window.addEventListener('scroll', () => {
      const pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      target = Math.floor(pct * 9999) * 100;
    }, { passive: true });

    setInterval(() => {
      if (score < target) {
        score = Math.min(score + 400, target);
        el.textContent = String(score).padStart(6, '0');
      }
    }, 50);
  }

  /* ══════════════════════════════════════════
     HUD — COUNTDOWN TIMER
  ══════════════════════════════════════════ */
  function initHudTimer() {
    const el = document.getElementById('hud-timer');
    if (!el) return;
    let t = 300;

    setInterval(() => {
      if (--t <= 0) t = 300;
      el.textContent = t;
      const danger = t <= 30;
      el.style.color = danger
        ? (Math.floor(Date.now() / 300) % 2 ? 'var(--red)' : 'var(--yellow)')
        : '';
    }, 1000);
  }

  /* ══════════════════════════════════════════
     TYPEWRITER
  ══════════════════════════════════════════ */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = [
      'GAME DEVELOPER',
      'UNITY SPECIALIST',
      'C++ PROGRAMMER',
      'WEB3 BUILDER',
      '7 YEARS EXPERIENCE'
    ];
    let pi = 0, ci = 0, deleting = false;

    function tick() {
      const phrase = phrases[pi];
      if (deleting) {
        el.textContent = phrase.substring(0, ci--);
        if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 480); return; }
        setTimeout(tick, 55);
      } else {
        el.textContent = phrase.substring(0, ci++);
        if (ci > phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 85);
      }
    }
    tick();
  }

  /* ══════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════ */
  function initReveal() {
    const targets = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .save-slot'
    );
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    targets.forEach(t => obs.observe(t));
  }

  /* ══════════════════════════════════════════
     SKILL / XP BARS
  ══════════════════════════════════════════ */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.pct || '0%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => obs.observe(b));
  }

  /* ══════════════════════════════════════════
     STAGE FILTER
  ══════════════════════════════════════════ */
  function initFilter() {
    const btns  = document.querySelectorAll('.stage-filter-btn');
    const cards = document.querySelectorAll('.stage-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;

        cards.forEach(card => {
          const cats = (card.dataset.cat || '').split(' ');
          const show = cat === 'all' || cats.includes(cat);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     CARD DETAIL TOGGLES (Mission Briefing)
  ══════════════════════════════════════════ */
  function initCardToggles() {
    document.querySelectorAll('.win-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = btn.nextElementSibling;
        if (!list) return;
        const open = list.classList.toggle('open');
        btn.textContent = open ? '▲ HIDE BRIEFING' : '▼ MISSION BRIEFING';
      });
    });
  }

  /* ══════════════════════════════════════════
     HUD NAVBAR
  ══════════════════════════════════════════ */
  function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hud-hamburger');
    const mobile    = document.getElementById('hud-mobile-menu');
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.hud-nav-link[data-section]');

    window.addEventListener('scroll', () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === current);
      });
    }, { passive: true });

    if (hamburger && mobile) {
      hamburger.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        const span = hamburger.querySelector('span');
        if (span) span.textContent = open ? '✕ CLOSE' : '▶ MENU';
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (mobile) mobile.classList.remove('open');
        if (hamburger) {
          const span = hamburger.querySelector('span');
          if (span) span.textContent = '▶ MENU';
        }
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.getElementById('nav-logo')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════
     ACHIEVEMENT SYSTEM
  ══════════════════════════════════════════ */
  const ACHIEVEMENTS = {
    hero:       { icon: '🎮', title: 'PLAYER ONE — READY!' },
    about:      { icon: '📋', title: 'PROFILE UNLOCKED' },
    skills:     { icon: '⚡', title: 'POWER-UPS COLLECTED' },
    projects:   { icon: '🗺️', title: 'STAGE SELECT — ACCESS GRANTED' },
    experience: { icon: '📜', title: 'MISSION LOG — LOADED' },
    contact:    { icon: '📡', title: 'FINAL STAGE — REACHED' },
  };

  function initAchievements() {
    const popup   = document.getElementById('achievement-popup');
    const titleEl = document.getElementById('achievement-title');
    if (!popup || !titleEl) return;

    const seen = new Set();
    let hideTimer = null;

    function showAchievement(id) {
      if (seen.has(id)) return;
      seen.add(id);
      const ach = ACHIEVEMENTS[id];
      if (!ach) return;

      const iconEl = popup.querySelector('.ach-icon');
      if (iconEl) iconEl.textContent = ach.icon;
      titleEl.textContent = ach.title;

      clearTimeout(hideTimer);
      popup.classList.remove('show');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        popup.classList.add('show');
        hideTimer = setTimeout(() => popup.classList.remove('show'), 3500);
      }));
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) showAchievement(e.target.id);
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('section[id]').forEach(sec => obs.observe(sec));
  }

  /* ══════════════════════════════════════════
     COIN SPAWN
  ══════════════════════════════════════════ */
  function spawnCoins(originEl, count) {
    const layer = document.getElementById('coin-layer');
    if (!layer) return;

    const rect = originEl.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2 + window.scrollY;

    for (let i = 0; i < count; i++) {
      const coin  = document.createElement('div');
      coin.className = 'coin';
      coin.textContent = '★';
      const angle = Math.random() * Math.PI * 2;
      const dist  = 35 + Math.random() * 55;
      coin.style.cssText = [
        `left:${cx}px`,
        `top:${cy}px`,
        `--dx:${(Math.cos(angle) * dist).toFixed(1)}px`,
        `--dy:${(Math.sin(angle) * dist - 80).toFixed(1)}px`,
        `animation-delay:${(Math.random() * 0.12).toFixed(2)}s`
      ].join(';');
      layer.appendChild(coin);
      setTimeout(() => coin.remove(), 950);
    }
  }

  /* ══════════════════════════════════════════
     PIXEL EXPLOSION
  ══════════════════════════════════════════ */
  let explCSS = false;

  function injectExplosionCSS() {
    if (explCSS) return;
    explCSS = true;
    const s = document.createElement('style');
    s.textContent = `
      @keyframes _explode {
        to { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
      }
      .xp {
        position: fixed; width: 5px; height: 5px; border-radius: 1px;
        pointer-events: none; z-index: 8000; opacity: 1;
        animation: _explode 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(s);
  }

  function spawnExplosion(x, y) {
    injectExplosionCSS();
    const colors = ['#FF6600','#FFD700','#FF2200','#00FF41','#00DDFF','#FF00CC'];
    for (let i = 0; i < 8; i++) {
      const p   = document.createElement('div');
      p.className = 'xp';
      const ang = (i / 8) * Math.PI * 2;
      const d   = 28 + Math.random() * 28;
      p.style.cssText = [
        `left:${x}px`, `top:${y}px`,
        `background:${colors[i % colors.length]}`,
        `--dx:${(Math.cos(ang) * d).toFixed(1)}px`,
        `--dy:${(Math.sin(ang) * d).toFixed(1)}px`,
        `animation-delay:${(Math.random() * 0.04).toFixed(2)}s`
      ].join(';');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  /* ══════════════════════════════════════════
     CLICK EFFECTS — COINS + EXPLOSION
  ══════════════════════════════════════════ */
  function initClickEffects() {
    document.querySelectorAll(
      '.pixel-btn, .stage-filter-btn, .char-cv-btn, .stage-btn'
    ).forEach(btn => {
      btn.addEventListener('click', e => {
        spawnCoins(btn, 5);
        spawnExplosion(e.clientX, e.clientY);
      });
    });
  }

  /* ══════════════════════════════════════════
     SOUND TOGGLE (UI feedback — no audio files)
  ══════════════════════════════════════════ */
  function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    let on = localStorage.getItem('sound') !== 'off';
    const icon = btn.querySelector('.sound-icon');

    function update() {
      if (icon) icon.textContent = on ? '♪' : '♩';
      btn.title = on ? 'Sound ON' : 'Sound OFF';
    }

    update();
    btn.addEventListener('click', () => {
      on = !on;
      localStorage.setItem('sound', on ? 'on' : 'off');
      update();
      spawnCoins(btn, 3);
    });
  }

  /* ══════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.tf-submit');
      if (!btn) return;
      const orig = btn.textContent;

      btn.textContent = '★ TRANSMISSION SENT — MISSION COMPLETE ★';
      btn.style.background = 'var(--green)';
      btn.style.color = '#000';

      const r = btn.getBoundingClientRect();
      spawnCoins(btn, 10);
      spawnExplosion(r.left + r.width / 2, r.top + r.height / 2);

      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 3200);
    });
  }

  /* ══════════════════════════════════════════
     KEYBOARD NAVIGATION (W/S or ↑/↓)
  ══════════════════════════════════════════ */
  function initKeyboardNav() {
    const sectionIds = ['hero','about','skills','projects','experience','contact'];
    let cur = 0;

    window.addEventListener('scroll', () => {
      document.querySelectorAll('section[id]').forEach((sec, idx) => {
        if (window.scrollY >= sec.offsetTop - 200) cur = idx;
      });
    }, { passive: true });

    document.addEventListener('keydown', e => {
      const tag = document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        cur = Math.min(cur + 1, sectionIds.length - 1);
        document.getElementById(sectionIds[cur])?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        cur = Math.max(cur - 1, 0);
        document.getElementById(sectionIds[cur])?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ══════════════════════════════════════════
     PIXEL ART CURSOR
  ══════════════════════════════════════════ */
  function initPixelCursor() {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">` +
      `<rect x="0" y="0" width="4" height="12" fill="#ffffff"/>` +
      `<rect x="4" y="4" width="4" height="4" fill="#ffffff"/>` +
      `<rect x="8" y="8" width="4" height="4" fill="#ffffff"/>` +
      `<rect x="1" y="1" width="2" height="2" fill="#00DDFF"/>` +
      `</svg>`
    );
    document.body.style.cursor = `url("data:image/svg+xml,${svg}") 0 0, crosshair`;
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initHeroCanvas();
    initHudScore();
    initHudTimer();
    initTypewriter();
    initReveal();
    initSkillBars();
    initFilter();
    initCardToggles();
    initNavbar();
    initAchievements();
    initClickEffects();
    initSoundToggle();
    initContactForm();
    initKeyboardNav();
    initPixelCursor();
  });

})();
