document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");

  const videojuegos = [
    { nombre: "Hollow Knight", genero: "aventura", plataforma: "pc", precio: 15 },
    { nombre: "Dark Souls", genero: "rpg", plataforma: "playstation", precio: 40 },
    { nombre: "Celeste", genero: "indie", plataforma: "switch", precio: 20 },
    { nombre: "Halo Infinite", genero: "accion", plataforma: "xbox", precio: 60 },
    { nombre: "The Witcher 3", genero: "rpg", plataforma: "pc", precio: 25 }
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const search = document.getElementById("search").value.toLowerCase();
    const genre = document.getElementById("genre").value;
    const platform = document.getElementById("platform").value;
    const price = parseFloat(document.getElementById("price").value);

    const resultados = videojuegos.filter((juego) => {
      const coincideNombre = juego.nombre.toLowerCase().includes(search);
      const coincideGenero = genre ? juego.genero === genre : true;
      const coincidePlataforma = platform ? juego.plataforma === platform : true;
      const coincidePrecio = price ? juego.precio <= price : true;

      return coincideNombre && coincideGenero && coincidePlataforma && coincidePrecio;
    });

    mostrarResultados(resultados);
  });

  function mostrarResultados(lista) {
    let resultadosDiv = document.getElementById("resultados");
    if (!resultadosDiv) {
      resultadosDiv = document.createElement("div");
      resultadosDiv.id = "resultados";
      resultadosDiv.classList.add("resultados");
      document.querySelector(".main").appendChild(resultadosDiv);
    }

    resultadosDiv.innerHTML = ""; 

    if (lista.length === 0) {
      resultadosDiv.innerHTML = "<p>No se encontraron videojuegos con esos filtros.</p>";
      return;
    }

    lista.forEach((juego) => {
      const card = document.createElement("div");
      card.classList.add("juego-card");
      card.innerHTML = `
        <h3>${juego.nombre}</h3>
        <p>🎮 Género: ${juego.genero}</p>
        <p>🖥 Plataforma: ${juego.plataforma}</p>
        <p>💲 Precio: $${juego.precio}</p>
      `;
      resultadosDiv.appendChild(card);
    });
  }
});