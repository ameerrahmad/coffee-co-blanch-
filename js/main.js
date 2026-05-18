// ═══════════════════════════════════════════════════════════════
// Coffee Co. Blanche — Full Site JavaScript
// ═══════════════════════════════════════════════════════════════

// ── Preloader
(function () {
  const loader = document.createElement('div');
  loader.id = 'ccb-preloader';
  loader.innerHTML = `
    <div class="preloader-inner">
      <div class="preloader-cup">☕</div>
      <span class="preloader-text">Coffee Co. Blanché</span>
    </div>`;
  document.body.prepend(loader);
  window.addEventListener('load', () => {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 600);
  });
})();

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

// ── Toast notification
function showToast(msg, type = 'success') {
  let toast = document.getElementById('ccb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ccb-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'ccb-toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3800);
}

// ═══════════════════════════════════════════════════════════════
//  CART SYSTEM
// ═══════════════════════════════════════════════════════════════
const Cart = {
  items: JSON.parse(localStorage.getItem('ccb_cart') || '[]'),

  save() { localStorage.setItem('ccb_cart', JSON.stringify(this.items)); },

  add(name, price) {
    const existing = this.items.find(i => i.name === name);
    if (existing) { existing.qty++; } else { this.items.push({ name, price, qty: 1 }); }
    this.save();
    this.updateBadge();
    showToast(`☕ ${name} added to cart!`);
    this.renderDrawer();
  },

  remove(name) {
    this.items = this.items.filter(i => i.name !== name);
    this.save();
    this.updateBadge();
    this.renderDrawer();
  },

  updateQty(name, delta) {
    const item = this.items.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { this.remove(name); return; }
    this.save();
    this.updateBadge();
    this.renderDrawer();
  },

  getTotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  getCount() { return this.items.reduce((s, i) => s + i.qty, 0); },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    const count = this.getCount();
    if (badge) { badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; }
  },

  renderDrawer() {
    const list = document.getElementById('cart-items');
    const total = document.getElementById('cart-total');
    const empty = document.getElementById('cart-empty');
    const footer = document.getElementById('cart-footer');
    if (!list) return;

    if (!this.items.length) {
      list.innerHTML = '';
      if (empty) empty.style.display = 'block';
      if (footer) footer.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (footer) footer.style.display = 'block';

    list.innerHTML = this.items.map(i => `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${i.name}</span>
          <span class="cart-item-price">RS. ${i.price * i.qty}</span>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-name="${i.name}" data-delta="-1">−</button>
          <span class="cart-qty">${i.qty}</span>
          <button class="cart-qty-btn" data-name="${i.name}" data-delta="1">+</button>
          <button class="cart-remove-btn" data-name="${i.name}">✕</button>
        </div>
      </div>`).join('');

    if (total) total.textContent = `RS. ${this.getTotal()}`;

    list.querySelectorAll('.cart-qty-btn').forEach(b => {
      b.addEventListener('click', () => Cart.updateQty(b.dataset.name, parseInt(b.dataset.delta)));
    });
    list.querySelectorAll('.cart-remove-btn').forEach(b => {
      b.addEventListener('click', () => Cart.remove(b.dataset.name));
    });
  },

  toggleDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    const open = drawer.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  },

  checkout() {
    if (!this.items.length) { showToast('Your cart is empty!', 'error'); return; }
    const msg = this.items.map(i => `${i.name} x${i.qty}`).join(', ');
    showToast(`🎉 Order placed! ${msg} — Total: RS. ${this.getTotal()}`);
    this.items = [];
    this.save();
    this.updateBadge();
    this.renderDrawer();
    this.toggleDrawer();
  }
};

