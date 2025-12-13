document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

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

//__________________________________________________________________________
// FUNCIÓN PARA DETECTAR CARACTERES PELIGROSOS (SQL Injection)
  function tieneCaracteresPeligrosos(texto) {
    const patronesPeligrosos = [
      /['"`;\\]/g,  // Caracteres especiales peligrosos
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b)/gi,  // Palabras clave SQL
      /(--|\/\*|\*\/|;)/g  // Comentarios SQL
    ];
    
    return patronesPeligrosos.some(patron => patron.test(texto));
  }

  // VALIDACIÓN EN TIEMPO REAL
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();
    if (email.length > 254) {
      mostrarError(emailInput, "Máximo 254 caracteres");
      emailInput.value = email.substring(0, 254);
    } else if (tieneCaracteresPeligrosos(email)) {
      mostrarError(emailInput, "Caracteres no permitidos en el email");
    } else {
      limpiarError(emailInput);
    }
  });

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    if (password.length > 10) {
      mostrarError(passwordInput, "Máximo 10 caracteres");
      passwordInput.value = password.substring(0, 10);
    } else if (tieneCaracteresPeligrosos(password)) {
      mostrarError(passwordInput, "Caracteres no permitidos en la contraseña");
    } else {
      limpiarError(passwordInput);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valido = true;

    // VALIDACIÓN EMAIL
    const email = emailInput.value.trim();
    if (!email) {
      mostrarError(emailInput, "El correo es obligatorio");
      valido = false;
    } else if (email.length > 254) {
      mostrarError(emailInput, "Máximo 254 caracteres");
      valido = false;
    } else if (!validarEmail(email)) {
      mostrarError(emailInput, "Formato de correo inválido");
      valido = false;
    } else if (tieneCaracteresPeligrosos(email)) {
      mostrarError(emailInput, "El email contiene caracteres peligrosos");
      valido = false;
    } else {
      limpiarError(emailInput);
    }

    // VALIDACIÓN CONTRASEÑA
    const password = passwordInput.value;
    if (!password) {
      mostrarError(passwordInput, "La contraseña es obligatoria");
      valido = false;
    } else if (password.length < 8) {
      mostrarError(passwordInput, "Debe tener al menos 8 caracteres");
      valido = false;
    } else if (password.length > 10) {
      mostrarError(passwordInput, "Máximo 10 caracteres");
      valido = false;
    } else if (tieneCaracteresPeligrosos(password)) {
      mostrarError(passwordInput, "La contraseña contiene caracteres peligrosos");
      valido = false;
    } else {
      limpiarError(passwordInput);
    }

    if (!valido) return;

    // LIMPIAR CARACTERES PELIGROSOS ANTES DE ENVIAR
    const emailLimpio = email.replace(/['"`;\\]/g, '');
    const passwordLimpia = password.replace(/['"`;\\]/g, '');
//__________________________________________________________________________
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar datos del usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify({
          id: data.id,
          email: data.email,
          nombre: data.email.split("@")[0] // Usar la parte del email como nombre
        }));
        window.location.href = "productos.html";
      } else {
        alert("Credenciales inválidas. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
});
