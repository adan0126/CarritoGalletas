document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  let cartGameIds = new Set();

  // Cargar IDs de juegos en el carrito
  async function cargarCartGameIds() {
    if (!usuario || !usuario.id) return;
    try {
      const resp = await fetch(`/api/cart?userId=${encodeURIComponent(usuario.id)}`);
      const data = await resp.json();
      const items = (data && data.items) || [];
      cartGameIds = new Set(items.map(it => it.game_id));
    } catch (e) {
      console.error('Error cargando carrito:', e);
    }
  }

  // Cargar productos desde el servidor
  await cargarCartGameIds();
  await cargarProductos();

  function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
  }

  function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  async function agregarAlCarrito(product) {
    if (!usuario || !usuario.id) {
      alert('Debes iniciar sesión para agregar al carrito.');
      return;
    }

    const productId = product.id || product.prod_id;
    if (!productId) {
      alert('No se pudo identificar el producto.');
      return;
    }
    if ((product.prod_stock ?? product.stock ?? 0) <= 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }

    try {
      const resp = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id, productId, quantity: 1 })
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.message || 'No se pudo agregar al carrito');
        return;
      }
      alert(`${product.prod_name || product.name} fue agregado al carrito.`);
      cartGameIds.add(productId);
      actualizarBotones();
    } catch (e) {
      console.error('Error agregando al carrito:', e);
      alert('No se pudo agregar al carrito.');
    }
  }

  function actualizarBotones() {
    document.querySelectorAll('.product-item').forEach(item => {
      const btn = item.querySelector('.btn-primary');
      const productName = item.querySelector('.product-name')?.textContent || '';
      const gameId = item.dataset.gameId;

      if (gameId && cartGameIds.has(Number(gameId))) {
        btn.textContent = 'Ya está en el carrito';
        btn.disabled = true;
      } else {
        btn.textContent = 'Agregar al carrito';
        btn.disabled = false;
      }
    });
  }

  async function cargarProductos() {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar productos');
      }

      const productList = document.querySelector(".product-list");
      if (!productList) return;

      // Limpiar productos estáticos
      productList.innerHTML = '';

      // Crear productos dinámicamente (solo los que tienen stock > 0)
      data.products.forEach(product => {
        // Saltar productos sin stock
        if (!product.prod_stock || product.prod_stock <= 0) return;

        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.dataset.gameId = product.id;

        const btnText = cartGameIds.has(product.id) ? 'Ya está en el carrito' : 'Agregar al carrito';
        const btnDisabled = cartGameIds.has(product.id) ? 'disabled' : '';

        productItem.innerHTML = `
          <img src="${product.prod_img}" alt="${product.prod_name}" class="product-img" />
          <div class="product-body">
            <div class="product-info">
              <h2 class="product-name">${product.prod_name}</h2>
              <p class="product-price">$${product.prod_price.toFixed(2)}</p>
              <p class="product-description">${product.prod_description || 'Sin descripción disponible.'}</p>
              <p class="product-genres">${product.prod_genres.join(', ')}</p>
              <p class="product-stock">Stock: ${product.prod_stock}</p>
            </div>
            <div class="product-actions">
              <button class="btn btn-primary" ${btnDisabled}>${btnText}</button>
            </div>
          </div>
        `;

        productList.appendChild(productItem);

        // Agregar event listener al botón
        const btnCarrito = productItem.querySelector(".btn.btn-primary");
        if (!cartGameIds.has(product.id)) {
          btnCarrito.addEventListener("click", () => agregarAlCarrito(product));
        }
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('No se pudieron cargar los productos. Por favor, intenta más tarde.');
    }
  }
});
