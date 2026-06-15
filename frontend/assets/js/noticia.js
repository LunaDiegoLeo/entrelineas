const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const API_BASE = "https://entrelineas.onrender.com/api";
if (slug === null) {
    window.location.replace("index.html");
}

async function cargarNoticia() {

    try {

        const response = await fetch(
            `${API_BASE}/noticias/${slug}`
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

    document.getElementById("autor-foto").src = 'assets/images/autores/' +
        noticia.foto;

    document.getElementById("autor-nombre").textContent =
        noticia.nombre_autor;

    const fecha = new Date(noticia.fecha_publicacion);

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    document.getElementById("fecha").textContent =
        `${meses[fecha.getMonth()]}-${fecha.getFullYear()}`;

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
            `${API_BASE}/noticias`
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
                <a
                    href="noticia.html?slug=${noticia.slug}">

                    ${noticia.titulo}

                </a>

            </li>

        `;

    });

}

cargarNoticia();
cargarTrending();

const html = document.documentElement;
const btnTheme = document.getElementById('btn-theme');

const sensorModoOscuro = window.matchMedia('(prefers-color-scheme: dark)');

function aplicarTemaAutomatico(esOscuro) {
    if (esOscuro) {
        html.classList.add('dark-mode-auto');
        if (btnTheme) btnTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        html.classList.remove('dark-mode-auto');
        if (btnTheme) btnTheme.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

aplicarTemaAutomatico(sensorModoOscuro.matches);

sensorModoOscuro.addEventListener('change', (evento) => {
    aplicarTemaAutomatico(evento.matches);
});

if (btnTheme) {
    btnTheme.addEventListener('click', () => {
        html.classList.toggle('dark-mode-auto');

        if (html.classList.contains('dark-mode-auto')) {
            btnTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            btnTheme.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });
}