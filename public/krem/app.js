// Replace this with the confectionery's number in international format, digits only.
// Example: 79991234567. Leave empty for the demo contact picker.
const WHATSAPP_PHONE = '';

const CATEGORIES = [
  { id: 'popular', label: 'ПОПУЛЯРНОЕ' },
  { id: 'cakes', label: 'ТОРТЫ' },
  { id: 'desserts', label: 'ДЕСЕРТЫ' },
  { id: 'pastries', label: 'ВЫПЕЧКА' },
  { id: 'cookies', label: 'ПЕЧЕНЬЕ И МАКАРОНС' },
  { id: 'drinks', label: 'НАПИТКИ' },
];

// Temporary КРЕМ demo products and public sample images. Replace them with the approved confectionery catalog later.
const PRODUCTS = [
  {
    id: 'honey-cake', name: 'Медовик, 1 кг', category: 'cakes', categoryLabel: 'Торты',
    description: 'Тонкие медовые коржи и нежный сметанный крем.', price: 2900,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=88',
    popular: true, tag: 'ХИТ',
  },
  {
    id: 'vanilla-cheesecake', name: 'Ванильный чизкейк', category: 'desserts', categoryLabel: 'Десерты',
    description: 'Сливочный чизкейк с ванилью на хрустящей песочной основе.', price: 390,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=88',
    popular: true, tag: 'НЕЖНЫЙ ВКУС',
  },
  {
    id: 'raspberry-tartlet', name: 'Малиновая тарталетка', category: 'desserts', categoryLabel: 'Десерты',
    description: 'Рассыпчатая корзиночка, ванильный крем и свежая малина.', price: 350,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=88',
    popular: false, tag: 'С МАЛИНОЙ',
  },
  {
    id: 'vanilla-eclair', name: 'Ванильный эклер', category: 'pastries', categoryLabel: 'Выпечка',
    description: 'Заварное тесто с нежным кремом и тонкой шоколадной глазурью.', price: 260,
    image: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=900&q=88',
    popular: false, tag: 'КЛАССИКА',
  },
  {
    id: 'almond-croissant', name: 'Миндальный круассан', category: 'pastries', categoryLabel: 'Выпечка',
    description: 'Слоёный круассан с миндальным кремом и лепестками миндаля.', price: 290,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=88',
    popular: true, tag: 'С МИНДАЛЁМ',
  },
  {
    id: 'macarons-box', name: 'Набор макаронс, 6 шт.', category: 'cookies', categoryLabel: 'Печенье и макаронс',
    description: 'Шесть воздушных миндальных пирожных в ассорти вкусов.', price: 690,
    image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=88',
    popular: true, tag: 'НАБОР',
  },
  {
    id: 'chocolate-cookie', name: 'Шоколадное печенье', category: 'cookies', categoryLabel: 'Печенье и макаронс',
    description: 'Мягкое печенье с кусочками тёмного шоколада.', price: 190,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=88',
    popular: false, tag: 'С ШОКОЛАДОМ',
  },
  {
    id: 'cocoa', name: 'Какао', category: 'drinks', categoryLabel: 'Напитки',
    description: 'Густое какао на молоке — уютное дополнение к десерту.', price: 240,
    image: 'https://images.unsplash.com/photo-1542990253-0b8be6f970ad?auto=format&fit=crop&w=900&q=88',
    popular: false, tag: 'НАПИТОК',
  },
];

const STORAGE_KEY = 'krem-demo-cart-v1';
const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const productById = new Map(PRODUCTS.map((product) => [product.id, product]));
const nodes = {
  categoryList: document.querySelector('[data-category-list]'),
  productGrid: document.querySelector('[data-product-grid]'),
  resultsLabel: document.querySelector('[data-results-label]'),
  emptyResults: document.querySelector('[data-empty-results]'),
  search: document.querySelector('[data-search]'),
  drawer: document.querySelector('.cart-drawer'),
  backdrop: document.querySelector('[data-cart-backdrop]'),
  cartItems: document.querySelector('[data-cart-items]'),
  cartEmpty: document.querySelector('[data-cart-empty]'),
  drawerTotal: document.querySelector('[data-drawer-total]'),
  fulfillment: document.querySelector('[data-fulfillment]'),
  fulfillmentMethods: document.querySelectorAll('[data-fulfillment-method]'),
  deliveryAddress: document.querySelector('[data-delivery-address]'),
  deliveryAddressInput: document.querySelector('[data-delivery-address-input]'),
  whatsappOrder: document.querySelector('[data-whatsapp-order]'),
  whatsappHint: document.querySelector('[data-whatsapp-hint]'),
  toast: document.querySelector('[data-toast]'),
};

let activeCategory = 'popular';
let searchText = '';
let lastFocusedElement = null;
let toastTimer = 0;
let fulfillmentMethod = 'pickup';
let deliveryAddress = '';
let cart = readCart();

