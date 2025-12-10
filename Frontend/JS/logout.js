document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("carrito");   
  localStorage.removeItem("usuario");   
  sessionStorage.clear();               

  fetch("/logout", { method: "POST" })
    .catch(err => console.warn("No se pudo notificar al backend:", err));

  setTimeout(() => {
    window.location.href = "./main.html";
  }, 5000);
});