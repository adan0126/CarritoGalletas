document.addEventListener("DOMContentLoaded", () => {
  const productList = document.querySelector(".product-list");
  const totalDiv = document.querySelector(".cart-total p");
  const finalizarBtn = document.querySelector(".btn-primary");
  const totalSection = document.querySelector(".cart-total");
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  function actualizarTotal() {
    const items = document.querySelectorAll(".product-item");
    let total = 0;

    items.forEach((item) => {
      const unit = parseFloat(item.dataset.price || '0');
      const qtyEl = item.querySelector(".qty-input");
      const qty = qtyEl ? Math.max(1, parseInt(qtyEl.value) || 1) : 1;
      total += unit * qty;
    });

    totalDiv.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;
  }

  async function actualizarCantidadEnServidor(productId, cantidad) {
    // Ya no se persiste cantidad en BD, solo local
    return true;
  }

  function agregarBotonesEliminar() {
    const items = document.querySelectorAll(".product-item");
    items.forEach((item) => {
      if (!item.querySelector(".remove-btn")) {
        const btn = document.createElement("button");
        btn.textContent = "Eliminar";
        btn.classList.add("btn", "remove-btn");
        btn.addEventListener("click", async () => {
          const gameId = item.dataset.gameId;
          try {
            if (gameId && usuario && usuario.id) {
              await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: usuario.id, productId: gameId })
              });
            }
          } catch (e) {
            console.error('Error removiendo item:', e);
          }
          item.remove();
          actualizarTotal();
          toggleEmptyState();
        });
        item.appendChild(btn);
      }
    });
  }

  async function cargarCarrito() {
    productList.innerHTML = "";
    if (!usuario || !usuario.id) {
      toggleEmptyState();
      return;
    }
    try {
      const resp = await fetch(`/api/cart?userId=${encodeURIComponent(usuario.id)}`);
      const data = await resp.json();
      const items = (data && data.items) || [];
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((it) => {
          const p = it.product || {};
          const nombre = p.name || p.prod_name || 'Producto';
          const img = p.img || p.prod_img || '';
          const priceNum = Number(p.price || p.prod_price || 0);
          const stock = p.stock || p.prod_stock;
          const cantidad = 1; // Cantidad por defecto, se edita localmente

          const div = document.createElement('div');
          div.classList.add('product-item');
          if (stock !== undefined) div.dataset.stock = stock;
          div.dataset.gameId = it.game_id;
          div.dataset.price = String(priceNum);

          div.innerHTML = `
            <img src="${img}" alt="${nombre}" class="product-img" />
            <div class="product-info">
              <h2 class="product-name">${nombre}</h2>
              <p class="product-price">$${priceNum.toFixed(2)}</p>
              ${stock !== undefined ? `<p class="product-stock">Stock: ${stock}</p>` : ''}
              <div class="product-qty">
                <label for="qty-${it.game_id}">Cantidad:</label>
                <input id="qty-${it.game_id}" class="qty-input" type="number" min="1" ${stock !== undefined ? `max="${stock}"` : ''} value="${cantidad}" />
              </div>
            </div>
          `;
          productList.appendChild(div);

          const qtyInput = div.querySelector('.qty-input');
          if (qtyInput) {
            qtyInput.addEventListener('change', async () => {
              const min = parseInt(qtyInput.min) || 1;
              const max = parseInt(qtyInput.max) || Number.MAX_SAFE_INTEGER;
              let val = parseInt(qtyInput.value) || min;
              val = Math.max(min, Math.min(max, val));
              qtyInput.value = String(val);
              const success = await actualizarCantidadEnServidor(it.game_id, val);
              if (success) {
                actualizarTotal();
              }
            });
          }
        });
      }
    } catch (e) {
      console.error('Error cargando carrito:', e);
    }
    agregarBotonesEliminar();
    toggleEmptyState();
    actualizarTotal();
  }

  function toggleEmptyState() {
    const hasItems = document.querySelectorAll(".product-item").length > 0;
    if (!hasItems) {
      productList.innerHTML = '<p class="empty-state">No hay nada en el carrito.</p>';
      if (totalSection) totalSection.style.display = 'none';
      if (finalizarBtn) finalizarBtn.disabled = true;
    } else {
      if (totalSection) totalSection.style.display = '';
      if (finalizarBtn) finalizarBtn.disabled = false;
    }
  }

  finalizarBtn.addEventListener("click", async () => {
    if (!usuario || !usuario.id) return;
    try {
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id })
      });
    } catch (e) {
      console.error('Error vaciando carrito:', e);
    }
    productList.innerHTML = "";
    toggleEmptyState();
  });

  cargarCarrito();
});
