document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");

  function mostrarError(input, mensaje) {
    let error = input.parentElement.querySelector(".error-msg");
    if (!error) {
      error = document.createElement("span");
      error.classList.add("error-msg");
      input.parentElement.appendChild(error);
    }
    error.textContent = mensaje;
    input.classList.add("input-error");
  }

  function limpiarError(input) {
    const error = input.parentElement.querySelector(".error-msg");
    if (error) error.remove();
    input.classList.remove("input-error");
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valido = true;

    if (!emailInput.value.trim()) {
      mostrarError(emailInput, "El correo es obligatorio");
      valido = false;
    } else if (!validarEmail(emailInput.value.trim())) {
      mostrarError(emailInput, "Formato de correo inválido");
      valido = false;
    } else {
      limpiarError(emailInput);
    }

    if (!passwordInput.value.trim()) {
      mostrarError(passwordInput, "La contraseña es obligatoria");
      valido = false;
    } else if (passwordInput.value.length < 8) {
      mostrarError(passwordInput, "Debe tener al menos 8 caracteres");
      valido = false;
    } else {
      limpiarError(passwordInput);
    }

    if (confirmInput.value !== passwordInput.value) {
      mostrarError(confirmInput, "Las contraseñas no coinciden");
      valido = false;
    } else {
      limpiarError(confirmInput);
    }

    if (!valido) return;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim()
        })
      });

      if (response.ok) {
        alert("Cuenta creada con éxito 🎉");
        window.location.href = "login.html";
      } else {
        alert("Error al registrar. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
});