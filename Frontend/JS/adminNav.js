// Script para mostrar botón de admin en la barra superior si el usuario es administrador
document.addEventListener('DOMContentLoaded', () => {
	const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

	if (usuario.usr_type === 1) {
		let nav = document.querySelector('.nav');

		// Si no hay nav, crearla
		if (!nav) {
			const header = document.querySelector('.header');
			if (header) {
				nav = document.createElement('nav');
				nav.className = 'nav';
				header.appendChild(nav);
			}
		}

		if (nav) {
			const adminBtn = document.createElement('a');
			adminBtn.href = 'admin.html';
			adminBtn.className = 'btn btn-admin';
			adminBtn.textContent = 'Admin';

			// Insertar el botón al inicio del nav
			nav.insertBefore(adminBtn, nav.firstChild);
		}
	}
});

