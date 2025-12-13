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
    // SIN alert aquí
  }

  function comprarProducto(nombre, precio, img) {
    agregarAlCarrito(nombre, precio, img);
    alert(`Añadiste al carrito ${nombre} por ${precio} `); // SOLO UNA alerta
    window.location.href = "/carrito";
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

      productList.innerHTML = '';

      data.products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";

        // Corregí "carrioto" a "carrito"
        productItem.innerHTML = `
          <img src="${product.prod_img}" alt="${product.prod_name}" class="product-img" />
          <div class="product-info">
            <h2 class="product-name">${product.prod_name}</h2>
            <p class="product-price">$${product.prod_price.toFixed(2)}</p>
            <p class="product-genres">${product.prod_genres.join(', ')}</p>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary">Añadir al carrito</button>
          </div>
        `;

        productList.appendChild(productItem);

        const btnComprar = productItem.querySelector(".btn.btn-primary");
        
        btnComprar.addEventListener("click", () =>
          comprarProducto(product.prod_name, `$${product.prod_price.toFixed(2)}`, product.prod_img)
        );
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      alert('No se pudieron cargar los productos. Por favor, intenta más tarde.');
    }
  }
});