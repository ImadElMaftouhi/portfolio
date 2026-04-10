// ===== Scroll Progress Bar =====
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

// ===== Text Scramble Effect =====
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#$%&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.queue = [];
    this.frame = 0;
    this.frameRequest = null;
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40) + 15;
      this.queue.push({ from, to, start, end, char: null });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve && this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Run scramble on the hero name after initial fade-in
const scrambleEl = document.querySelector('[data-scramble]');
if (scrambleEl) {
  const finalText = scrambleEl.dataset.scramble;
  // Start empty-ish so the scramble has something to reveal
  scrambleEl.innerText = ' '.repeat(finalText.length);
  const scrambler = new TextScramble(scrambleEl);
  // Give the fadeUp animation a moment, then scramble in
  setTimeout(() => scrambler.setText(finalText), 600);
}

// ===== Custom Cursor =====
const cursor = document.getElementById('cursor');
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (supportsHover && cursor) {
  document.body.classList.add('has-custom-cursor');

  let cursorX = 0, cursorY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    // Dot follows instantly
    cursor.querySelector('.cursor__dot').style.transform =
      `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  });

  // Ring lags behind slightly for a smooth trailing feel
  function updateRing() {
    ringX += (cursorX - ringX) * 0.18;
    ringY += (cursorY - ringY) * 0.18;
    cursor.querySelector('.cursor__ring').style.transform =
      `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Hover state on interactive elements
  const hoverables = 'a, button, .project-card, .skill-group, .contact-card, .about__card, [role="button"]';
  document.querySelectorAll(hoverables).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('is-click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-click'));

  // Hide when leaving viewport
  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
}

// ===== 3D Tilt for Project Cards =====
if (supportsHover) {
  const MAX_TILT = 10; // degrees
  const tiltCards = document.querySelectorAll('.project-card');

  tiltCards.forEach(card => {
    let rect = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
      card.classList.add('is-tilting');
    });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;   // 0 to 1
      const py = y / rect.height;  // 0 to 1

      const rotateY = (px - 0.5) * MAX_TILT * 2;
      const rotateX = -(py - 0.5) * MAX_TILT * 2;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

      // Glare follows the cursor
      card.style.setProperty('--glare-x', `${px * 100}%`);
      card.style.setProperty('--glare-y', `${py * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilting');
      card.style.transform = '';
      rect = null;
    });
  });
}

// ===== Navigation =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Scroll state
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  nav.classList.toggle('nav--scrolled', scrollY > 50);
  lastScroll = scrollY;
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Active section highlight
const sections = document.querySelectorAll('section[id]');
const navItems = navLinks.querySelectorAll('a');

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navItems.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}
window.addEventListener('scroll', highlightNav);

// ===== Scroll Reveal =====
const animElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

animElements.forEach(el => observer.observe(el));

// ===== Project Filters =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    projectCards.forEach(card => {
      const category = card.dataset.category;
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===== Particle Canvas (Hero Background) =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

// Cursor tracking (in canvas-local coords)
const pointer = { x: -1000, y: -1000, active: false };
const POINTER_RADIUS = 160;        // influence radius
const POINTER_FORCE = 1.4;         // repulsion strength
const CONNECT_RADIUS = 150;        // base connection distance
const POINTER_CONNECT_BOOST = 90;  // extra connection distance near cursor

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Track pointer relative to the hero canvas
const heroEl = document.getElementById('hero');
heroEl.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = e.clientX - rect.left;
  pointer.y = e.clientY - rect.top;
  pointer.active = true;
});
heroEl.addEventListener('mouseleave', () => {
  pointer.active = false;
  pointer.x = -1000;
  pointer.y = -1000;
});
// Touch support
heroEl.addEventListener('touchmove', (e) => {
  if (e.touches.length === 0) return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = e.touches[0].clientX - rect.left;
  pointer.y = e.touches[0].clientY - rect.top;
  pointer.active = true;
}, { passive: true });
heroEl.addEventListener('touchend', () => { pointer.active = false; });

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.baseSize = Math.random() * 2 + 0.5;
    this.size = this.baseSize;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    // Cursor repulsion
    if (pointer.active) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < POINTER_RADIUS && dist > 0.1) {
        const force = (1 - dist / POINTER_RADIUS) * POINTER_FORCE;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
        // Grow and brighten when near cursor
        this.size = this.baseSize + (1 - dist / POINTER_RADIUS) * 2;
      } else {
        this.size += (this.baseSize - this.size) * 0.1;
      }
    } else {
      this.size += (this.baseSize - this.size) * 0.1;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

    // Clamp to canvas bounds
    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(108, 99, 255, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    // How close is p1 to the cursor? Boosts its connection radius + tints toward teal
    let p1Boost = 0;
    if (pointer.active) {
      const pdx = p1.x - pointer.x;
      const pdy = p1.y - pointer.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < POINTER_RADIUS) {
        p1Boost = (1 - pdist / POINTER_RADIUS) * POINTER_CONNECT_BOOST;
      }
    }

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = CONNECT_RADIUS + p1Boost;

      if (dist < maxDist) {
        const t = 1 - dist / maxDist;
        const tealMix = p1Boost / POINTER_CONNECT_BOOST;
        const opacity = t * (0.15 + tealMix * 0.35);
        // Blend purple -> teal based on proximity to cursor
        const r = Math.round(108 * (1 - tealMix) + 0 * tealMix);
        const g = Math.round(99 * (1 - tealMix) + 212 * tealMix);
        const b = Math.round(255 * (1 - tealMix) + 170 * tealMix);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 0.5 + tealMix * 0.6;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  drawConnections();
  animationId = requestAnimationFrame(animate);
}

initParticles();
animate();

// Pause animation when hero not visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!animationId) animate();
    } else {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
}, { threshold: 0 });

heroObserver.observe(heroEl);
