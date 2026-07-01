  // ── CERTIFICATE LIGHTBOX DATA & LOGIC ──
  const certImages = {
    'cert-sabre': 'cert-sabre.jpg',
    'cert-nsda-l2': 'cert-nsda-l2.jpg',
    'cert-visa-processing': 'cert-visa-processing.jpg',
    'cert-hb-ticketing': 'cert-hb-ticketing.jpg',
    'cert-aviation': 'cert-aviation.jpg',
    'cert-ba': 'cert-ba.jpg',
    'cert-hsc': 'cert-hsc.jpg',
    'cert-ssc': 'cert-ssc.jpg',
    'cert-ai-career': 'cert-ai-career.jpg',
    'cert-tesol': 'cert-tesol.jpg',
    'cert-quantum-method': 'cert-quantum-method.jpg',
    'cert-career-summit': 'cert-career-summit.jpg',
    'cert-volunteer-career-summit': 'cert-volunteer-career-summit.jpg',
    'cert-seller-sales': 'cert-seller-sales.jpg',
    'cert-spoken-english': 'cert-spoken-english.jpg',
    'cert-tesol-phonics': 'cert-tesol-phonics.jpg',
    'cert-video-editing': 'cert-video-editing.jpg',
    'cert-workplace-comm': 'cert-workplace-comm.jpg',
    'cert-digital-marketing': 'cert-digital-marketing.jpg',
    'cert-graphics-design': 'cert-graphics-design.jpg',
    'cert-computer-basic': 'cert-computer-basic.jpg',
    'cert-computer-merit': 'cert-computer-merit.jpg'
  };
  function openCertLightbox(title, key) {
    const src = certImages[key];
    if (!src) return;
    document.getElementById('certLightboxTitle').textContent = title;
    const img = document.getElementById('certLightboxImg');
    img.src = '';
    const lb = document.getElementById('certLightbox');
    lb.classList.remove('closing');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    // slight delay so animation resets cleanly
    requestAnimationFrame(() => { img.src = src; });
  }
  function closeCertLightbox() {
    const lb = document.getElementById('certLightbox');
    lb.classList.add('closing');
    setTimeout(() => {
      lb.classList.remove('active', 'closing');
      document.body.style.overflow = '';
    }, 220);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertLightbox();
  });

  // ── REFERENCE LIGHTBOX LOGIC ──
  function openRefLightbox() {
    document.getElementById('refLightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeRefLightbox() {
    document.getElementById('refLightbox').classList.remove('active');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRefLightbox();
  });

  // ── SCROLL PROGRESS BAR ──
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // ── BACK TO TOP BUTTON ──
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 480);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── SCROLL REVEAL ANIMATIONS ──
  const revealTargets = document.querySelectorAll('.reveal, .reveal-scale, .skill-row');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  // ── DUPLICATE COUNTRY TRACK FOR SEAMLESS MARQUEE LOOP ──
  const countryTrack = document.getElementById('countryTrack');
  if (countryTrack) {
    countryTrack.innerHTML += countryTrack.innerHTML;
  }

  // ── PERSONAL DEVELOPMENT / COMPUTER SKILLS: CARD-BY-CARD AUTO-ADVANCE CAROUSEL + ARROWS ──
  // প্রতিটা ধাপে ঠিক একটা সম্পূর্ণ card সরে যায় — কোনো card কখনো অর্ধেক-কাটা দেখা যায় না।
  // hover করলে থামে, সরিয়ে ফেললে আবার চলতে থাকে।
  const trainingCarousels = {};
  function setupAutoTrainingCarousel(trackId, intervalMs) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const wrap = track.parentElement;
    // duplicate once for a seamless infinite loop (numbers repeat: 1,2,3,4,1,2,3,4…)
    if (!track.dataset.duplicated) {
      track.innerHTML += track.innerHTML;
      track.dataset.duplicated = 'true';
    }
    const gap = 20;
    let cardStep = 320;
    let pos = 0;
    let paused = false;
    let animId = null;
    let autoTimer = null;

    function computeStep() {
      const card = track.querySelector('.training-card');
      cardStep = card ? card.offsetWidth + gap : 320;
    }
    function applyScroll() {
      const half = track.scrollWidth / 2;
      if (pos >= half) pos -= half;
      if (pos < 0) pos += half;
      wrap.scrollLeft = pos;
    }
    // pos-কে ঠিক এক card-সমান দূরত্ব মসৃণভাবে সরিয়ে নতুন card-এর শুরুতে align করে
    function animateStep(direction) {
      if (animId) cancelAnimationFrame(animId);
      computeStep();
      const start = pos;
      const distance = cardStep * direction;
      const target = start + distance;
      const duration = 650;
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        pos = start + distance * eased;
        applyScroll();
        if (t < 1) {
          animId = requestAnimationFrame(tick);
        } else {
          pos = target;
          applyScroll();
          animId = null;
        }
      }
      animId = requestAnimationFrame(tick);
    }
    function scheduleAuto() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        if (!paused) animateStep(1);
        scheduleAuto();
      }, intervalMs);
    }
    requestAnimationFrame(() => { computeStep(); applyScroll(); scheduleAuto(); });
    // কার্ডের উপর হোভার করলে অটো-অ্যাডভান্স থামবে, সরিয়ে ফেললে আবার চলবে
    track.querySelectorAll('.training-card').forEach(card => {
      card.addEventListener('mouseenter', () => { paused = true; });
      card.addEventListener('mouseleave', () => { paused = false; });
    });
    trainingCarousels[trackId] = {
      scrollBy(direction) {
        clearTimeout(autoTimer);
        animateStep(direction);
        scheduleAuto();
      }
    };
  }
  setupAutoTrainingCarousel('personalDevTrack', 3200);
  setupAutoTrainingCarousel('computerSkillsTrack', 3200);

  function scrollTrainingTrack(trackId, direction) {
    const carousel = trainingCarousels[trackId];
    if (carousel) carousel.scrollBy(direction);
  }
  window.scrollTrainingTrack = scrollTrainingTrack;

  // ── SALARY COUNT-UP ANIMATION ──
  const salaryCounter = document.getElementById('salaryCounter');
  if (salaryCounter) {
    const targetValue = 25000;
    let hasCounted = false;
    const salaryObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          const duration = 1400;
          const startTime = performance.now();
          function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * targetValue);
            salaryCounter.textContent = current.toLocaleString('en-US');
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              salaryCounter.textContent = targetValue.toLocaleString('en-US');
            }
          }
          requestAnimationFrame(tick);
          salaryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    salaryObserver.observe(salaryCounter.closest('.salary-card'));
  }

  // ── CURSOR-FOLLOWING AMBIENT GLOW (desktop only) ──
  const cursorGlow = document.getElementById('cursorGlow');
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursorGlow && isFinePointer) {
    let glowX = window.innerWidth / 2, glowY = window.innerHeight / 2;
    let targetX = glowX, targetY = glowY;
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });
    function animateGlow() {
      glowX += (targetX - glowX) * 0.08;
      glowY += (targetY - glowY) * 0.08;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ── HERO PHOTO 3D PARALLAX TILT (follows cursor, desktop only) ──
  const heroPhotoWrap = document.querySelector('.hero-photo-wrap');
  if (heroPhotoWrap && isFinePointer) {
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = relX * 14;
      const rotateX = -relY * 14;
      heroPhotoWrap.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroPhotoWrap.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // ── SUBTLE CARD TILT ON MOUSEMOVE (cards with .tilt-3d) ──
  if (isFinePointer) {
    document.querySelectorAll('.core-card, .pref-card, .about-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tiltX', `${(-relY * 6).toFixed(2)}deg`);
        card.style.setProperty('--tiltY', `${(relX * 6).toFixed(2)}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tiltX', '0deg');
        card.style.setProperty('--tiltY', '0deg');
      });
    });
  }
