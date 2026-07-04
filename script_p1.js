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

  // ── DUPLICATE ECA PILL TRACKS FOR SEAMLESS MARQUEE LOOP ──
  ['ecaOrgTrack', 'ecaVolTrack'].forEach(id => {
    const track = document.getElementById(id);
    if (track) track.innerHTML += track.innerHTML;
  });

  // ── PERSONAL DEVELOPMENT / COMPUTER SKILLS: CONTINUOUS AUTO-SCROLL CAROUSEL (like country marquee) + ARROWS ──
  // অটো-স্ক্রল কখনোই থামে না, শুধু কার্ডে হোভার করলে থামে — সরিয়ে ফেললে আবার চলে।
  // scrollLeft শুধু পূর্ণ পিক্সেলে কাজ করে বলে ধীর গতিতে সামান্য কাঁপুনি দিত;
  // এখন transform: translateX() ব্যবহার করা হচ্ছে (দেশের marquee-র মতোই) — sub-pixel ও GPU-smooth।
  const trainingCarousels = {};
  function setupAutoTrainingCarousel(trackId, speed) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const wrap = track.parentElement;
    // duplicate once for a seamless infinite loop (numbers repeat: 1,2,3,4,1,2,3,4…)
    if (!track.dataset.duplicated) {
      track.innerHTML += track.innerHTML;
      track.dataset.duplicated = 'true';
    }
    let pos = 0;
    let extra = 0; // arrow-click থেকে আসা এক্সট্রা মুভমেন্ট, ধীরে ধীরে যোগ হয়ে যায়
    let paused = false; // কার্ডের উপর হোভার করলে true হবে
    let lastTime = null;
    // speed = px প্রতি ~16.67ms (60fps বেসলাইন); dt দিয়ে normalize করলে 60Hz/90Hz/120Hz
    // সব স্ক্রিনেই একই গতি ও মসৃণতা বজায় থাকে (frame-rate independent)
    function frame(now) {
      if (lastTime === null) lastTime = now;
      const dt = Math.min(now - lastTime, 100); // ট্যাব ইনঅ্যাক্টিভ থাকলে বড় jump আটকাতে cap
      lastTime = now;
      const dtFactor = dt / 16.6667;
      const half = track.scrollWidth / 2;
      if (extra !== 0) {
        const easeFactor = 1 - Math.pow(1 - 0.18, dtFactor); // frame-rate independent easing
        const step = extra * easeFactor;
        pos += step;
        extra -= step;
        if (Math.abs(extra) < 0.5) extra = 0;
      }
      if (!paused) {
        pos += speed * dtFactor; // অটো-স্ক্রল, হোভার করলে থেমে যাবে
      }
      if (pos >= half) pos -= half;
      if (pos < 0) pos += half;
      track.style.transform = `translateX(${-pos}px)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // কার্ডের উপর হোভার করলে অটো-স্ক্রল থামবে, সরিয়ে ফেললে আবার চলবে
    track.querySelectorAll('.training-card').forEach(card => {
      card.addEventListener('mouseenter', () => { paused = true; });
      card.addEventListener('mouseleave', () => { paused = false; });
    });
    trainingCarousels[trackId] = {
      scrollBy(direction) {
        const card = track.querySelector('.training-card');
        const gap = 20;
        const step = card ? card.offsetWidth + gap : 320;
        extra += direction * step; // অটো-স্ক্রল চালু থেকেই এক্সট্রা মুভমেন্ট যোগ হয়, pause হয় না
      }
    };
  }
  setupAutoTrainingCarousel('personalDevTrack', 0.45);
  setupAutoTrainingCarousel('computerSkillsTrack', 0.45);

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
