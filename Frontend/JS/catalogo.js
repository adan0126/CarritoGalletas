document.addEventListener("DOMContentLoaded", () => {
  const productos = document.querySelectorAll(".product-item");

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

  productos.forEach((item) => {
    const nombre = item.querySelector(".product-name").textContent;
    const precio = item.querySelector(".product-price").textContent;
    const img = item.querySelector(".product-img").getAttribute("src");

    const btnComprar = item.querySelector(".btn.btn-primary");
    const btnCarrito = item.querySelector(".btn:not(.btn-primary)");

    btnComprar.addEventListener("click", () => comprarProducto(nombre, precio, img));
    btnCarrito.addEventListener("click", () => agregarAlCarrito(nombre, precio, img));
  });
});