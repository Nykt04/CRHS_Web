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

  const cards = carousel.querySelectorAll('.faculty-card');
  const totalCards = cards.length;
  const visibleCards = 3;
  let currentIndex = 0;
  let autoRotateInterval;

  // Create indicators
  for (let i = 0; i < Math.ceil(totalCards / visibleCards); i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    indicatorsContainer.appendChild(dot);
  }

  const updateCarousel = () => {
    // Static layout - no transform needed
    // Update indicators (disabled for static layout)
    document.querySelectorAll('.carousel-indicator').forEach((dot) => {
      dot.classList.remove('active');
    });
  };

  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
  };

  const goToSlide = (index) => {
    currentIndex = index * visibleCards;
    updateCarousel();
    resetAutoRotate();
  };

  const startAutoRotate = () => {
    // Auto-rotation disabled for static layout
  };

  const resetAutoRotate = () => {
    // Auto-rotation disabled for static layout
  };

  prevBtn?.addEventListener('click', () => {
    // Carousel navigation disabled for static layout
  });

  nextBtn?.addEventListener('click', () => {
    // Carousel navigation disabled for static layout
  });

  carousel.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
  carousel.addEventListener('mouseleave', startAutoRotate);

  // Static layout - no auto-rotation
  updateCarousel();
};

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}
