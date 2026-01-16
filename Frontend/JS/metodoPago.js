const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');

const orderItemsContainer = document.getElementById('order-items');
const totalEl = document.getElementById('total');

function renderSummary() {
  if (!usuario || !usuario.id) {
    alert('Inicia sesión para completar la compra.');
    window.location.href = 'login.html';
    return;
  }

  if (!Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    alert('Tu carrito está vacío.');
    window.location.href = 'carrito.html';
    return;
  }

  orderItemsContainer.innerHTML = '';

  let subtotal = 0;
  checkoutItems.forEach(item => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;
    const line = price * qty;
    subtotal += line;

    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div class="order-item__info">
        <img src="${item.img || ''}" alt="${item.name || 'Producto'}" class="order-item__img" />
        <div>
          <p class="order-item__name">${item.name || 'Producto'}</p>
          <p class="order-item__meta">Cantidad: ${qty}</p>
        </div>
      </div>
      <div class="order-item__price">$${line.toFixed(2)}</div>
    `;
    orderItemsContainer.appendChild(div);
  });

  totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function validateCardData() {
  const cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
  const cardName = document.getElementById('card-name').value.trim();
  const expiry = document.getElementById('expiry').value.trim();
  const cvv = document.getElementById('cvv').value.trim();

  if (!/^\d{16}$/.test(cardNumber)) {
    alert('El número de tarjeta debe tener exactamente 16 dígitos numéricos.');
    return false;
  }

  if (cardName.length < 3) {
    alert('El nombre debe tener al menos 3 caracteres.');
    return false;
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    alert('El formato de vencimiento debe ser MM/AA.');
    return false;
  }

  const [month, year] = expiry.split('/').map(Number);
  if (month < 1 || month > 12) {
    alert('El mes debe estar entre 01 y 12.');
    return false;
  }

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    alert('La tarjeta está vencida.');
    return false;
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    alert('El CVV debe tener 3 o 4 dígitos.');
    return false;
  }

  return true;
}

async function sendCheckout() {
  try {
    const payload = {
      userId: usuario.id,
      items: checkoutItems.map(it => ({ gameId: it.gameId, quantity: it.quantity || 1 }))
    };

    const resp = await fetch('/api/library/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ message: 'Error procesando el pago.' }));
      throw new Error(error.message || 'No se pudo completar la compra.');
    }

    alert('Se agregó a tu biblioteca.');
    localStorage.removeItem('checkoutItems');
    window.location.href = 'productos.html';
  } catch (err) {
    console.error('Checkout falló:', err);
    alert(err.message || 'No se pudo completar la compra.');
  }
}

function attachPaymentHandlers() {
  const cardForm = document.getElementById('credit-card-form');
  if (cardForm) {
    cardForm.addEventListener('submit', evt => {
      evt.preventDefault();
      if (validateCardData()) {
        sendCheckout();
      }
    });
  }
}

renderSummary();
attachPaymentHandlers();
