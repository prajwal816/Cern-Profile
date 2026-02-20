/*!
 * Main JS for Prajwal Aaryan Immadi Portfolio
 */
(function () {
  "use strict";

  /* ===== Smooth scroll for nav links ===== */
  const select = (el, all = false) =>
    all ? [...document.querySelectorAll(el)] : document.querySelector(el);

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) selectEl.forEach((e) => e.addEventListener(type, listener));
      else selectEl.addEventListener(type, listener);
    }
  };

  /* Scroll-to with offset */
  const scrollto = (el) => {
    let target = select(el);
    if (!target) return;
    let pos = target.offsetTop;
    window.scrollTo({ top: pos, behavior: "smooth" });
  };

  /* Active nav link on scroll */
  let navLinks = select(".nav-menu a", true);
  const navActiveState = () => {
    let pos = window.scrollY + 100;
    navLinks.forEach((link) => {
      if (!link.hash) return;
      let section = select(link.hash);
      if (!section) return;
      if (
        pos >= section.offsetTop &&
        pos <= section.offsetTop + section.offsetHeight
      ) {
        link.parentElement.classList.add("active");
      } else {
        link.parentElement.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navActiveState);
  window.addEventListener("scroll", navActiveState);

  /* Nav click handler */
  on("click", ".nav-menu a", function (e) {
    if (this.hash) {
      e.preventDefault();
      scrollto(this.hash);
    }
  }, true);

  /* ===== Header shrink on scroll ===== */
  const headerEl = select("#header");
  if (headerEl) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        headerEl.classList.add("header-scrolled");
      } else {
        headerEl.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    window.addEventListener("scroll", headerScrolled);
  }

  /* ===== Intersection Observer: fade-in on scroll ===== */
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.addEventListener("DOMContentLoaded", () => {
    /* Add fade-in class to all major elements */
    const fadeEls = document.querySelectorAll(
      ".icon-box, .project-card, .info-box, .section-title, .profile-image-container"
    );
    fadeEls.forEach((el) => {
      el.classList.add("fade-in");
      fadeObserver.observe(el);
    });
  });

  /* ===== Particle background ===== */
  const canvas = document.getElementById("particle-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = `rgba(100, 255, 218, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(60, Math.floor(canvas.width * canvas.height / 15000));
      particles = [];
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    initParticles();

    const connectParticles = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(100, 255, 218, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      connectParticles();
      animId = requestAnimationFrame(animate);
    };
    animate();
  }

  /* ===== VenoBox init ===== */
  if (typeof $.fn.venobox !== "undefined") {
    $(document).ready(function () {
      $(".venobox").venobox();
    });
  }
})();