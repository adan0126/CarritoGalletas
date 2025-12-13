document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cambiarPasswordForm");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Verificar si hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.email) {
    alert("Debes iniciar sesión para cambiar la contraseña.");
    window.location.href = "/login";
    return;
  }

  function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + "Error");
    
    if (error) {
      error.textContent = mensaje;
      input.classList.add("input-error");
    }
  }

  function limpiarError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + "Error");
    
    if (error) {
      error.textContent = "";
      input.classList.remove("input-error");
    }
  }

  // Función para detectar caracteres peligrosos (SQL Injection)
  function tieneCaracteresPeligrosos(texto) {
    const patronesPeligrosos = [
      /['"`;\\]/g,
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b)/gi,
      /(--|\/\*|\*\/|;)/g
    ];
    
    return patronesPeligrosos.some(patron => patron.test(texto));
  }

  // Validación en tiempo real
  currentPasswordInput.addEventListener("input", () => {
    const valor = currentPasswordInput.value;
    if (valor.length > 10) {
      mostrarError("currentPassword", "Máximo 10 caracteres");
      currentPasswordInput.value = valor.substring(0, 10);
    } else if (tieneCaracteresPeligrosos(valor)) {
      mostrarError("currentPassword", "Caracteres no permitidos");
    } else {
      limpiarError("currentPassword");
    }
  });

  newPasswordInput.addEventListener("input", () => {
    const valor = newPasswordInput.value;
    if (valor.length > 10) {
      mostrarError("newPassword", "Máximo 10 caracteres");
      newPasswordInput.value = valor.substring(0, 10);
    } else if (tieneCaracteresPeligrosos(valor)) {
      mostrarError("newPassword", "Caracteres no permitidos");
    } else {
      limpiarError("newPassword");
    }
  });

  confirmPasswordInput.addEventListener("input", () => {
    const valor = confirmPasswordInput.value;
    if (valor.length > 10) {
      mostrarError("confirmPassword", "Máximo 10 caracteres");
      confirmPasswordInput.value = valor.substring(0, 10);
    } else if (tieneCaracteresPeligrosos(valor)) {
      mostrarError("confirmPassword", "Caracteres no permitidos");
    } else {
      limpiarError("confirmPassword");
    }
  });

  // Enviar formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valido = true;

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validación contraseña actual
    if (!currentPassword) {
      mostrarError("currentPassword", "La contraseña actual es obligatoria");
      valido = false;
    } else if (currentPassword.length > 10) {
      mostrarError("currentPassword", "Máximo 10 caracteres");
      valido = false;
    } else if (tieneCaracteresPeligrosos(currentPassword)) {
      mostrarError("currentPassword", "Contiene caracteres peligrosos");
      valido = false;
    } else {
      limpiarError("currentPassword");
    }

    // Validación nueva contraseña
    if (!newPassword) {
      mostrarError("newPassword", "La nueva contraseña es obligatoria");
      valido = false;
    } else if (newPassword.length < 8) {
      mostrarError("newPassword", "Mínimo 8 caracteres");
      valido = false;
    } else if (newPassword.length > 10) {
      mostrarError("newPassword", "Máximo 10 caracteres");
      valido = false;
    } else if (tieneCaracteresPeligrosos(newPassword)) {
      mostrarError("newPassword", "Contiene caracteres peligrosos");
      valido = false;
    } else if (currentPassword === newPassword) {
      mostrarError("newPassword", "La nueva contraseña no puede ser igual a la actual");
      valido = false;
    } else {
      limpiarError("newPassword");
    }

    // Validación confirmación
    if (!confirmPassword) {
      mostrarError("confirmPassword", "Confirma la nueva contraseña");
      valido = false;
    } else if (confirmPassword.length > 10) {
      mostrarError("confirmPassword", "Máximo 10 caracteres");
      valido = false;
    } else if (tieneCaracteresPeligrosos(confirmPassword)) {
      mostrarError("confirmPassword", "Contiene caracteres peligrosos");
      valido = false;
    } else if (newPassword !== confirmPassword) {
      mostrarError("confirmPassword", "Las contraseñas no coinciden");
      valido = false;
    } else {
      limpiarError("confirmPassword");
    }

    if (!valido) return;

    // Limpiar caracteres peligrosos
    const currentPasswordLimpia = currentPassword.replace(/['"`;\\]/g, '');
    const newPasswordLimpia = newPassword.replace(/['"`;\\]/g, '');

    try {
      const response = await fetch("/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usuario.email,
          currentPassword: currentPasswordLimpia,
          newPassword: newPasswordLimpia
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Contraseña actualizada correctamente");
        window.location.href = "/perfil";
      } else {
        alert(`❌ Error: ${data.message || "No se pudo cambiar la contraseña"}`);
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  });
});