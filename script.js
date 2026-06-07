const products = {
  complete: {
    id: 'complete',
    name: 'Forest Friends Complete Mural Kit',
    shortName: 'Complete Mural Kit',
    price: 69,
    image: 'assets/room-small.webp'
  },
  accent: {
    id: 'accent',
    name: 'Forest Friends Accent Kit',
    shortName: 'Accent Kit',
    price: 39,
    image: 'assets/detail-small.webp'
  },
  statement: {
    id: 'statement',
    name: 'Forest Friends Statement Wall Kit',
    shortName: 'Statement Wall Kit',
    price: 119,
    image: 'assets/hero-small.webp'
  }
};

const currency = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
});

const state = {
  cart: loadCart(),
  palette: 'Soft Neutral'
};

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const cartDrawer = document.querySelector('[data-cart-drawer]');
const cartItems = document.querySelector('[data-cart-items]');
const cartCount = document.querySelector('[data-cart-count]');
const cartSubtotal = document.querySelector('[data-cart-subtotal]');
const toast = document.querySelector('[data-toast]');
const year = document.querySelector('[data-year]');

if (year) year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

navMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('input[name="palette"]').forEach((input) => {
  input.addEventListener('change', () => {
    state.palette = input.value;
    document.querySelectorAll('.palette-option').forEach((label) => label.classList.remove('selected'));
    input.closest('.palette-option')?.classList.add('selected');
    showToast(`${state.palette} palette selected`);
  });
});

document.querySelectorAll('[data-add-product]').forEach((button) => {
  button.addEventListener('click', () => addToCart(button.dataset.addProduct));
});

document.querySelectorAll('[data-open-cart]').forEach((button) => {
  button.addEventListener('click', openCart);
});

document.querySelectorAll('[data-close-cart]').forEach((button) => {
  button.addEventListener('click', closeCart);
});

document.querySelector('[data-checkout]')?.addEventListener('click', () => {
  if (!state.cart.length) {
    showToast('Your cart is empty');
    return;
  }

  const order = state.cart
    .map((item) => `${item.quantity}× ${products[item.id].name} — ${item.palette}`)
    .join('\n');

  const subject = encodeURIComponent('New Little Wall Stories order');
  const body = encodeURIComponent(`Hello,\n\nI would like to order:\n\n${order}\n\nSubtotal: ${currency.format(getSubtotal())}\n\nMy shipping details are:\n\nName:\nAddress:\nCountry:\n\nThank you.`);

  // Replace the email address below or swap this for a Shopify/Stripe/WooCommerce checkout URL.
  window.location.href = `mailto:hello@yourbrand.com?subject=${subject}&body=${body}`;
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    navMenu?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
});

function addToCart(productId) {
  const product = products[productId];
  if (!product) return;

  const existing = state.cart.find((item) => item.id === productId && item.palette === state.palette);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: productId,
      palette: state.palette,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast(`${product.shortName} added`);
  openCart();
}

function updateQuantity(index, change) {
  const item = state.cart[index];
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  renderCart();
}

function getSubtotal() {
  return state.cart.reduce((sum, item) => {
    const product = products[item.id];
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartSubtotal.textContent = currency.format(getSubtotal());

  if (!state.cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = state.cart.map((item, index) => {
    const product = products[item.id];
    const lineTotal = currency.format(product.price * item.quantity);
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="${product.shortName}" width="68" height="68">
        <div>
          <h3>${product.shortName}</h3>
          <p>${item.palette}</p>
          <div class="quantity-control" aria-label="Quantity controls">
            <button type="button" data-quantity="${index}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${index}" data-change="1" aria-label="Increase quantity">+</button>
            <button class="remove-line" type="button" data-remove="${index}">Remove</button>
          </div>
        </div>
        <div class="cart-line-price">${lineTotal}</div>
      </article>
    `;
  }).join('');

  cartItems.querySelectorAll('[data-quantity]').forEach((button) => {
    button.addEventListener('click', () => updateQuantity(Number(button.dataset.quantity), Number(button.dataset.change)));
  });

  cartItems.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => removeItem(Number(button.dataset.remove)));
  });
}

function openCart() {
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function saveCart() {
  localStorage.setItem('littleWallStoriesCart', JSON.stringify(state.cart));
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('littleWallStoriesCart')) || [];
  } catch {
    return [];
  }
}

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

if (revealObserver) {
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

renderCart();
