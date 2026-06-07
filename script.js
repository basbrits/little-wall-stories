const products = {
  accent: {
    id: 'accent',
    name: 'Forest Friends Accent Kit',
    shortName: 'Accent Kit',
    price: 39,
    image: 'assets/detail-small.webp'
  },
  complete: {
    id: 'complete',
    name: 'Forest Friends Complete Mural Kit',
    shortName: 'Complete Kit',
    price: 69,
    image: 'assets/kit-small.webp'
  },
  statement: {
    id: 'statement',
    name: 'Forest Friends Statement Wall Kit',
    shortName: 'Statement Kit',
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
  selectedProduct: 'complete',
  cart: loadCart()
};

const cartDrawer = document.querySelector('[data-cart-drawer]');
const cartItems = document.querySelector('[data-cart-items]');
const cartCount = document.querySelector('[data-cart-count]');
const cartSubtotal = document.querySelector('[data-cart-subtotal]');
const selectedPrice = document.querySelector('[data-selected-price]');
const toast = document.querySelector('[data-toast]');

init();

function init() {
  document.querySelectorAll('input[name="kit"]').forEach((input) => {
    input.addEventListener('change', () => selectProduct(input.value));
  });

  document.querySelector('[data-add-selected]')?.addEventListener('click', () => {
    addToCart(state.selectedProduct);
  });

  document.querySelector('[data-buy-selected]')?.addEventListener('click', () => {
    addToCart(state.selectedProduct, false);
    openCart();
  });

  document.querySelectorAll('[data-open-cart]').forEach((button) => {
    button.addEventListener('click', openCart);
  });

  document.querySelectorAll('[data-close-cart]').forEach((button) => {
    button.addEventListener('click', closeCart);
  });

  cartDrawer?.addEventListener('click', (event) => {
    if (event.target === cartDrawer) closeCart();
  });

  document.querySelector('[data-checkout]')?.addEventListener('click', checkout);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  renderCart();
  selectProduct(state.selectedProduct);
}

function selectProduct(productId) {
  if (!products[productId]) return;
  state.selectedProduct = productId;

  document.querySelectorAll('.option-card').forEach((label) => {
    const input = label.querySelector('input');
    label.classList.toggle('selected', input?.value === productId);
  });

  if (selectedPrice) selectedPrice.textContent = currency.format(products[productId].price);
}

function addToCart(productId, showDrawer = true) {
  const product = products[productId];
  if (!product) return;

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.shortName} added to cart`);
  if (showDrawer) openCart();
}

function updateQuantity(index, change) {
  const item = state.cart[index];
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) state.cart.splice(index, 1);
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
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = count;
  if (cartSubtotal) cartSubtotal.textContent = currency.format(getSubtotal());

  if (!cartItems) return;

  if (!state.cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = state.cart.map((item, index) => {
    const product = products[item.id];
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="${product.shortName}" width="72" height="72">
        <div>
          <h3>${product.shortName}</h3>
          <p>${currency.format(product.price)} each</p>
          <div class="quantity-control" aria-label="Quantity controls">
            <button type="button" data-quantity="${index}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${index}" data-change="1" aria-label="Increase quantity">+</button>
            <button class="remove-line" type="button" data-remove="${index}">Remove</button>
          </div>
        </div>
        <div class="cart-line-price">${currency.format(product.price * item.quantity)}</div>
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

function checkout() {
  showToast('Checkout is not live yet');
}

function openCart() {
  cartDrawer?.classList.add('is-open');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}

function closeCart() {
  cartDrawer?.classList.remove('is-open');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function saveCart() {
  localStorage.setItem('littleWallStoriesCartV2', JSON.stringify(state.cart));
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('littleWallStoriesCartV2')) || [];
  } catch {
    return [];
  }
}
