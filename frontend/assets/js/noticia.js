const path = window.location.pathname;

const slug = path.split("/").pop();

async function cargarNoticia() {

    try {

        const response = await fetch(
            `http://entre-lineas.mywebcommunity.org/api/get-full.php?slug=${slug}`
        );

        const noticia = await response.json();

        renderNoticia(noticia);

    } catch (error) {

        console.error("Error:", error);

    }

}

function renderNoticia(noticia) {

    document.title =
        `Entre Líneas | ${noticia.titulo}`;

    document.getElementById("categoria").textContent =
        noticia.nombre || "NOTICIA";

    document.getElementById("titulo").textContent =
        noticia.titulo;

    document.getElementById("resumen").textContent =
        noticia.resumen;

    document.getElementById("autor-foto").src ='../assets/images/autores/' +
        noticia.foto;

    document.getElementById("autor-nombre").textContent =
        noticia.nombre_autor;

    document.getElementById("fecha").textContent =
        noticia.fecha_publicacion;

    document.getElementById("contenido").innerHTML = `

        <img
            class="cover-image"
            src="${noticia.portada}"
            alt="${noticia.titulo}"
        >

        ${noticia.contenido}

    `;
     console.log(noticia.portada);

}

async function cargarTrending() {

    try {

        const response = await fetch(
            "/api/get-full.php"
        );

        const noticias = await response.json();

        renderTrending(noticias);

    } catch (error) {

        console.error(
            "Error cargando trending:",
            error
        );

    }

}

function renderTrending(noticias) {

    const trendingList =
        document.getElementById("trending-list");

    trendingList.innerHTML = "";

    noticias.slice(0, 5).forEach(noticia => {

        trendingList.innerHTML += `

            <li>

                <a href="/top-top-top/${noticia.slug}">

                    ${noticia.titulo}

                </a>

            </li>

        `;

    });

}

cargarNoticia();
cargarTrending();