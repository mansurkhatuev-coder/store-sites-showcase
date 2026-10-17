(() => {
  const config = window.BAKHURRR_CONFIG || {};
  const product = {
    name: 'Creed Aventus',
    volume: '10 мл',
    image: 'assets/hero-start-frame-1920x1080.png',
  };
  const storageKey = 'bakhurrr-demo-cart-v1';
  const phone = String(config.whatsappPhone || '').replace(/\D/g, '');
  const wbUrl = config.wildberriesUrl || 'https://www.wildberries.ru/catalog/482082840/detail.aspx?targetUrl=SN';
  const instagramUrl = config.instagramUrl || 'https://www.instagram.com/bakhurrr/';

  const nodes = {
    openButton: document.querySelector('[data-open-cart]'),
    closeButton: document.querySelector('[data-close-cart]'),
    continueButton: document.querySelector('[data-continue-shopping]'),
    drawer: document.querySelector('[data-cart-drawer]') || document.querySelector('#cart-drawer'),
    backdrop: document.querySelector('[data-cart-backdrop]'),
    count: document.querySelector('[data-cart-count]'),
    item: document.querySelector('[data-cart-item]'),
    empty: document.querySelector('[data-cart-empty]'),
    summary: document.querySelector('[data-cart-summary]'),
    actions: document.querySelector('[data-cart-actions]'),
    toast: document.querySelector('[data-toast]'),
    whatsappLabel: document.querySelector('[data-whatsapp-label]'),
  };

  let quantity = readQuantity();
  let returnFocus = null;
  let toastTimer = 0;

  function readQuantity() {
    try {
      const value = Number.parseInt(localStorage.getItem(storageKey) || '0', 10);
      return Number.isInteger(value) && value > 0 ? Math.min(value, 99) : 0;
    } catch {
      return 0;
    }
  }

  function saveQuantity() {
    try {
      if (quantity > 0) localStorage.setItem(storageKey, String(quantity));
      else localStorage.removeItem(storageKey);
    } catch {
      // The cart still works for this page view when browser storage is unavailable.
    }
  }

  function showToast(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add('toast--visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => nodes.toast.classList.remove('toast--visible'), 2800);
  }

  function renderCart() {
    nodes.count.textContent = String(quantity);
    nodes.count.setAttribute('aria-label', `${quantity} ${quantity === 1 ? 'товар' : 'товаров'} в корзине`);
    nodes.empty.hidden = quantity > 0;
    nodes.item.hidden = quantity === 0;
    nodes.summary.hidden = quantity === 0;
    nodes.actions.hidden = quantity === 0;

    if (quantity > 0) {
      nodes.item.innerHTML = `
        <img src="${product.image}" alt="" width="116" height="86">
        <div class="cart-item__main">
          <span class="cart-item__brand">BAKHURRR · 10 ML</span>
          <strong>${product.name}</strong>
          <div class="quantity-stepper" aria-label="Количество флаконов">
            <button type="button" data-quantity="decrease" aria-label="Уменьшить количество">−</button>
            <span aria-live="polite">${quantity}</span>
            <button type="button" data-quantity="increase" aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <button class="cart-item__remove" type="button" data-remove-item aria-label="Убрать Creed Aventus из корзины">×</button>
      `;
    } else {
      nodes.item.replaceChildren();
    }

    updateWhatsAppLinks();
  }

  function orderMessage() {
    return `Здравствуйте! Хочу заказать ${product.name}, ${product.volume} от BAKHURRR. Количество: ${quantity}. Подскажите, пожалуйста, актуальную цену и наличие.`;
  }

  function updateWhatsAppLinks() {
    document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
      if (phone) {
        link.href = `https://wa.me/${phone}?text=${encodeURIComponent(orderMessage())}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-disabled');
        link.classList.remove('is-unconfigured');
      } else {
        link.href = '#';
        link.removeAttribute('target');
        link.setAttribute('aria-disabled', 'true');
        link.classList.add('is-unconfigured');
      }
    });

    if (nodes.whatsappLabel) {
      nodes.whatsappLabel.textContent = phone ? 'Открыть чат и уточнить детали' : 'Добавим ссылку после номера продавца';
    }
  }

  function openCart() {
    returnFocus = document.activeElement;
    nodes.drawer.inert = false;
    nodes.drawer.setAttribute('aria-hidden', 'false');
    nodes.backdrop.hidden = false;
    document.body.classList.add('cart-is-open');
    nodes.openButton.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => nodes.closeButton.focus());
  }

  function closeCart() {
    nodes.drawer.setAttribute('aria-hidden', 'true');
    nodes.drawer.inert = true;
    nodes.backdrop.hidden = true;
    document.body.classList.remove('cart-is-open');
    nodes.openButton.setAttribute('aria-expanded', 'false');
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }

  document.querySelectorAll('[data-wb-link]').forEach((link) => { link.href = wbUrl; });
  document.querySelectorAll('[data-instagram-link]').forEach((link) => { link.href = instagramUrl; });

  document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      quantity = Math.min(quantity + 1, 99);
      saveQuantity();
      renderCart();
      showToast('Creed Aventus добавлен в корзину');
    });
  });

  nodes.item.addEventListener('click', (event) => {
    const action = event.target.closest('[data-quantity]')?.dataset.quantity;
    if (action === 'increase') quantity = Math.min(quantity + 1, 99);
    if (action === 'decrease') quantity = Math.max(quantity - 1, 0);
    if (event.target.closest('[data-remove-item]')) quantity = 0;
    saveQuantity();
    renderCart();
  });

  nodes.openButton.addEventListener('click', openCart);
  nodes.closeButton.addEventListener('click', closeCart);
  nodes.continueButton.addEventListener('click', closeCart);
  nodes.backdrop.addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (nodes.drawer.inert) return;
    if (event.key === 'Escape') {
      closeCart();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...nodes.drawer.querySelectorAll('a[href], button:not(:disabled)')]
        .filter((element) => !element.closest('[hidden]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!phone) {
        event.preventDefault();
        showToast('Пришлите номер продавца в международном формате — подключим WhatsApp.');
      }
    });
  });

  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  }

  renderCart();
})();
