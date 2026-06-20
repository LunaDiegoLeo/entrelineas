console.log("JS CARGADO");
const newsContainer = document.getElementById("news-container");
const authorsContainer = document.getElementById("authors-container");



const API_BASE = "https://entrelineas.onrender.com/api";



async function cargarNoticias() {

    try {

        const response = await fetch(
            `${API_BASE}/noticias`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ERROR: ${response.status}`
            );
        }

        const noticias = await response.json();

        console.log("Noticias:", noticias);

        // Si viene una sola noticia
        if (!Array.isArray(noticias)) {
            renderNoticias([noticias]);
            return;
        }

        renderNoticias(noticias);

    } catch (error) {

        console.error(
            "Error cargando noticias:",
            error
        );

        newsContainer.innerHTML = `
            <p style="font-size:1.2rem;">
                Error cargando noticias.
            </p>
        `;
    }
}

function renderNoticias(noticias) {

    if (!newsContainer) {
        console.error(
            "No existe #news-container"
        );
        return;
    }

    newsContainer.innerHTML = "";

    noticias.forEach((noticia, index) => {

        const color =
            index % 2 === 0
                ? "bg-purple"
                : "bg-green";

        const button =
            index % 2 === 0
                ? "btn-green"
                : "btn-purple";

        const portada =
            noticia.portada && noticia.portada !== ""
                ? noticia.portada
                : "assets/images/default.jpg";

        newsContainer.innerHTML += `
        
            <article class="card news-card">

                <div 
                    class="card-image ${color}"
                    style="
                        background-image:
                        linear-gradient(
                            rgba(0,0,0,0.25),
                            rgba(0,0,0,0.25)
                        ),
                        url('${portada}');
                        background-size: cover;
                        background-position: center;
                    "
                ></div>

                <h3>
                    ${noticia.titulo}
                </h3>

                <p>
                    ${noticia.resumen}
                </p>

                <a 
                    href="noticia.html?slug=${noticia.slug}"
                    class="btn ${button}"
                >
                    Leer más
                </a>

            </article>

        `;
    });

    aplicarRotaciones();
}

/* =========================
   AUTORES
========================= */

async function cargarAutores() {

    try {

        const response = await fetch(
            `${API_BASE}/autores/index`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ERROR: ${response.status}`
            );
        }

        const autores = await response.json();

        console.log("Autores:", autores);

        if (!Array.isArray(autores)) {
            renderAutores([autores]);
            return;
        }

        renderAutores(autores);

    } catch (error) {

        console.error(
            "Error cargando autores:",
            error
        );

        authorsContainer.innerHTML = `
            <p style="font-size:1.2rem;">
                Error cargando autores.
            </p>
        `;
    }
}

function renderAutores(autores) {

    if (!authorsContainer) {
        console.error(
            "No existe #authors-container"
        );
        return;
    }

    authorsContainer.innerHTML = "";

    autores.forEach((autor, index) => {

        const placeholder =
            `placeholder-${(index % 3) + 1}`;

        const foto =
            autor.foto && autor.foto !== ""
                ? "assets/images/autores/" + autor.foto
                : "assets/images/autores/default-autor.png";

        authorsContainer.innerHTML += `
        
            <div class="polaroid">

                <div class="tape tape-corner"></div>

                <div 
                    class="polaroid-img ${placeholder}"
                    style="
                        background-image:
                        url('${foto}');
                        background-size: cover;
                        background-position: center;
                    "
                ></div>

                <p class="marker-text">
                    ${autor.nombre_autor}
                </p>

                <p class="bio">
                    ${autor.bio}
                </p>
                <br>
                <button class="btn btn-purple"
                    onclick="obtenerNoticiasPorAutor('${autor.id_autor}', '${autor.nombre_autor}')"
                >
                    Ver noticias
                </button>

            </div>

        `;
    });

    aplicarRotaciones();
}

async function obtenerNoticiasPorAutor(idAutor, nombreAutor) {
    const modal = document.getElementById("modal-autor");
    const modalTitulo = document.getElementById("modal-autor-titulo");
    const modalContenido = document.getElementById("modal-autor-contenido");

    modalTitulo.textContent = `Noticias de ${nombreAutor}`;
    modalContenido.innerHTML = `<p style="text-align:center;">Buscando en los archivos... 🕵️‍♀️</p>`;
    modal.style.display = "flex";

    try {
        const response = await fetch(`${API_BASE}/autores/${idAutor}/noticias`);

        if (!response.ok) {
            throw new Error("No pudimos cargar las noticias de esta beba.");
        }

        const noticias = await response.json();

        if (!noticias || noticias.length === 0) {
            modalContenido.innerHTML = `<p style="text-align:center;">Este autor aún no tiene columnas publicadas. 📭</p>`;
            return;
        }

        modalContenido.innerHTML = "";
        noticias.forEach(noticia => {
            modalContenido.innerHTML += `
                <div class="noticia-mini-card" style="display: flex; flex-direction: column; gap: 12px; padding: 15px;">
                    
                    <img src="${noticia.portada}" alt="Portada" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
                    
                    <h4 style="margin: 0; font-size: 1.25rem;">${noticia.titulo}</h4>
                    <p style="margin: 0; font-size: 0.95rem; line-height: 1.4;">${noticia.resumen || "Sin resumen disponible."}</p>
                    
                    <a href="noticia.html?slug=${noticia.slug}" class="btn btn-purple" style="align-self: flex-start; margin-top: 5px;">
                        Leer completa
                    </a>
                    
                </div>
            `;
        });

    } catch (error) {
        modalContenido.innerHTML = `<p style="text-align:center; color:red;">Error: ${error.message}</p>`;
    }
}

function cerrarModalAutor() {
    document.getElementById("modal-autor").style.display = "none";
}

/* =========================
   EFECTOS VISUALES
========================= */

function aplicarRotaciones() {

    const elements =
        document.querySelectorAll(
            '.card, .polaroid'
        );

    elements.forEach(el => {

        const randomRotation =
            Math.floor(Math.random() * 9) - 4;

        el.dataset.rotation =
            randomRotation;

        el.style.transform =
            `rotate(${randomRotation}deg)`;

        el.addEventListener('mouseenter', () => {

            el.style.transform =
                `rotate(0deg) scale(1.05) translateY(-5px)`;

        });

        el.addEventListener('mouseleave', () => {

            el.style.transform =
                `rotate(${el.dataset.rotation}deg)`;

        });
    });
}

/* =========================
   NAVBAR SCROLL
========================= */

window.addEventListener("scroll", () => {

    const navbar =
        document.querySelector(".navbar");

    if (!navbar) return;

    if (window.scrollY > 40) {

        navbar.classList.add("navbar-scrolled");

    } else {

        navbar.classList.remove(
            "navbar-scrolled"
        );
    }
});

/* =========================
   INIT
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarNoticias();
        cargarAutores();

    }
);

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