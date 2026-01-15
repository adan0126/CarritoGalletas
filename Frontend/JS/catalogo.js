document.addEventListener("DOMContentLoaded", async () => {
  // Cargar productos desde el servidor
  await cargarProductos();

  function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
  }

  function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  async function agregarAlCarrito(product) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
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
    } catch (e) {
      console.error('Error agregando al carrito:', e);
      alert('No se pudo agregar al carrito.');
    }
  }

  async function comprarProducto(product) {
    await agregarAlCarrito(product);
    window.location.href = 'carrito.html';
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

      // Crear productos dinámicamente
      data.products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";

        productItem.innerHTML = `
          <img src="${product.prod_img}" alt="${product.prod_name}" class="product-img" />
          <div class="product-info">
            <h2 class="product-name">${product.prod_name}</h2>
            <p class="product-price">$${product.prod_price.toFixed(2)}</p>
            <p class="product-genres">${product.prod_genres.join(', ')}</p>
            <p class="product-stock">Stock: ${product.prod_stock}</p>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary">Comprar</button>
            <button class="btn">Agregar al carrito</button>
          </div>
        `;

        productList.appendChild(productItem);

        // Agregar event listeners a los botones
        const btnComprar = productItem.querySelector(".btn.btn-primary");
        const btnCarrito = productItem.querySelector(".btn:not(.btn-primary)");

        btnComprar.addEventListener("click", () => comprarProducto(product));
        btnCarrito.addEventListener("click", () => agregarAlCarrito(product));
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('No se pudieron cargar los productos. Por favor, intenta más tarde.');
    }
  }
});
