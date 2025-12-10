document.addEventListener("DOMContentLoaded", () => {
  const productList = document.querySelector(".product-list");
  const totalDiv = document.querySelector(".cart-total p");
  const finalizarBtn = document.querySelector(".btn-primary");

  function actualizarTotal() {
    const precios = document.querySelectorAll(".product-price");
    let total = 0;

    precios.forEach((precioEl) => {
      const valor = parseFloat(precioEl.textContent.replace("$", ""));
      total += valor;
    });

    totalDiv.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;
  }

  function agregarBotonesEliminar() {
    const items = document.querySelectorAll(".product-item");
    items.forEach((item) => {
      if (!item.querySelector(".remove-btn")) {
        const btn = document.createElement("button");
        btn.textContent = "Eliminar";
        btn.classList.add("btn", "remove-btn");
        btn.addEventListener("click", () => {
          item.remove();
          actualizarTotal();
          guardarCarrito();
        });
        item.appendChild(btn);
      }
    });
  }

  function guardarCarrito() {
    const items = [];
    document.querySelectorAll(".product-item").forEach((item) => {
      items.push({
        nombre: item.querySelector(".product-name").textContent,
        precio: item.querySelector(".product-price").textContent,
        img: item.querySelector(".product-img").getAttribute("src")
      });
    });
    localStorage.setItem("carrito", JSON.stringify(items));
  }

  function cargarCarrito() {
    const data = localStorage.getItem("carrito");
    if (data) {
      const items = JSON.parse(data);
      productList.innerHTML = ""; 
      items.forEach((juego) => {
        const div = document.createElement("div");
        div.classList.add("product-item");
        div.innerHTML = `
          <img src="${juego.img}" alt="${juego.nombre}" class="product-img" />
          <div class="product-info">
            <h2 class="product-name">${juego.nombre}</h2>
            <p class="product-price">${juego.precio}</p>
          </div>
        `;
        productList.appendChild(div);
      });
    }
    agregarBotonesEliminar();
    actualizarTotal();
  }

  finalizarBtn.addEventListener("click", () => {
    alert("Gracias por tu compra . ¡Disfruta tus juegos!");
    localStorage.removeItem("carrito"); 
    productList.innerHTML = "";
    actualizarTotal();
  });

  cargarCarrito();
});