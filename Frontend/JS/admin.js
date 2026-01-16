// Panel de Administración
let allGames = [];
let gameToDelete = null;

document.addEventListener('DOMContentLoaded', () => {
	// Verificar si el usuario es admin
	const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
	if (usuario.usr_type !== 1) {
		window.location.href = 'productos.html';
		return;
	}

	loadGames();
	setupEventListeners();
});

function setupEventListeners() {
	// Formulario para agregar juego
	document.getElementById('add-game-form')?.addEventListener('submit', handleAddGame);

	// Formulario para editar juego
	document.getElementById('edit-game-form')?.addEventListener('submit', handleEditGame);
}

async function loadGames() {
	try {
		const response = await fetch('/api/products');
		const data = await response.json();
		allGames = data.products || [];
		renderGamesTable();
	} catch (err) {
		console.error('Error cargando juegos:', err);
		alert('No se pudieron cargar los juegos.');
	}
}

function renderGamesTable() {
	const tbody = document.getElementById('games-tbody');
	const emptyState = document.getElementById('empty-games');
	const template = document.getElementById('game-template');

	if (!tbody || !template) return;

	tbody.innerHTML = '';

	if (allGames.length === 0) {
		emptyState.style.display = 'block';
		return;
	}

	emptyState.style.display = 'none';

	// Mostrar todos los juegos sin paginación
	allGames.forEach(game => {
		const row = template.content.cloneNode(true);
		row.querySelector('.game-id').textContent = game.id;
		row.querySelector('.game-name').textContent = game.prod_name || 'N/A';
		row.querySelector('.game-price').textContent = `$${(game.prod_price || 0).toFixed(2)}`;
		row.querySelector('.game-stock').textContent = game.prod_stock || 0;
		row.querySelector('.game-category').textContent = game.prod_genres || 'N/A';
		row.querySelector('.game-description').textContent = (game.prod_description || 'N/A').substring(0, 50) + '...';

		const imgElement = row.querySelector('.game-thumbnail');
		if (game.prod_img) {
			imgElement.src = game.prod_img;
			imgElement.alt = game.prod_name;
		}

		// Botón editar
		const editBtn = row.querySelector('.btn-edit');
		editBtn?.addEventListener('click', () => openEditModal(game));

		tbody.appendChild(row);
	});
}

function switchTab(tabName) {
	// Ocultar todas las pestañas
	const tabs = document.querySelectorAll('.tab-content');
	tabs.forEach(tab => tab.classList.remove('active'));

	// Desactivar todos los botones
	const buttons = document.querySelectorAll('.tab-btn');
	buttons.forEach(btn => btn.classList.remove('active'));

	// Mostrar pestaña seleccionada
	const selectedTab = document.getElementById(`${tabName}-tab`);
	if (selectedTab) selectedTab.classList.add('active');

	// Activar botón
	event.target.classList.add('active');

	// Si es la pestaña de juegos, renderizar tabla
	if (tabName === 'games') {
		renderGamesTable();
	}
}

function openEditModal(game) {
	const modal = document.getElementById('edit-modal');
	if (!modal) return;

	document.getElementById('edit-game-id').value = game.id;
	document.getElementById('edit-game-name').value = game.prod_name || '';
	document.getElementById('edit-game-price').value = game.prod_price || 0;
	document.getElementById('edit-game-stock').value = game.prod_stock || 0;
	document.getElementById('edit-game-img').value = game.prod_img || '';
	document.getElementById('edit-game-description').value = game.prod_description || '';

	modal.style.display = 'flex';
}

function closeModal() {
	const modal = document.getElementById('edit-modal');
	if (modal) modal.style.display = 'none';
}

async function handleAddGame(e) {
	e.preventDefault();

	const gameData = {
		prod_name: document.getElementById('game-name').value,
		prod_price: parseFloat(document.getElementById('game-price').value),
		prod_stock: parseInt(document.getElementById('game-stock').value),
		prod_genres: document.getElementById('game-category').value,
		prod_description: document.getElementById('game-description').value,
		prod_classification: document.getElementById('game-classification').value,
		prod_company: document.getElementById('game-company').value,
		prod_img: document.getElementById('game-img').value || null
	};

	try {
		const response = await fetch('/products', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gameData)
		});

		if (!response.ok) {
			alert('Error al agregar el juego.');
			return;
		}

		alert('Juego agregado exitosamente.');
		document.getElementById('add-game-form').reset();

		try {
			await loadGames();
			switchTab('games');
		} catch (loadErr) {
			console.error('Error cargando juegos:', loadErr);
		}
	} catch (err) {
		console.error('Error:', err);
		alert('No se pudo agregar el juego.');
	}
}

async function handleEditGame(e) {
	e.preventDefault();

	const gameId = document.getElementById('edit-game-id').value;
	const updatedData = {
		prod_name: document.getElementById('edit-game-name').value,
		prod_price: parseFloat(document.getElementById('edit-game-price').value),
		prod_stock: parseInt(document.getElementById('edit-game-stock').value),
		prod_description: document.getElementById('edit-game-description').value,
		prod_img: document.getElementById('edit-game-img').value || null
	};

	try {
		const response = await fetch(`/products/${gameId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedData)
		});

		if (response.ok) {
			alert('Juego actualizado exitosamente.');
			closeModal();
			loadGames();
		} else {
			alert('Error al actualizar el juego.');
		}
	} catch (err) {
		console.error('Error actualizando juego:', err);
		alert('No se pudo actualizar el juego.');
	}
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
	const editModal = document.getElementById('edit-modal');

	if (e.target === editModal) closeModal();
});
