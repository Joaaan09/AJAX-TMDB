const datosPelis = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTkxMDZmN2VlMjhlNzVlYzMwNDE1ZjYwNDZiY2NjYSIsIm5iZiI6MTc0NjU0MjYyMS4yNTgsInN1YiI6IjY4MWEyMDFkMTM4OGNlYzZkZTY0MDQxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xL_Y1UvQqUbUkNR3p5zn6u2oGu9yE-Q-wEWHF6n0DXg",
  },
}

document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.querySelector(".buscador")
  const searchInput = document.querySelector(".search-input")
  const autocompletar = document.getElementById("autocom-box")
  const boton = document.querySelector(".icon")
  const tarjetas = document.querySelector(".tarjetas")
  const spinner = document.querySelector('.spinner')

  // Variable per emmagatzemar els últims resultats de cerca
  let ultimosResultados = []

  // Event d'input amb un delay per evitar masses crides a l'API
  let timeout
  buscador.addEventListener("input", async () => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      const texto = buscador.value.toLowerCase()
      autocompletar.innerHTML = ""

      if (texto.length < 1) {
        searchInput.classList.remove("active")
        spinner.style.display = 'none'
        return
      }

      searchInput.classList.add("active")
      spinner.style.display = 'flex'
      autocompletar.appendChild(spinner)

      try {
        const data = await cargarPeliculas(texto)
        ultimosResultados = data.results.filter((peli) =>
          peli.original_title.toLowerCase().includes(texto)
        )

        spinner.style.display = 'none'

        // Mostrar resultats a l'autocompletar
        ultimosResultados.forEach((peli) => {
          const item = document.createElement("li")
          const enlace = document.createElement("a")

          enlace.textContent = peli.original_title
          enlace.href = `https://www.imdb.com/es-es/title/${peli.imdb_id}`
          enlace.target = "_blank"

          item.appendChild(enlace)
          item.addEventListener("click", () => {
            buscador.value = peli.original_title
            searchInput.classList.remove("active")
          })
          autocompletar.appendChild(item)
        })

      } catch (error) {
        console.error('Error:', error)
        spinner.style.display = 'none'
      }
    }, 200) // Espera 200ms després de deixar d'escriure
  })

  // Event del botó de cerca
  boton.addEventListener("click", async () => {
    const texto = buscador.value.toLowerCase()
    if (texto.length < 1) return

    tarjetas.innerHTML = ""
    const wrapper = document.querySelector(".wrapper")
    wrapper.classList.add("has-results")
    
    // Utilitza els últims resultats ja carregats
    if (ultimosResultados.length === 0) {
      // Si no hi ha resultats recents, fem una nova cerca
      const data = await cargarPeliculas(texto)
      ultimosResultados = data.results.filter((peli) =>
        peli.original_title.toLowerCase().includes(texto)
      )
    }

    // Mostrar resultats a les targetes
    ultimosResultados.forEach((peli) => {
      const img = document.createElement("img")
      const enlaceIMG = document.createElement("a")
      const info = document.createElement("p")

      img.src = peli.poster_path 
        ? `https://image.tmdb.org/t/p/w500${peli.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image'
      img.alt = peli.original_title
      info.innerHTML = `
        <h2>${peli.original_title}</h2>
        <br> 🗓️ ${peli.release_date || 'Data no disponible'}
        <br> 🎬 ${peli.genereId || 'Gènere no disponible'}
        <br> 👥 ${peli.actores || 'Actors no disponibles'}
      `

      enlaceIMG.href = peli.imdb_id 
        ? `https://www.imdb.com/es-es/title/${peli.imdb_id}`
        : '#'
      enlaceIMG.target = "_blank"

      enlaceIMG.appendChild(img)
      tarjetas.appendChild(enlaceIMG)
      enlaceIMG.appendChild(info)
    })
  })

  // Funció per carregar dades de pel·lícules des de l'API
  async function cargarPeliculas(query) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${query}&language=en-US`,
        datosPelis
      )
      const data = await res.json()

      // Obtenir dades addicionals (IMDB ID, gèneres, actors)
      for (const peli of data.results) {
        try {
          // Obtenir l'ID d'IMDB
          const externalRes = await fetch(
            `https://api.themoviedb.org/3/movie/${peli.id}/external_ids`,
            datosPelis
          )
          const externalData = await externalRes.json()
          peli.imdb_id = externalData.imdb_id

          // Obtenir gèneres
          const genreRes = await fetch(
            `https://api.themoviedb.org/3/movie/${peli.id}?language=en-US`,
            datosPelis
          )
          const genreData = await genreRes.json()
          peli.genereId = genreData.genres?.map(g => g.name).join(", ") || ''

          // Obtenir actors
          const actores = await fetch(
            `https://api.themoviedb.org/3/movie/${peli.id}/credits?language=en-US`,
            datosPelis
          )
          const actoresData = await actores.json()
          peli.actores = actoresData.cast?.slice(0, 3).map(actor => actor.name).join(", ") || ''

        } catch (err) {
          console.error("Error en obtenir dades addicionals:", err)
          // Valors per defecte en cas d'error
          peli.imdb_id = peli.imdb_id || null
          peli.genereId = peli.genereId || 'No disponible'
          peli.actores = peli.actores || 'No disponible'
        }
      }
      return data

    } catch (err) {
      console.error("Error en obtenir pel·lícules:", err)
      return { results: [] }
    }
  }
})