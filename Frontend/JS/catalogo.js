document.addEventListener("DOMContentLoaded", async () => {
  // Cargar productos desde el servidor
  await cargarProductos();

  function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
  }

  function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  function agregarAlCarrito(nombre, precio, img) {
    const carrito = obtenerCarrito();
    carrito.push({ nombre, precio, img });
    guardarCarrito(carrito);
    alert(`${nombre} fue agregado al carrito `);
  }

  function comprarProducto(nombre, precio, img) {
    alert(`Compraste ${nombre} por ${precio} `);
    agregarAlCarrito(nombre, precio, img);
    window.location.href = "carrito.html";
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

        btnComprar.addEventListener("click", () =>
          comprarProducto(product.prod_name, `$${product.prod_price.toFixed(2)}`, product.prod_img)
        );
        btnCarrito.addEventListener("click", () =>
          agregarAlCarrito(product.prod_name, `$${product.prod_price.toFixed(2)}`, product.prod_img)
        );
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('No se pudieron cargar los productos. Por favor, intenta más tarde.');
    }
  }
});
