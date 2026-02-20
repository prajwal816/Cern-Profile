/*!
 * CERN-Inspired Interactive Animations
 * Particle collision canvas, scroll reveals, navigation, typewriter
 */
(function () {
  "use strict";

  /* ===== Navigation ===== */
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinksContainer = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");

  // Scroll state
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    updateActiveNav();
  });

  // Mobile toggle
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("open");
      navToggle.classList.toggle("active");
    });
  }

  // Smooth scroll for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      navLinksContainer.classList.remove("open");
      navToggle?.classList.remove("active");
    });
  });

  // Active nav link
  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    navLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (!section) return;
      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /* ===== Typewriter Effect ===== */
  const typedEl = document.getElementById("typedText");
  if (typedEl) {
    const strings = [
      "Engineering Student",
      "Machine Learning Research",
      "High Energy Physics Enthusiast",
      "CMS Open Data Analysis",
      "Scientific Computing",
    ];
    let strIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let speed = 60;

    function typeLoop() {
      const current = strings[strIdx];
      if (isDeleting) {
        typedEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        speed = 30;
      } else {
        typedEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        speed = 60;
      }

      if (!isDeleting && charIdx === current.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        strIdx = (strIdx + 1) % strings.length;
        speed = 400;
      }

      setTimeout(typeLoop, speed);
    }
    typeLoop();
  }

  /* ===== Scroll Reveal ===== */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  document.addEventListener("DOMContentLoaded", () => {
    const revealEls = document.querySelectorAll(
      ".research-entry, .detail-card, .interest-card, .publication-entry, " +
      ".competency-group, .timeline-entry, .contact-card, .section-header"
    );
    revealEls.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${Math.min(i % 6, 4) * 80}ms`;
      revealObserver.observe(el);
    });
  });

  /* ===== Particle Collision Canvas ===== */
  const canvas = document.getElementById("particle-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let tracks = [];
    let mouseX = 0;
    let mouseY = 0;
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Mouse parallax
    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / W - 0.5) * 2;
      mouseY = (e.clientY / H - 0.5) * 2;
    });

    // Detector ring data
    const rings = [
      { r: 120, opacity: 0.04, speed: 0.0003 },
      { r: 200, opacity: 0.03, speed: -0.0002 },
      { r: 300, opacity: 0.025, speed: 0.00015 },
      { r: 420, opacity: 0.02, speed: -0.0001 },
    ];
    let ringAngle = 0;

    // Particle class — simulates curved tracks from collision point
    class CollisionParticle {
      constructor() {
        this.reset();
      }
      reset() {
        const cx = W / 2;
        const cy = H / 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.2 + 0.3;

        this.x = cx + (Math.random() - 0.5) * 10;
        this.y = cy + (Math.random() - 0.5) * 10;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Magnetic field curvature (simulates charged particle in B-field)
        this.charge = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.008 + 0.002);
        this.life = 1.0;
        this.decay = Math.random() * 0.004 + 0.002;
        this.size = Math.random() * 1.8 + 0.4;

        // Color variation: cyan, blue, white
        const colors = [
          [0, 212, 255],   // cyan
          [0, 150, 255],   // blue
          [100, 180, 255], // light blue
          [200, 220, 255], // white-blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.trail = [];
      }
      update() {
        // Lorentz-like curvature
        const newVx = this.vx - this.vy * this.charge;
        const newVy = this.vy + this.vx * this.charge;
        this.vx = newVx;
        this.vy = newVy;

        // Parallax from mouse
        this.x += this.vx + mouseX * 0.15;
        this.y += this.vy + mouseY * 0.15;
        this.life -= this.decay;

        // Trail
        this.trail.push({ x: this.x, y: this.y, life: this.life });
        if (this.trail.length > 20) this.trail.shift();

        if (this.life <= 0) this.reset();
      }
      draw() {
        // Trail
        for (let i = 1; i < this.trail.length; i++) {
          const t = this.trail[i];
          const alpha = t.life * 0.25 * (i / this.trail.length);
          ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;
          ctx.lineWidth = this.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        }
        // Head
        const alpha = this.life * 0.7;
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        if (this.life > 0.5) {
          ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha * 0.15})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Background ambient particles
    class AmbientParticle {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = Math.random() * 1.2 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.2 + 0.05;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }
      update(t) {
        this.x += this.speedX + mouseX * 0.05;
        this.y += this.speedY + mouseY * 0.05;
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
        this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(t * this.pulseSpeed + this.pulseOffset));
      }
      draw() {
        ctx.fillStyle = `rgba(0, 180, 255, ${this.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize
    const collisionCount = Math.min(40, Math.floor((W * H) / 30000));
    const ambientCount = Math.min(50, Math.floor((W * H) / 25000));

    for (let i = 0; i < collisionCount; i++) {
      particles.push(new CollisionParticle());
    }
    const ambientParticles = [];
    for (let i = 0; i < ambientCount; i++) {
      ambientParticles.push(new AmbientParticle());
    }

    // Draw detector rings
    function drawDetectorRings(t) {
      const cx = W / 2;
      const cy = H / 2;
      ringAngle += 0.0005;

      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringAngle * ring.speed * 1000);

        // Ring
        ctx.strokeStyle = `rgba(0, 150, 255, ${ring.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tick marks on ring
        const ticks = 24;
        for (let i = 0; i < ticks; i++) {
          const a = (i / ticks) * Math.PI * 2;
          const x1 = Math.cos(a) * (ring.r - 4);
          const y1 = Math.sin(a) * (ring.r - 4);
          const x2 = Math.cos(a) * (ring.r + 4);
          const y2 = Math.sin(a) * (ring.r + 4);
          ctx.strokeStyle = `rgba(0, 150, 255, ${ring.opacity * 0.7})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Central collision point glow
      const pulseSize = 3 + Math.sin(t * 0.003) * 1.5;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 8);
      gradient.addColorStop(0, "rgba(0, 212, 255, 0.15)");
      gradient.addColorStop(0.5, "rgba(0, 150, 255, 0.05)");
      gradient.addColorStop(1, "rgba(0, 100, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize * 8, 0, Math.PI * 2);
      ctx.fill();

      // Bright center dot
      ctx.fillStyle = `rgba(0, 212, 255, ${0.4 + Math.sin(t * 0.005) * 0.2})`;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connect nearby ambient particles
    function connectAmbient() {
      for (let a = 0; a < ambientParticles.length; a++) {
        for (let b = a + 1; b < ambientParticles.length; b++) {
          const dx = ambientParticles[a].x - ambientParticles[b].x;
          const dy = ambientParticles[a].y - ambientParticles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = 0.03 * (1 - dist / 120);
            ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(ambientParticles[a].x, ambientParticles[a].y);
            ctx.lineTo(ambientParticles[b].x, ambientParticles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation loop
    let t = 0;
    function animate() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Draw detector geometry
      drawDetectorRings(t);

      // Ambient particles
      ambientParticles.forEach((p) => {
        p.update(t);
        p.draw();
      });
      connectAmbient();

      // Collision particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }
    animate();

    // Reinitialize on resize
    window.addEventListener("resize", () => {
      particles.forEach((p) => p.reset());
    });
  }

  /* ===== Data Pulse Effect on Section Separators ===== */
  function addPulseEffect() {
    const sectionLines = document.querySelectorAll(".section-line");
    sectionLines.forEach((line) => {
      line.style.position = "relative";
      line.style.overflow = "hidden";

      const pulse = document.createElement("div");
      pulse.style.cssText = `
        position: absolute;
        top: -1px;
        left: -20%;
        width: 20%;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent);
        animation: dataPulse ${3 + Math.random() * 2}s linear infinite;
        border-radius: 2px;
      `;
      line.appendChild(pulse);
    });

    // Inject keyframes
    if (!document.getElementById("pulse-keyframes")) {
      const style = document.createElement("style");
      style.id = "pulse-keyframes";
      style.textContent = `
        @keyframes dataPulse {
          0% { left: -20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  document.addEventListener("DOMContentLoaded", addPulseEffect);
})();