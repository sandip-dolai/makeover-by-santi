/* ─────────────────────────────────────────────────
   script.js — Santi's Makeover & Beauty Salon
   ───────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── 1. HERO IMAGE — eager load with skeleton ── */
  const heroImg     = document.getElementById('hero-img');
  const heroSkeleton = document.getElementById('hero-skeleton');

  if (heroImg) {
    // Set src now (eager) — show skeleton until loaded
    heroImg.src = heroImg.dataset.src;

    function onHeroLoad() {
      heroImg.classList.add('loaded');
      if (heroSkeleton) heroSkeleton.classList.add('hidden');
    }

    if (heroImg.complete && heroImg.naturalWidth > 0) {
      onHeroLoad();
    } else {
      heroImg.addEventListener('load', onHeroLoad, { once: true });
      heroImg.addEventListener('error', function () {
        if (heroSkeleton) heroSkeleton.classList.add('hidden');
      }, { once: true });
    }
  }

  /* ── 2. LAZY IMAGES (IntersectionObserver) ──── */
  const lazyImgs = document.querySelectorAll('img.lazy-img');

  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        img.src = img.dataset.src;

        img.addEventListener('load', function () {
          img.classList.add('loaded');
          // Hide sibling skeleton if present
          const skeleton = img.previousElementSibling;
          if (skeleton && skeleton.classList.contains('img-skeleton')) {
            skeleton.classList.add('hidden');
          }
          // Also check parent for skeleton (about section)
          const parentSkeleton = img.parentElement &&
            img.parentElement.querySelector('.img-skeleton');
          if (parentSkeleton) parentSkeleton.classList.add('hidden');
        }, { once: true });

        img.addEventListener('error', function () {
          const skeleton = img.previousElementSibling;
          if (skeleton && skeleton.classList.contains('img-skeleton')) {
            skeleton.classList.add('hidden');
          }
        }, { once: true });

        lazyObserver.unobserve(img);
      });
    }, { rootMargin: '200px 0px' }); // Start loading 200px before visible

    lazyImgs.forEach(function (img) {
      lazyObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    lazyImgs.forEach(function (img) {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }

  /* ── 3. NAVBAR — solid by default, hero-transparent only at very top ── */
  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('home');
  let lastScroll = 0;

  function updateNavbar() {
    const scrollY = window.scrollY;
    const heroBottom = heroSection ? heroSection.offsetHeight : 0;

    if (scrollY < 40) {
      // At very top of page — transparent over hero
      navbar.classList.add('at-hero');
      navbar.classList.remove('scrolled-down');
    } else {
      // Scrolled — always solid
      navbar.classList.remove('at-hero');
      if (scrollY > lastScroll && scrollY > 80) {
        navbar.classList.add('scrolled-down');
      } else {
        navbar.classList.remove('scrolled-down');
      }
    }
    lastScroll = scrollY;
  }

  // Run once on load
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  /* ── 4. BACK TO TOP ─────────────────────────── */
  const btt = document.getElementById('btt');
  window.addEventListener('scroll', function () {
    if (btt) btt.classList.toggle('show', window.scrollY > 420);
  }, { passive: true });

  /* ── 5. MOBILE MENU ─────────────────────────── */
  const hamburger       = document.getElementById('hamburger');
  const mobileNav       = document.getElementById('mobile-nav');
  const mobileNavClose  = document.getElementById('mobile-nav-close');
  const backdrop        = document.getElementById('mobile-nav-backdrop');

  function openMenu() {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    mobileNav.removeAttribute('aria-hidden');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', function () {
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Expose closeMenu for inline onclick attributes
  window.closeMenu = closeMenu;

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });

  /* ── 6. SMOOTH SCROLL ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth <= 768 ? 64 : 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
      closeMenu();
    });
  });

  /* ── 7. ACTIVE NAV LINK ─────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ── 8. SCROLL REVEAL ───────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.10 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ── 9. WHATSAPP FORM ───────────────────────── */
  window.sendWhatsApp = function () {
    const name    = (document.getElementById('cf-name')?.value    || '').trim();
    const phone   = (document.getElementById('cf-phone')?.value   || '').trim();
    const service = (document.getElementById('cf-service')?.value || '').trim();
    const msg     = (document.getElementById('cf-msg')?.value     || '').trim();

    const text = [
      'Hello! I\'m ' + (name || 'a potential client') + '.',
      'Phone: ' + (phone || 'N/A'),
      'Interested in: ' + (service || 'General inquiry'),
      msg ? 'Message: ' + msg : ''
    ].filter(Boolean).join('\n');

    window.open('https://wa.me/919002717291?text=' + encodeURIComponent(text), '_blank');
  };

})();
