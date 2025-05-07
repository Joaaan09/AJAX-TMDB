const datosPelis = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTkxMDZmN2VlMjhlNzVlYzMwNDE1ZjYwNDZiY2NjYSIsIm5iZiI6MTc0NjU0MjYyMS4yNTgsInN1YiI6IjY4MWEyMDFkMTM4OGNlYzZkZTY0MDQxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xL_Y1UvQqUbUkNR3p5zn6u2oGu9yE-Q-wEWHF6n0DXg",
    },
  }
  
  const listaPelis = []
  
  document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.querySelector(".buscador")
    const searchInput = document.querySelector(".search-input")
    const autocompletar = document.getElementById("autocom-box")
    const boton = document.querySelector(".icon")
    const tarjetas = document.querySelector(".tarjetas")
  
    // Configuración buscador
    buscador.addEventListener("input", () => {
      const texto = buscador.value.toLowerCase()
      autocompletar.innerHTML = "" // Limpia resultados anteriores
  
      // Activar o desactivar la clase 'active' según haya texto o no
      if (texto.trim() === "") {
        searchInput.classList.remove("active")
      } else {
        searchInput.classList.add("active")
      }
  
      if (listaPelis.length === 0 || texto.trim() === "") return
  
      const filtrar = listaPelis.filter((peli) => peli.original_title.toLowerCase().includes(texto))
  
      filtrar.forEach((peli) => {
        const item = document.createElement("li")
        const enlace = document.createElement("a")
  
        // Asignamos el texto y el enlace
        enlace.textContent = peli.original_title
        enlace.href = `https://www.imdb.com/es-es/title/${peli.imdb_id}`
        enlace.target = "_blank" // Abre en una nueva pestaña
  
        // Añadimos el enlace al `li`
        item.appendChild(enlace)
  
        // Configuramos el evento para cambiar el valor del buscador al hacer clic
        item.addEventListener("click", () => {
          buscador.value = peli.original_title
          searchInput.classList.remove("active")
        })
  
        // Añadir el `li` al autocompletar
        autocompletar.appendChild(item)
      })
  
      boton.addEventListener("click", () => {
        tarjetas.innerHTML = ""
        const wrapper = document.querySelector(".wrapper");
        wrapper.classList.add("has-results");
  
        filtrar.forEach((peli) => {
          const img = document.createElement("img");
          const enlaceIMG = document.createElement("a");
          const info = document.createElement("p");

          img.src = `https://image.tmdb.org/t/p/w500${peli.poster_path}`
          img.alt = peli.original_title // Añadir texto alternativo para accesibilidad
          info.innerHTML = peli.original_title + "<br>" + peli.release_date;
  
          enlaceIMG.href = `https://www.imdb.com/es-es/title/${peli.imdb_id}`
          enlaceIMG.target = "_blank" // Abre en una nueva pestaña
          enlaceIMG.title = peli.original_title // Añadir título al hover
  
          enlaceIMG.appendChild(img)
          tarjetas.appendChild(enlaceIMG)
          enlaceIMG.appendChild(info);
        })
      })
    })
  
    // Cerrar la lista de autocompletado al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target)) {
        searchInput.classList.remove("active")
      }
    })
  
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  
    // Fetch para obtener las películas
    async function cargarPeliculas() {
      for (let i = 1; i <= 1000; i++) {
        await sleep(1000) // Espera medio segundo entre cada solicitud
        fetch(
          `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${i}&sort_by=popularity.desc`,
          datosPelis,
        )
          .then((res) => res.json())
          .then((data) => {
            data.results.forEach((peli) => {
              fetch(`https://api.themoviedb.org/3/movie/${peli.id}/external_ids`, datosPelis)
                .then((res) => res.json())
                .then((externalData) => {
                  peli.imdb_id = externalData.imdb_id
                  listaPelis.push(peli) // Almacenamos la película con imdb_id
                })
                .catch((err) => console.error(err))
            })
          })
          .catch((err) => console.error(err))
      }
    }
  
    cargarPeliculas()
  })
  