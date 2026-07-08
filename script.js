const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader?.classList.add('hidden'), 400);
});

// Restore dark mode preference from localStorage
const initTheme = () => {
  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) {
    document.body.classList.add('dark');
    const themeIcon = document.getElementById('themeToggle')?.querySelector('i');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
  }
};
initTheme();

const menuToggle = document.querySelector('.menu-trigger');
const navMenu = document.querySelector('.nav-menu');

const setActiveLink = () => {
  const path = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-menu a, .nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === path || (path === 'index.html' && href === 'home.html'));
  });
};
setActiveLink();

menuToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = navMenu?.classList.toggle('show');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-dropdown')) {
    navMenu?.classList.remove('show');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});

document.querySelectorAll('.nav-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('show');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('i');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

const counters = () => {
  document.querySelectorAll('.number').forEach((element) => {
    const target = Number(element.dataset.target || 0);
    const duration = 1400;
    const startTime = performance.now();
    const step = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      element.textContent = Math.floor(progress * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.querySelector('.number')) counters();
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const heroContent = document.querySelectorAll('.hero h1, .hero p, .hero .hero-actions, .hero .hero-stats');
heroContent.forEach((element, index) => {
  element.classList.add('hero-animate');
  setTimeout(() => element.classList.add('is-visible'), 140 + index * 110);
});

const heroCard = document.querySelector('.hero-card');
const heroBadge = document.querySelector('.hero-badge');
const heroChips = document.querySelectorAll('.hero .chip');

heroChips.forEach((chip, index) => {
  setTimeout(() => chip.classList.add('is-animated'), 360 + index * 140);
});

if (heroCard) {
  heroCard.addEventListener('mousemove', (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroCard.style.setProperty('--rotate-y', `${x * 7}deg`);
    heroCard.style.setProperty('--rotate-x', `${y * -7}deg`);
    heroCard.classList.add('is-tilt');
  });

  heroCard.addEventListener('mouseleave', () => {
    heroCard.classList.remove('is-tilt');
    heroCard.style.setProperty('--rotate-y', '0deg');
    heroCard.style.setProperty('--rotate-x', '0deg');
  });
}

if (heroBadge) {
  heroBadge.classList.add('is-float');
}

// Faculty Carousel
const initCarousel = () => {
  const carousel = document.getElementById('facultyCarousel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorsContainer = document.getElementById('carouselIndicators');

  if (!carousel) return;

  const wrapper = carousel.closest('.carousel-wrapper');
  const originalCards = Array.from(carousel.querySelectorAll('.faculty-card'));
  let carouselCards = [];
  let currentIndex = 0;
  let visibleCards = 1;
  let clones = 0;
  let resizeTimeout;

  const clearCarousel = () => {
    carousel.innerHTML = '';
  };

  const buildCarousel = () => {
    clearCarousel();
    // measure card width using a temporary off-DOM clone if needed
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.pointerEvents = 'none';
    temp.appendChild(originalCards[0].cloneNode(true));
    document.body.appendChild(temp);
    const cardW = temp.firstElementChild.getBoundingClientRect().width || 250;
    document.body.removeChild(temp);

    visibleCards = Math.max(1, Math.floor(wrapper.clientWidth / (cardW + 16))); // include gap estimate
    clones = visibleCards; // number of clones on each side

    // create clones before (last N), originals, clones after (first N)
    const before = originalCards.slice(-clones).map(n => n.cloneNode(true));
    const after = originalCards.slice(0, clones).map(n => n.cloneNode(true));

    before.forEach(n => carousel.appendChild(n));
    originalCards.forEach(n => carousel.appendChild(n));
    after.forEach(n => carousel.appendChild(n));

    carouselCards = Array.from(carousel.querySelectorAll('.faculty-card'));

    // set initial index so the first real card is centered
    currentIndex = clones;
    createIndicators();
    // position without animation
    carousel.style.transition = 'none';
    const off = getOffsetForIndex(currentIndex);
    carousel.style.transform = `translateX(-${off}px)`;
    // force reflow then restore transition
    // eslint-disable-next-line no-unused-expressions
    carousel.getBoundingClientRect();
    carousel.style.transition = '';
    // attach touch/tap handlers after building DOM
    setupTouchAndTap();
  };

  // Touch / swipe and tap support for mobile
  const setupTouchAndTap = () => {
    let startX = 0;
    let startY = 0;
    let isDown = false;
    let moved = false;
    const threshold = 40; // px to trigger swipe

    const onStart = (e) => {
      isDown = true;
      moved = false;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
    };

    const onMove = (e) => {
      if (!isDown) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
      }
    };

    const onEnd = (e) => {
      if (!isDown) return;
      isDown = false;
      const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : (e.clientX || startX);
      const dx = endX - startX;
      if (Math.abs(dx) > threshold) {
        if (dx > 0) prevSlide(); else nextSlide();
      }
    };

    // pointer events fallback
    wrapper.addEventListener('touchstart', onStart, { passive: true });
    wrapper.addEventListener('touchmove', onMove, { passive: true });
    wrapper.addEventListener('touchend', onEnd);
    wrapper.addEventListener('pointerdown', onStart);
    wrapper.addEventListener('pointermove', onMove);
    wrapper.addEventListener('pointerup', onEnd);

    // tap to toggle overlay on touch devices
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      carouselCards.forEach((card) => {
        card.addEventListener('click', (ev) => {
          // if user was swiping, ignore the click
          if (moved) { moved = false; return; }
          card.classList.toggle('overlay-visible');
        });
      });
    }
  };

  const getOffsetForIndex = (index) => {
    const card = carouselCards[index];
    if (!card) return 0;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const wrapperCenter = wrapper.clientWidth / 2;
    return Math.max(0, cardCenter - wrapperCenter);
  };

  const createIndicators = () => {
    indicatorsContainer.innerHTML = '';
    const pages = Math.ceil(originalCards.length / visibleCards);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i * visibleCards));
      indicatorsContainer.appendChild(dot);
    }
  };

  const updateIndicators = () => {
    const pages = Math.ceil(originalCards.length / visibleCards);
    const logicalIndex = (currentIndex - clones + originalCards.length) % originalCards.length;
    const pageIndex = Math.floor(logicalIndex / visibleCards) % pages;
    document.querySelectorAll('.carousel-indicator').forEach((dot, i) => {
      dot.classList.toggle('active', i === pageIndex);
    });
  };

  const scrollToIndex = (animate = true) => {
    if (!carouselCards.length) return;
    if (!animate) carousel.style.transition = 'none';
    const off = getOffsetForIndex(currentIndex);
    carousel.style.transform = `translateX(-${off}px)`;
    if (!animate) {
      // force reflow then restore
      // eslint-disable-next-line no-unused-expressions
      carousel.getBoundingClientRect();
      carousel.style.transition = '';
    }
    updateIndicators();
    // update center class on cards
    updateCenterClasses();
  };

  const nextSlide = () => {
    currentIndex += 1;
    scrollToIndex(true);
  };

  const prevSlide = () => {
    currentIndex -= 1;
    scrollToIndex(true);
  };

  const goToSlide = (logicalIndex) => {
    // logicalIndex is index within originals
    currentIndex = clones + logicalIndex;
    scrollToIndex(true);
  };

  const handleTransitionEnd = () => {
    const originals = originalCards.length;
    // if we've moved into clones after the originals
    if (currentIndex >= clones + originals) {
      const overshoot = currentIndex - (clones + originals);
      currentIndex = clones + overshoot;
      scrollToIndex(false);
    }
    // if we've moved into clones before the originals
    if (currentIndex < clones) {
      const undershoot = (currentIndex - clones + originals) % originals;
      currentIndex = clones + undershoot;
      scrollToIndex(false);
    }
    // ensure center class is correct after any snapping
    updateCenterClasses();
  };

  const updateCenterClasses = () => {
    if (!carouselCards || !carouselCards.length) return;
    carouselCards.forEach((card, i) => {
      if (i === currentIndex) {
        card.classList.add('center');
      } else {
        card.classList.remove('center');
      }
    });
  };

  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);
  carousel.addEventListener('transitionend', handleTransitionEnd);

  const rebuild = () => {
    buildCarousel();
  };

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => rebuild(), 150);
  });

  // initialize
  buildCarousel();
};

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}
