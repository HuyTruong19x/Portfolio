/* ============================================================
   GAMING PORTFOLIO — VU HUY TRUONG
   ============================================================ */

(function () {
  'use strict';

  /* ── LOADING SCREEN ── */
  const lines = [
    '> INITIALIZING PORTFOLIO v2.0...',
    '> LOADING ASSETS...',
    '> READING CHARACTER DATA...',
    '> BINDING GAME SYSTEMS...',
    '> READY.'
  ];

  function runBootSequence() {
    if (sessionStorage.getItem('booted')) {
      document.getElementById('loading-screen').style.display = 'none';
      return;
    }

    const bootText = document.querySelector('.boot-text');
    const bar = document.querySelector('.boot-bar-fill');
    let i = 0;

    function showLine() {
      if (i >= lines.length) {
        bar.style.width = '100%';
        setTimeout(() => {
          const loader = document.getElementById('loading-screen');
          loader.classList.add('fade-out');
          setTimeout(() => {
            loader.style.display = 'none';
            sessionStorage.setItem('booted', '1');
          }, 520);
        }, 400);
        return;
      }
      const el = document.createElement('div');
      el.className = 'boot-line';
      el.textContent = lines[i];
      bootText.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
      bar.style.width = ((i + 1) / lines.length * 90) + '%';
      i++;
      setTimeout(showLine, i === lines.length ? 200 : 260);
    }

    setTimeout(showLine, 300);
  }

  /* ── PARTICLE CANVAS ── */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.5 + 0.1;
    }

    function initP() {
      particles = [];
      const count = Math.floor((W * H) / 12000);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cyan = '0,212,255';
      const green = '0,255,136';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const col = i % 3 === 0 ? green : cyan;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${p.a})`;
        ctx.fill();
      });

      /* connections */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    initP();
    draw();
    window.addEventListener('resize', () => { resize(); initP(); });
  }

  /* ── TYPEWRITER ── */
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

    function type() {
      const phrase = phrases[pi];
      if (deleting) {
        el.textContent = phrase.substring(0, ci--);
        if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 500); return; }
        setTimeout(type, 60);
      } else {
        el.textContent = phrase.substring(0, ci++);
        if (ci > phrase.length) { deleting = true; setTimeout(type, 1800); return; }
        setTimeout(type, 90);
      }
    }
    type();
  }

  /* ── SCROLL REVEAL ── */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(t => obs.observe(t));
  }

  /* ── SKILL BARS ── */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.pct;
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(b => obs.observe(b));
  }

  /* ── PROJECT FILTER ── */
  function initFilter() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;

        cards.forEach(card => {
          if (cat === 'all' || card.dataset.cat.includes(cat)) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ── CARD DETAILS TOGGLE ── */
  function initCardToggles() {
    document.querySelectorAll('.card-details-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = btn.nextElementSibling;
        const open = list.classList.toggle('open');
        btn.textContent = open ? '▲ HIDE DETAILS' : '▼ SHOW RESPONSIBILITIES';
      });
    });
  }

  /* ── NAVBAR ── */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.nav-toggle');
    const mobile = document.querySelector('.nav-mobile');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[data-section], .nav-mobile a[data-section]');

    /* scroll state */
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) { navbar.classList.add('scrolled'); }
      else { navbar.classList.remove('scrolled'); }

      /* active link */
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === current);
      });
    }, { passive: true });

    /* hamburger */
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        mobile.classList.toggle('open');
      });
    }

    /* smooth scroll */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        mobile.classList.remove('open');
        toggle && toggle.classList.remove('open');
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    /* logo click → top */
    document.querySelector('.nav-logo')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── THEME TOGGLE ── */
  function initThemeToggle() {
    const btns = [
      document.getElementById('theme-toggle'),
      document.getElementById('theme-toggle-mobile')
    ].filter(Boolean);

    function applyTheme(isLight) {
      document.body.classList.toggle('light', isLight);
      btns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      });
    }

    /* Restore saved preference */
    const saved = localStorage.getItem('theme');
    if (saved === 'light') applyTheme(true);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isLight = !document.body.classList.contains('light');
        applyTheme(isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      });
    });
  }

  /* ── CONTACT FORM ── */
  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      btn.textContent = '✓ MESSAGE SENT';
      btn.style.background = 'var(--green)';
      setTimeout(() => {
        btn.textContent = '► SEND MESSAGE';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
    initParticles();
    initTypewriter();
    initReveal();
    initSkillBars();
    initFilter();
    initCardToggles();
    initNavbar();
    initForm();
    initThemeToggle();
  });

})();
