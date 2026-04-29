// ── Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Hamburger mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
// Close on link click
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ── Active nav link (by current page)
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── Newsletter toast
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input?.value) return;
      showToast('🎉 Thanks for subscribing! Check your inbox for 10% off.');
      input.value = '';
    });
  });
}

function showToast(msg) {
  let toast = document.getElementById('ccb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ccb-toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
      background:#2d1a1a; color:#F5E6D3; padding:1rem 2rem; border-radius:50px;
      font-size:.9rem; z-index:9999; opacity:0; transition:all .4s ease;
      border:1px solid rgba(193,154,107,.4); box-shadow:0 10px 40px rgba(0,0,0,.3);
      white-space:nowrap; font-family:'Inter',sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}

// ── Intersection Observer – animate on scroll
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .65s ease, transform .65s ease';
    observer.observe(el);
  });
}

// ── Product filter (menu page)
function initFilter() {
  const btns  = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('filter-active'));
      btn.classList.add('filter-active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? 'block' : 'none';
        if (show) {
          card.style.animation = 'fadeUp .45s ease forwards';
        }
      });
    });
  });
}

// ── Contact form
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('✅ Message sent! We\'ll be in touch soon.');
    form.reset();
  });
}

// ── Init all
document.addEventListener('DOMContentLoaded', () => {
  initNewsletter();
  initScrollAnimations();
  initFilter();
  initContactForm();
});
