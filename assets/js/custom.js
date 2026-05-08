/* ============================================================
   CASUAL GAME PORTFOLIO — VU HUY TRUONG
   ============================================================ */

(function () {
  'use strict';

  /* ── LOADING SCREEN ── */
  const TIPS = [
    'Loading game assets…',
    'Calibrating fun levels…',
    'Spawning achievements…',
    'Polishing pixel art…',
    'Recruiting Player 1…',
  ];

  function initLoader() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;

    if (sessionStorage.getItem('loaded')) {
      screen.style.display = 'none';
      showDailyReward();
      return;
    }

    const bar = document.getElementById('ld-bar');
    const tip = document.getElementById('ld-tip');
    if (tip) tip.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];

    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 22 + 8;
      if (pct >= 100) {
        pct = 100;
        clearInterval(iv);
        setTimeout(() => {
          screen.classList.add('fade-out');
          setTimeout(() => {
            screen.style.display = 'none';
            sessionStorage.setItem('loaded', '1');
            showDailyReward();
          }, 450);
        }, 300);
      }
      if (bar) bar.style.width = Math.min(pct, 100) + '%';
    }, 180);
  }

  /* ── DAILY REWARD ── */
  function showDailyReward() {
    if (sessionStorage.getItem('reward')) return;
    const overlay = document.getElementById('daily-reward');
    if (!overlay) return;
    overlay.classList.remove('hidden');

    document.getElementById('dr-close')?.addEventListener('click', closeDailyReward);
    document.getElementById('dr-claim')?.addEventListener('click', () => {
      addCoins(500);
      if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: .6 } });
      closeDailyReward();
    });
  }
  function closeDailyReward() {
    const el = document.getElementById('daily-reward');
    if (el) el.classList.add('hidden');
    sessionStorage.setItem('reward', '1');
  }

  /* ── COIN COUNTER ── */
  let coins = 0;
  function addCoins(amount) {
    coins += amount;
    const el = document.getElementById('coin-count');
    if (el) el.textContent = coins.toLocaleString();
  }

  function initCoinScroll() {
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      const target = Math.floor(pct * 1000);
      if (target > coins) addCoins(target - coins);
    }, { passive: true });
  }

  /* ── PARTICLES ── */
  function spawnCoins(el, count) {
    const layer = document.getElementById('particle-layer');
    if (!layer) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2 + window.scrollY;
    const EMOJIS = ['⭐','🪙','✨','💫','🎉'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'p-coin';
      p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;
      p.style.cssText = [
        `left:${cx}px`, `top:${cy}px`,
        `--dx:${(Math.cos(angle) * dist).toFixed(1)}px`,
        `--dy:${(Math.sin(angle) * dist - 80).toFixed(1)}px`,
        `animation-delay:${(Math.random() * .1).toFixed(2)}s`
      ].join(';');
      layer.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  /* ── ACHIEVEMENT POPUP ── */
  const ACHIEVEMENTS = {
    hero:       { icon: '🎮', name: 'Player One — Ready!' },
    about:      { icon: '📋', name: 'Profile Unlocked' },
    skills:     { icon: '⚡', name: 'Power-Ups Collected' },
    projects:   { icon: '🌍', name: 'Worlds Discovered' },
    experience: { icon: '🗺️', name: 'Journey Logged' },
    contact:    { icon: '📡', name: 'Final Stage Reached' },
  };

  function initAchievements() {
    const popup = document.getElementById('achievement-popup');
    const nameEl = document.getElementById('ach-name');
    const iconEl = document.getElementById('ach-icon');
    if (!popup || !nameEl) return;

    const seen = new Set();
    let timer = null;

    function show(id) {
      if (seen.has(id)) return;
      seen.add(id);
      const a = ACHIEVEMENTS[id];
      if (!a) return;
      if (iconEl) iconEl.textContent = a.icon;
      nameEl.textContent = a.name;
      clearTimeout(timer);
      popup.classList.remove('show');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        popup.classList.add('show');
        addCoins(50);
        timer = setTimeout(() => popup.classList.remove('show'), 3500);
      }));
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) show(e.target.id); });
    }, { threshold: 0.25 });
    document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
  }

  /* ── TYPEWRITER ── */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = ['GAME DEVELOPER', 'UNITY SPECIALIST', 'C++ PROGRAMMER', 'WEB3 BUILDER', '7 YRS EXPERIENCE'];
    let pi = 0, ci = 0, del = false;
    function tick() {
      const p = phrases[pi];
      if (del) {
        el.textContent = p.substring(0, ci--);
        if (ci < 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 450); return; }
        setTimeout(tick, 55);
      } else {
        el.textContent = p.substring(0, ci++);
        if (ci > p.length) { del = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 85);
      }
    }
    tick();
  }

  /* ── SCROLL REVEAL (CSS + IntersectionObserver) ── */
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .journey-item').forEach(el => obs.observe(el));
  }

  /* ── SKILL BARS ── */
  function initSkillBars() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.pct || '0%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.skill-fill, .char-attr-fill').forEach(b => obs.observe(b));
  }

  /* ── XP BAR ANIMATION ── */
  function initXpBar() {
    const fill = document.getElementById('hero-xp-fill');
    const pctEl = document.getElementById('xp-pct');
    if (!fill) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          fill.style.width = '75%';
          if (pctEl) {
            let n = 0;
            const iv = setInterval(() => {
              n = Math.min(n + 2, 75);
              pctEl.textContent = n + ' / 100 XP';
              if (n >= 75) clearInterval(iv);
            }, 25);
          }
        }, 400);
        obs.unobserve(entries[0].target);
      }
    }, { threshold: 0.5 });
    obs.observe(fill.parentElement || fill);
  }

  /* ── PROJECT FILTER ── */
  function initFilter() {
    const btns  = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.proj-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach(c => {
          const cats = (c.dataset.cat || '').split(' ');
          c.classList.toggle('hidden', f !== 'all' && !cats.includes(f));
        });
        spawnCoins(btn, 4);
      });
    });
  }

  /* ── PROJECT DETAIL TOGGLES ── */
  function initToggles() {
    document.querySelectorAll('.proj-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const det = btn.nextElementSibling;
        if (!det) return;
        const open = det.classList.toggle('open');
        btn.textContent = open ? '▲ Hide' : '▼ Details';
      });
    });
  }

  /* ── NAVBAR ── */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('nav-hamburger');
    const mobile = document.getElementById('nav-mobile');
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[data-section]');

    window.addEventListener('scroll', () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 60);
      let cur = '';
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
      links.forEach(a => a.classList.toggle('active', a.dataset.section === cur));
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
      const open = mobile?.classList.toggle('open');
      hamburger.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        mobile?.classList.remove('open');
        if (hamburger) hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
        t.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.getElementById('nav-logo')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── CONTACT FORM ── */
  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.f-submit');
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.innerHTML = '🎉 MESSAGE SENT — MISSION COMPLETE!';
      btn.style.background = 'linear-gradient(135deg, #4CC96A, #1ABC9C)';
      btn.style.boxShadow = '0 6px 0 #1A7A3A';
      if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: .55 } });
      }
      const r = btn.getBoundingClientRect();
      spawnCoins(btn, 8);
      addCoins(100);
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.boxShadow = '';
        form.reset();
      }, 3500);
    });
  }

  /* ── CLICK EFFECTS ON BUTTONS ── */
  function initClickEffects() {
    document.querySelectorAll('.gbtn, .pjbtn, .filter-pill, .char-social').forEach(btn => {
      btn.addEventListener('click', () => spawnCoins(btn, 3));
    });
  }

  /* ── GSAP ENTRANCE ANIMATIONS ── */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero stagger */
    gsap.from('.hero-online', { y: -20, opacity: 0, duration: .6, delay: .3, ease: 'back.out(2)' });
    gsap.from('.hero-title',  { y: 30,  opacity: 0, duration: .7, delay: .5, ease: 'back.out(1.5)' });
    gsap.from('.hero-subtitle, .hero-type', { y: 20, opacity: 0, duration: .6, delay: .75, stagger: .1, ease: 'power2.out' });
    gsap.from('.hero-xp',    { scaleX: 0, opacity: 0, duration: .6, delay: .9, transformOrigin: 'left', ease: 'power2.out' });
    gsap.from('.hero-stat',  { y: 16, opacity: 0, duration: .5, delay: 1.0, stagger: .08, ease: 'back.out(2)' });
    gsap.from('.hero-btns .gbtn', { y: 20, opacity: 0, duration: .5, delay: 1.15, stagger: .1, ease: 'back.out(1.8)' });
    gsap.from('.hero-card-wrap',  { x: 50,  opacity: 0, duration: .8, delay: .7, ease: 'back.out(1.4)' });
  }

  /* ── KEYBOARD NAV ── */
  function initKeyboard() {
    const ids = ['hero','about','skills','projects','experience','contact'];
    let cur = 0;
    window.addEventListener('scroll', () => {
      document.querySelectorAll('section[id]').forEach((s, i) => {
        if (window.scrollY >= s.offsetTop - 200) cur = i;
      });
    }, { passive: true });
    document.addEventListener('keydown', e => {
      const tag = document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        cur = Math.min(cur + 1, ids.length - 1);
        document.getElementById(ids[cur])?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        cur = Math.max(cur - 1, 0);
        document.getElementById(ids[cur])?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCoinScroll();
    initAchievements();
    initTypewriter();
    initReveal();
    initSkillBars();
    initXpBar();
    initFilter();
    initToggles();
    initNavbar();
    initForm();
    initClickEffects();
    initGSAP();
    initKeyboard();
  });

})();
