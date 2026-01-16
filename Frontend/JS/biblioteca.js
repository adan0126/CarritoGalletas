document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const libraryContainer = document.getElementById('history-tbody');
  const emptyMessage = document.getElementById('empty-message');
  const sortSelect = document.getElementById('sort-by');

  if (!usuario || !usuario.id) {
    alert('Debes iniciar sesión para ver tu biblioteca.');
    window.location.href = 'login.html';
    return;
  }

  let allItems = [];

  function sortItems(items, sortBy) {
    const sorted = [...items];

    switch(sortBy) {
      case 'price-desc':
        sorted.sort((a, b) => (b.product?.prod_price || 0) - (a.product?.prod_price || 0));
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.product?.prod_price || 0) - (b.product?.prod_price || 0));
        break;
      case 'name':
        sorted.sort((a, b) => {
          const nameA = (a.product?.prod_name || '').toLowerCase();
          const nameB = (b.product?.prod_name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'default':
      default:
        sorted.sort((a, b) => a.id - b.id);
        break;
    }

    return sorted;
  }

  function renderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      libraryContainer.innerHTML = '';
      if (emptyMessage) emptyMessage.style.display = '';
      return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';
    libraryContainer.innerHTML = '';

    items.forEach(libItem => {
      const p = libItem.product || {};
      const nombre = p.prod_name || 'Producto';
      const img = p.prod_img || '';
      const precio = p.prod_price || 0;
      const cantidad = libItem.lib_quantity || 1;

      const row = document.createElement('tr');
      row.className = 'purchase-row';
      row.innerHTML = `
        <td class="product-img-cell">
          <img src="${img}" alt="${nombre}" class="product-thumbnail" />
        </td>
        <td class="product-name-cell">
          <span class="game-name">${nombre}</span>
        </td>
        <td class="price-cell">
          <span class="purchase-price">$${precio.toFixed(2)}</span>
        </td>
        <td class="quantity-cell">
          <span class="game-quantity">${cantidad}</span>
        </td>
      `;
      libraryContainer.appendChild(row);
    });

    updateStats(items);
  }

  function updateStats(items) {
    const totalGames = document.getElementById('total-games');
    const totalPurchases = document.getElementById('total-purchases');
    const totalSpent = document.getElementById('total-spent');

    if (totalGames) totalGames.textContent = items.length;
    if (totalPurchases) totalPurchases.textContent = items.length;

    let spent = 0;
    items.forEach(it => {
      spent += (it.product?.prod_price || 0) * (it.lib_quantity || 1);
    });
    if (totalSpent) totalSpent.textContent = `$${spent.toFixed(2)}`;
  }

  async function cargarBiblioteca() {
    try {
      const resp = await fetch(`/api/library?userId=${encodeURIComponent(usuario.id)}`);
      const data = await resp.json();
      const items = (data && data.items) || [];

      allItems = items;
      renderItems(sortItems(items, 'default'));
    } catch (error) {
      console.error('Error cargando biblioteca:', error);
      alert('No se pudo cargar la biblioteca.');
    }
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortedItems = sortItems(allItems, e.target.value);
      renderItems(sortedItems);
    });
  }

  cargarBiblioteca();
});
