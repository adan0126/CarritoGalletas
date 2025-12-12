document.addEventListener("DOMContentLoaded", () => {
  const footerLinks = document.querySelector(".form-footer");
  const subtitle = document.querySelector(".card-subtitle");

  const usuarioData = localStorage.getItem("usuario");

  if (usuarioData) {
    const usuario = JSON.parse(usuarioData);
    footerLinks.innerHTML = "";

    const perfilBtn = document.createElement("a");
    perfilBtn.href = "./perfil.html";
    perfilBtn.textContent = "Ir a mi perfil";
    perfilBtn.classList.add("btn", "btn-primary");

    const logoutBtn = document.createElement("a");
    logoutBtn.href = "./logout.html";
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.classList.add("btn");

    footerLinks.appendChild(perfilBtn);
    footerLinks.appendChild(logoutBtn);

    subtitle.textContent = `Bienvenido de nuevo, ${usuario.nombre || usuario.email}. ¡Explora tu catálogo personalizado!`;
  } else {
    footerLinks.querySelectorAll("a").forEach((btn) => {
      btn.style.opacity = 0;
      setTimeout(() => {
        btn.style.transition = "opacity 1s";
        btn.style.opacity = 1;
      }, 300);
    });
  }
});
