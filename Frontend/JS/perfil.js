document.addEventListener("DOMContentLoaded", () => {
  const nombreEl = document.querySelector(".card-title");
  const correoEl = document.querySelector(".profile-details p");
  const logoutForm = document.querySelector(".profile-actions form");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    nombreEl.textContent = usuario.nombre || "Usuario";
    correoEl.innerHTML = `<strong>Correo:</strong> ${usuario.email || "No definido"}`;
  }

  logoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    localStorage.removeItem("usuario");
    localStorage.removeItem("carrito");
    sessionStorage.clear();

    window.location.href = "./logout.html";
  });
});