// ── Build cart UI (injected into every page)
function buildCartUI() {
  // Cart icon button in navbar
  const orderBtn = document.querySelector('.nav-order-btn');
  if (orderBtn) {
    const cartBtn = document.createElement('button');
    cartBtn.id = 'cart-toggle';
    cartBtn.className = 'nav-cart-btn';
    cartBtn.setAttribute('aria-label', 'Open cart');
    cartBtn.innerHTML = `🛒 <span id="cart-badge" class="cart-badge">0</span>`;
    orderBtn.parentNode.insertBefore(cartBtn, orderBtn);
    cartBtn.addEventListener('click', () => Cart.toggleDrawer());
  }

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'cart-overlay';
  overlay.addEventListener('click', () => Cart.toggleDrawer());
  document.body.appendChild(overlay);

  // Drawer
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h3>Your Cart</h3>
      <button id="cart-close" class="cart-close-btn" aria-label="Close cart">✕</button>
    </div>
    <div id="cart-empty" class="cart-empty">
      <span class="cart-empty-icon">☕</span>
      <p>Your cart is empty</p>
      <a href="menu.html" class="btn-primary" style="margin-top:1rem;font-size:.85rem;padding:.6rem 1.5rem;">Browse Menu</a>
    </div>
    <div id="cart-items" class="cart-items"></div>
    <div id="cart-footer" class="cart-footer" style="display:none;">
      <div class="cart-total-row"><span>Total</span><strong id="cart-total">RS. 0</strong></div>
      <button id="cart-checkout" class="cart-checkout-btn">Place Order ☕</button>
      <p class="cart-note">Walk-in pickup at Gulberg 3, Lahore</p>
    </div>`;
  document.body.appendChild(drawer);

  document.getElementById('cart-close').addEventListener('click', () => Cart.toggleDrawer());
  document.getElementById('cart-checkout').addEventListener('click', () => Cart.checkout());

  Cart.updateBadge();
  Cart.renderDrawer();
}

// ── Wire up Add buttons on menu page
function initMenuAddButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Support both card layout and list layout
      const card = btn.closest('.menu-card') || btn.closest('.highlight-card');
      const row = btn.closest('.menu-item');

      let name = 'Item';
      let price = 0;

      if (row) {
        // New list-based menu layout
        name = row.querySelector('.menu-item-name')?.textContent?.trim() || 'Item';
        const priceText = row.querySelector('.menu-item-price')?.textContent || '0';
        price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      } else if (card) {
        // Old card-based layout (home page highlights)
        name = card.querySelector('h3')?.textContent?.trim() || 'Item';
        const priceText = card.querySelector('.menu-price, .price')?.textContent || '0';
        price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      } else {
        return;
      }

      if (price === 0) return; // Don't add items with no price

      Cart.add(name, price);

      // Button micro-animation
      const origText = btn.textContent;
      btn.textContent = '✓ Added';
      btn.style.background = 'var(--gold)';
      btn.style.color = 'var(--green-dark)';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '+ Add';
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 1200);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  FORM VALIDATION
// ═══════════════════════════════════════════════════════════════
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    clearFormErrors(form);

    const firstName = form.querySelector('#first-name');
    const email = form.querySelector('#email');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');

    if (!firstName?.value.trim()) { setFieldError(firstName, 'Please enter your first name'); valid = false; }
    if (!email?.value.trim() || !isValidEmail(email.value)) { setFieldError(email, 'Please enter a valid email'); valid = false; }
    if (subject && !subject.value) { setFieldError(subject, 'Please select a topic'); valid = false; }
    if (!message?.value.trim()) { setFieldError(message, 'Please enter your message'); valid = false; }

    if (!valid) { showToast('Please fix the errors above', 'error'); return; }

    // Simulate sending
    const btn = form.querySelector('.submit-btn');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      showToast('✅ Message sent! We\'ll be in touch soon.');
      form.reset();
      btn.textContent = orig;
      btn.disabled = false;
    }, 1200);
  });

  // Live validation on blur
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('blur', () => {
      clearFieldError(field);
      if (field.hasAttribute('required') && !field.value.trim()) {
        setFieldError(field, 'This field is required');
      } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        setFieldError(field, 'Enter a valid email address');
      }
    });
    field.addEventListener('input', () => clearFieldError(field));
  });
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function setFieldError(field, msg) {
  if (!field) return;
  field.classList.add('field-error');
  const el = document.createElement('span');
  el.className = 'field-error-msg';
  el.textContent = msg;
  field.parentNode.appendChild(el);
}
function clearFieldError(field) {
  if (!field) return;
  field.classList.remove('field-error');
  const msg = field.parentNode.querySelector('.field-error-msg');
  if (msg) msg.remove();
}
function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
  form.querySelectorAll('.field-error-msg').forEach(m => m.remove());
}

// ═══════════════════════════════════════════════════════════════
//  NEWSLETTER
// ═══════════════════════════════════════════════════════════════
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input?.value) { showToast('Please enter your email', 'error'); return; }
      if (!isValidEmail(input.value)) { showToast('Please enter a valid email', 'error'); return; }

      const btn = form.querySelector('button');
      const orig = btn.textContent;
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      setTimeout(() => {
        showToast('🎉 Thanks for subscribing! Check your inbox for 10% off.');
        input.value = '';
        btn.textContent = orig;
        btn.disabled = false;
      }, 1000);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const h4 = item.querySelector('h4');
    const p = item.querySelector('p');
    if (!h4 || !p) return;

    // Wrap content for animation
    p.style.maxHeight = '0';
    p.style.overflow = 'hidden';
    p.style.transition = 'max-height 0.35s ease, padding 0.35s ease';
    p.style.paddingTop = '0';

    // Add toggle arrow
    const arrow = document.createElement('span');
    arrow.className = 'faq-arrow';
    arrow.textContent = '+';
    h4.style.cursor = 'pointer';
    h4.style.display = 'flex';
    h4.style.justifyContent = 'space-between';
    h4.style.alignItems = 'center';
    h4.appendChild(arrow);

    h4.addEventListener('click', () => {
      const isOpen = item.classList.toggle('faq-open');
      arrow.textContent = isOpen ? '−' : '+';
      p.style.maxHeight = isOpen ? p.scrollHeight + 16 + 'px' : '0';
      p.style.paddingTop = isOpen ? '.5rem' : '0';
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  MENU FILTER
// ═══════════════════════════════════════════════════════════════
function initFilter() {
  const btns = document.querySelectorAll('[data-filter]');
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
        if (show) { card.style.animation = 'fadeUp .45s ease forwards'; }
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  HERO SCROLL HINT
// ═══════════════════════════════════════════════════════════════
function initScrollHint() {
  const hint = document.querySelector('.hero-scroll-hint');
  if (!hint) return;
  hint.style.cursor = 'pointer';
  hint.addEventListener('click', () => {
    const next = document.querySelector('.hero')?.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  });
}

// ═══════════════════════════════════════════════════════════════
//  BACK TO TOP
// ═══════════════════════════════════════════════════════════════
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ═══════════════════════════════════════════════════════════════
//  INIT ALL
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildCartUI();
  initMenuAddButtons();
  initNewsletter();
  initScrollAnimations();
  initFilter();
  initContactForm();
  initFAQ();
  initScrollHint();
  initBackToTop();
});