function formatMoney(value) {
  return money.format(value);
}

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const clean = new Map();
    for (const [id, quantity] of Object.entries(saved)) {
      if (productById.has(id) && Number.isInteger(quantity) && quantity > 0) clean.set(id, quantity);
    }
    return clean;
  } catch {
    return new Map();
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(cart)));
}

function cartCount() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function cartTotal() {
  return [...cart.entries()].reduce((sum, [id, quantity]) => sum + productById.get(id).price * quantity, 0);
}

function orderIsReady() {
  return cartCount() > 0 && (fulfillmentMethod === 'pickup' || Boolean(deliveryAddress.trim()));
}

function updateFulfillmentPicker() {
  nodes.fulfillmentMethods.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.fulfillmentMethod === fulfillmentMethod));
  });
  nodes.deliveryAddress.hidden = fulfillmentMethod !== 'delivery';
}

function updateOrderAction() {
  const hasItems = cartCount() > 0;
  const canOrder = orderIsReady();
  nodes.whatsappOrder.classList.toggle('is-disabled', !canOrder);
  nodes.whatsappOrder.setAttribute('aria-disabled', String(!canOrder));
  nodes.whatsappOrder.tabIndex = canOrder ? 0 : -1;
  nodes.whatsappOrder.href = canOrder ? buildWhatsAppUrl() : '#order';

  if (hasItems && fulfillmentMethod === 'delivery' && !deliveryAddress.trim()) {
    nodes.whatsappHint.textContent = 'Укажите адрес доставки, чтобы продолжить.';
  } else {
    nodes.whatsappHint.textContent = WHATSAPP_PHONE
      ? 'Откроется чат кондитерской «КРЕМ» с готовым текстом заказа — останется нажать «Отправить».'
      : 'Номер кондитерской можно добавить в настройке сайта. Пока WhatsApp предложит выбрать чат.';
  }
}

function renderCategories() {
  nodes.categoryList.innerHTML = CATEGORIES.map((category) => `
    <button class="category-button" type="button" data-category="${category.id}" aria-pressed="${activeCategory === category.id}">
      ${category.label}
    </button>
  `).join('');
}

