/**
 * script.js
 * Controls theme toggling, scroll progress, reveal animations, and the contact form.
 */

console.log('portfolio.js loaded');

const root = document.documentElement;
const body = document.body;
const themeToggleButton = document.querySelector(".theme-toggle");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const backToTopBtn = document.querySelector(".back-to-top");
const scrollProgress = document.querySelector(".scroll-progress");
const revealElements = document.querySelectorAll(".reveal-on-scroll");
const footerYear = document.getElementById("footer-year");

function setNavOpen(isOpen) {
  if (!nav || !navToggle) return;
  nav.classList.toggle("nav--open", isOpen);
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeNav() {
  setNavOpen(false);
}

function toggleNav() {
  const isOpen = nav && nav.classList.contains("nav--open");
  setNavOpen(!isOpen);
}

if (navToggle) {
  navToggle.addEventListener("click", toggleNav);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
}

/* -------------------------------------------------------------------------- */
/* Theme switching ---------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
const THEME_KEY = "studio-palette-theme";
const Theme = {
  AUTO: "theme-auto",
  DARK: "theme-dark",
  LIGHT: "theme-light",
};

function readPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === Theme.DARK || stored === Theme.LIGHT) {
    return stored;
  }
  return Theme.AUTO;
}

function applyTheme(themeSetting) {
  body.classList.remove(Theme.DARK, Theme.LIGHT, Theme.AUTO);
  body.classList.add(themeSetting);

  const isDark =
    themeSetting === Theme.DARK ||
    (themeSetting === Theme.AUTO &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  themeToggleButton.setAttribute(
    "aria-label",
    `Toggle theme — currently ${isDark ? "dark" : "light"}`
  );
  themeToggleButton.querySelector(".theme-toggle__icon").textContent = isDark
    ? "☀"
    : "☾";
}

function initTheme() {
  const theme = readPreferredTheme();
  applyTheme(theme);
}

function toggleTheme() {
  const current = readPreferredTheme();

  const next = current === Theme.DARK ? Theme.LIGHT : Theme.DARK;
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

themeToggleButton.addEventListener("click", toggleTheme);
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (!stored || stored === Theme.AUTO) {
      applyTheme(Theme.AUTO);
    }
  });

initTheme();

/* -------------------------------------------------------------------------- */
/* Smooth scroll for internal links ---------------------------------------- */
/* -------------------------------------------------------------------------- */
const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href").slice(1);
    const targetEl = document.getElementById(targetId);

    if (!targetEl) return;

    event.preventDefault();

    const headerHeight =
      document.querySelector(".topbar")?.offsetHeight ?? 88;
    const targetTop =
      targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    closeNav();
  });
});

/* -------------------------------------------------------------------------- */
/* Scroll progress indicator + back-to-top ---------------------------------- */
/* -------------------------------------------------------------------------- */
function updateScrollProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;

  const showThreshold = 520;
  if (scrollTop > showThreshold) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
}

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", updateScrollProgress);
updateScrollProgress();

/* -------------------------------------------------------------------------- */
/* Reveal-on-scroll animations --------------------------------------------- */
/* -------------------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -120px 0px", threshold: 0.12 }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* -------------------------------------------------------------------------- */
/* Dynamic content loading -------------------------------------------------- */
/* -------------------------------------------------------------------------- */