function getVisibleProducts() {
  const query = searchText.trim().toLocaleLowerCase('ru');
  return PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'popular'
      ? product.popular
      : product.category === activeCategory;
    const searchable = `${product.name} ${product.description} ${product.categoryLabel}`.toLocaleLowerCase('ru');
    return matchesCategory && (!query || searchable.includes(query));
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  nodes.resultsLabel.textContent = `${visibleProducts.length} ${pluralize(visibleProducts.length, ['товар', 'товара', 'товаров'])}`;
  nodes.emptyResults.hidden = visibleProducts.length > 0;
  nodes.productGrid.hidden = visibleProducts.length === 0;
  nodes.productGrid.classList.toggle('is-single', visibleProducts.length === 1);
  nodes.productGrid.innerHTML = visibleProducts.map((product, index) => {
    const quantity = cart.get(product.id) || 0;
    return `
      <article class="product-card" style="animation-delay:${Math.min(index * 55, 220)}ms">
        <div class="product-image-wrap">
          <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
          <span class="product-tag">${product.tag}</span>
        </div>
        <div class="product-info">
          <span class="product-meta">${product.categoryLabel.toUpperCase()}</span>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-footer">
            <span class="product-price">${formatMoney(product.price)}</span>
            <button class="add-button" type="button" data-add="${product.id}" aria-label="Добавить ${product.name} в корзину">
              ${quantity ? `ЕЩЁ ${quantity}` : 'В КОРЗИНУ'} <span aria-hidden="true">＋</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updateProductButton(id) {
  const button = nodes.productGrid.querySelector(`[data-add="${id}"]`);
  if (!button) return;
  const product = productById.get(id);
  const quantity = cart.get(id) || 0;
  button.innerHTML = `${quantity ? `ЕЩЁ ${quantity}` : 'В КОРЗИНУ'} <span aria-hidden="true">＋</span>`;
  button.setAttribute('aria-label', `Добавить ${product.name} в корзину`);
}

function pluralize(count, words) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return words[2];
  if (last === 1) return words[0];
  if (last >= 2 && last <= 4) return words[1];
  return words[2];
}

function renderCart() {
  const entries = [...cart.entries()];
  const count = cartCount();
  const total = cartTotal();
  document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = count; });
  document.querySelectorAll('[data-cart-total]').forEach((element) => { element.textContent = formatMoney(total); });
  nodes.drawerTotal.textContent = formatMoney(total);
  nodes.cartEmpty.hidden = entries.length > 0;
  nodes.cartItems.hidden = entries.length === 0;
  nodes.fulfillment.hidden = entries.length === 0;
  if (entries.length === 0) {
    fulfillmentMethod = 'pickup';
    deliveryAddress = '';
    nodes.deliveryAddressInput.value = '';
  }
  updateFulfillmentPicker();

  nodes.cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = productById.get(id);
    return `
      <article class="cart-line">
        <img src="${product.image}" alt="" loading="lazy">
        <div class="cart-line-info">
          <h3 class="cart-line-name">${product.name}</h3>
          <span class="cart-line-price">${formatMoney(product.price)} · ${formatMoney(product.price * quantity)}</span>
        </div>
        <div class="cart-line-controls">
          <div class="quantity-control" aria-label="Количество: ${quantity}">
            <button type="button" data-decrease="${id}" aria-label="Уменьшить количество: ${product.name}">−</button>
            <output>${quantity}</output>
            <button type="button" data-increase="${id}" aria-label="Увеличить количество: ${product.name}">+</button>
          </div>
          <button class="remove-line" type="button" data-remove="${id}">Убрать</button>
        </div>
      </article>
    `;
  }).join('');

  updateOrderAction();
}

function buildOrderMessage() {
  const lines = [...cart.entries()].map(([id, quantity]) => {
    const product = productById.get(id);
    return `• ${product.name} × ${quantity} — ${formatMoney(product.price * quantity)}`;
  });
  return [
    'Здравствуйте! Хочу оформить заказ в кондитерской «КРЕМ»:',
    '',
    ...lines,
    '',
    `Способ получения: ${fulfillmentMethod === 'delivery' ? 'доставка' : 'самовывоз'}`,
    ...(fulfillmentMethod === 'delivery' ? [`Адрес доставки: ${deliveryAddress.trim()}`] : []),
    '',
    `Итого: ${formatMoney(cartTotal())}`,
  ].join('\n');
}

function buildWhatsAppUrl() {
  const phone = WHATSAPP_PHONE.replace(/\D/g, '');
  const text = encodeURIComponent(buildOrderMessage());
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  saveCart();
  renderCart();
  updateProductButton(id);
  const product = productById.get(id);
  showToast(`${product.name} добавлен в корзину`);
}

function changeQuantity(id, change) {
  const next = (cart.get(id) || 0) + change;
  if (next <= 0) cart.delete(id);
  else cart.set(id, next);
  saveCart();
  renderCart();
  updateProductButton(id);
}

function removeFromCart(id) {
  cart.delete(id);
  saveCart();
  renderCart();
  updateProductButton(id);
}

function openCart() {
  if (!nodes.drawer.classList.contains('is-open')) lastFocusedElement = document.activeElement;
  nodes.backdrop.hidden = false;
  nodes.drawer.inert = false;
  nodes.drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
  requestAnimationFrame(() => {
    nodes.backdrop.classList.add('is-visible');
    nodes.drawer.classList.add('is-open');
    nodes.drawer.querySelector('[data-close-cart]').focus();
  });
}

function closeCart() {
  nodes.backdrop.classList.remove('is-visible');
  nodes.drawer.classList.remove('is-open');
  nodes.drawer.setAttribute('aria-hidden', 'true');
  nodes.drawer.inert = true;
  document.body.classList.remove('cart-open');
  window.setTimeout(() => { nodes.backdrop.hidden = true; }, 300);
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function showToast(message) {
  nodes.toast.textContent = message;
  nodes.toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => nodes.toast.classList.remove('is-visible'), 1900);
}

nodes.categoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

nodes.search.addEventListener('input', () => {
  searchText = nodes.search.value;
  renderProducts();
});

nodes.productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});

nodes.cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-increase], [data-decrease], [data-remove]');
  if (!button) return;
  if (button.dataset.increase) changeQuantity(button.dataset.increase, 1);
  else if (button.dataset.decrease) changeQuantity(button.dataset.decrease, -1);
  else removeFromCart(button.dataset.remove);
});

nodes.fulfillment.addEventListener('click', (event) => {
  const button = event.target.closest('[data-fulfillment-method]');
  if (!button) return;
  fulfillmentMethod = button.dataset.fulfillmentMethod;
  updateFulfillmentPicker();
  updateOrderAction();
});

nodes.deliveryAddressInput.addEventListener('input', () => {
  deliveryAddress = nodes.deliveryAddressInput.value;
  updateOrderAction();
});

document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', openCart));
document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', closeCart));
nodes.backdrop.addEventListener('click', closeCart);
nodes.whatsappOrder.addEventListener('click', (event) => {
  if (!orderIsReady()) {
    event.preventDefault();
    if (cartCount() > 0 && fulfillmentMethod === 'delivery') nodes.deliveryAddressInput.focus();
  }
});

const menuHeading = document.querySelector('.menu-heading');
const menuTools = document.querySelector('.menu-tools');
const floatingCart = document.querySelector('.floating-cart');
if (menuHeading && menuTools && floatingCart && 'IntersectionObserver' in window) {
  const visibleMenuSections = new Set();
  const menuObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleMenuSections.add(entry.target);
      else visibleMenuSections.delete(entry.target);
    }
    floatingCart.classList.toggle('is-hidden', visibleMenuSections.size > 0);
  });
  menuObserver.observe(menuHeading);
  menuObserver.observe(menuTools);
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    nodes.search.focus();
  }
  if (event.key === 'Escape' && nodes.drawer.classList.contains('is-open')) closeCart();
});

renderCategories();
renderProducts();
renderCart();