// Load videos
async function loadVideos() {
  try {
    const response = await fetch('portfolio_videos/videos.json');
    const videos = await response.json();
    const grid = document.getElementById('videos-grid');
    grid.innerHTML = '';
    videos.forEach(video => {
      const isFeaturedVideo = String(video.filename || '').toLowerCase() === 'myvideo.mp4';
      const article = document.createElement('article');
      article.className = 'video-card revealed';
      article.innerHTML = `
        <div class="video-card__thumb">
          <video preload="metadata" ${isFeaturedVideo ? 'controls' : ''}>
            <source src="portfolio_videos/${video.filename}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="video-card__body">
          <h3 class="video-card__title">${video.title}</h3>
          <p class="video-card__text">${video.description || 'No description available.'}</p>
        </div>
      `;
      const vid = article.querySelector('video');
      if (vid) {
        vid.style.cursor = 'pointer';
        if (isFeaturedVideo) {
          vid.addEventListener('play', () => article.classList.add('video-card--expanded'));
          vid.addEventListener('pause', () => article.classList.remove('video-card--expanded'));
          vid.addEventListener('ended', () => article.classList.remove('video-card--expanded'));
        } else {
          vid.addEventListener('click', () => vid.paused ? vid.play() : vid.pause());
        }
      }
      grid.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading videos:', error);
    const grid = document.getElementById('videos-grid');
    if (grid) {
      grid.innerHTML = '<p class="placeholder-message">Unable to load videos (check console errors).</p>';
    }
  }
}

// Load images
async function loadImages() {
  try {
    const response = await fetch('portfolio_images/images.json');
    const images = await response.json();
    const grid = document.getElementById('digital-art-grid');
    grid.innerHTML = '';
    images.forEach(image => {
      const article = document.createElement('article');
      article.className = 'card revealed';
      const isVideo = /\.(mp4|MP4|webm|mov|MOV|m4v|M4V)$/i.test(image.filename);

      let mediaHtml = '';
      if (isVideo) {
        const posterAttr = image.thumbnail ? `poster="portfolio_images/${image.thumbnail}"` : '';
        mediaHtml = `
          <div class="card__image">
            <video preload="metadata" ${posterAttr}>
              <source src="portfolio_images/${image.filename}">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="card__image">
            <img src="portfolio_images/${image.filename}" alt="${image.title}" loading="lazy" />
          </div>
        `;
      }

      article.innerHTML = `
        ${mediaHtml}
        <div class="card__body">
          <h3 class="card__title">${image.title}</h3>
          <p class="card__text">${isVideo ? 'Click to play.' : 'Click to view larger.'}</p>
        </div>
      `;

      if (isVideo) {
        const vid = article.querySelector('video');
        if (vid) {
          vid.style.cursor = 'pointer';
          vid.addEventListener('click', () => vid.paused ? vid.play() : vid.pause());
        }
      } else {
        const img = article.querySelector('img');
        if (img) img.addEventListener('click', () => openLightbox(`portfolio_images/${image.filename}`, image.title));
      }

      grid.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading images:', error);
    const grid = document.getElementById('digital-art-grid');
    if (grid) {
      grid.innerHTML = '<p class="placeholder-message">Unable to load images (check console errors).</p>';
    }
  }
}

// Load work links
async function loadWorkLinks() {
  try {
    const response = await fetch('portfolio_worklinks/worklinks.json');
    const links = await response.json();
    const grid = document.getElementById('work-links-grid');
    grid.innerHTML = '';
    links.forEach(link => {
      const article = document.createElement('article');
      article.className = 'newsletter-card revealed';
      article.innerHTML = `
        <h3 class="newsletter-card__title">${link.title}</h3>
        <p class="newsletter-card__text">${link.description}</p>
        <a class="btn btn--ghost btn--small" href="${link.url}" target="_blank" rel="noopener">View Project</a>
      `;
      grid.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading work links:', error);
    const grid = document.getElementById('work-links-grid');
    if (grid) {
      grid.innerHTML = '<p class="placeholder-message">Unable to load work links (check console errors).</p>';
    }
  }
}

// Load YouTube links
async function loadYouTubeLinks() {
  try {
    const response = await fetch('portfolio_ytlinks/ytlinks.json');
    const videos = await response.json();
    const grid = document.getElementById('youtube-videos-grid');
    grid.innerHTML = '';
    videos.forEach(video => {
      const article = document.createElement('article');
      article.className = 'video-card revealed';
      article.innerHTML = `
        <div class="video-card__thumb">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
          <div class="video-card__meta">
            <span class="tag">${video.subscribers} subs</span>
            <span class="video-card__duration">${video.views} views</span>
          </div>
        </div>
        <div class="video-card__body">
          <h3 class="video-card__title">${video.title}</h3>
          <p class="video-card__text">Click to watch on YouTube.</p>
        </div>
      `;
      article.addEventListener('click', () => window.open(video.url, '_blank'));
      grid.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading YouTube links:', error);
    const grid = document.getElementById('youtube-videos-grid');
    if (grid) {
      grid.innerHTML = '<p class="placeholder-message">Unable to load YouTube cards (check console errors).</p>';
    }
  }
}

// Lightbox functions
function openLightbox(src, title) {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-image');
  const titleEl = document.getElementById('lightbox-title');
  image.src = src;
  image.alt = title;
  titleEl.textContent = title;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
}

document.getElementById('lightbox-overlay').addEventListener('click', closeLightbox);
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

// Load all content on page load
window.addEventListener('DOMContentLoaded', () => {
  loadVideos();
  loadImages();
  loadWorkLinks();
  loadYouTubeLinks();
  // Load 3D section content
  if (typeof load3D === 'function') load3D();
});

// Load 3D content
async function load3D() {
  try {
    const response = await fetch('portfolio_3d/3d.json');
    const items = await response.json();
    const grid = document.getElementById('graphic-3d-grid');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(item => {
      const isVideo = /\.(mp4|MP4|webm|mov|MOV|m4v|M4V)$/i.test(item.filename);
      const article = document.createElement('article');
      article.className = 'card revealed';

      let mediaHtml = '';
      if (isVideo) {
        const posterAttr = item.thumbnail ? `poster="portfolio_3d/${item.thumbnail}"` : '';
        mediaHtml = `
          <div class="card__image">
            <video preload="metadata" ${posterAttr}>
              <source src="portfolio_3d/${item.filename}">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="card__image">
            <img src="portfolio_3d/${item.filename}" alt="${item.title}" loading="lazy" />
          </div>
        `;
      }

      article.innerHTML = `
        ${mediaHtml}
        <div class="card__body">
          <h3 class="card__title">${item.title}</h3>
          <p class="card__text">${isVideo ? 'Click to play.' : 'Click to view.'}</p>
          <div class="card__meta">
            ${item.tools ? item.tools.map(t => `<span class="tag">${t}</span>`).join('') : ''}
          </div>
        </div>
      `;

      if (isVideo) {
        const vid = article.querySelector('video');
        if (vid) {
          vid.style.cursor = 'pointer';
          vid.addEventListener('click', () => vid.paused ? vid.play() : vid.pause());
        }
      } else {
        const img = article.querySelector('.card__image img');
        if (img) img.addEventListener('click', () => openLightbox(`portfolio_3d/${item.filename}`, item.title));
      }

      grid.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading 3D content:', error);
    const grid = document.getElementById('graphic-3d-grid');
    if (grid) grid.innerHTML = '<p class="placeholder-message">Unable to load 3D content (check console errors).</p>';
  }
}

/* -------------------------------------------------------------------------- */
/* Contact form simulation -------------------------------------------------- */
/* -------------------------------------------------------------------------- */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const status = contactForm.querySelector(".form-status");
    const submitBtn = contactForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
      status.textContent =
        "Thanks! This is a safe demo. Your message would send here in a real build.";

      contactForm.reset();

      setTimeout(() => {
        status.textContent = "";
      }, 5200);
    }, 1200);
  });
}

/* -------------------------------------------------------------------------- */
/* Utility ------------------------------------------------------------------ */
/* -------------------------------------------------------------------------- */
function updateFooterYear() {
  if (!footerYear) return;
  footerYear.textContent = new Date().getFullYear();
}

updateFooterYear();