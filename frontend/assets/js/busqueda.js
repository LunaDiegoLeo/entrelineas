const tipoBusqueda = document.getElementById("tipoBusqueda");
const camposBusqueda = document.getElementById("camposBusqueda");

const buscarBtn = document.getElementById("buscarBtn");

const resultados = document.getElementById("resultados");
const pagination = document.getElementById("pagination");

let noticiasGlobal = [];

let paginaActual = 1;

const noticiasPorPagina = 5;
const API_BASE = "https://entrelineas.onrender.com/api";

// CAMBIAR CAMPOS
tipoBusqueda.addEventListener("change", async () => {

    const tipo = tipoBusqueda.value;

    camposBusqueda.innerHTML = "";

    // TITULO
    if (tipo === "titulo") {

        camposBusqueda.innerHTML = `
    
        <input
            type="text"
            id="titulo"
            class="input"
            placeholder="Buscar título..."
        >
    
    `;

        // LIVE SEARCH
        const input =
            document.getElementById("titulo");

        let timeout;

        input.addEventListener("input", () => {

            clearTimeout(timeout);

            timeout = setTimeout(async () => {

                const valor =
                    input.value.trim();

                // VACÍO
                if (valor === "") {

                    resultados.innerHTML = "";

                    pagination.innerHTML = "";

                    return;

                }

                resultados.innerHTML = `
            
                <div class="search-loading">
                    Buscando...
                </div>
            
            `;

                try {

                    const response = await fetch(
                        `${API_BASE}/noticias/buscar?titulo=${encodeURIComponent(valor)}`

                    );

                    let noticias =
                        await response.json();

                    if (!Array.isArray(noticias)) {

                        noticias = noticias
                            ? [noticias]
                            : [];

                    }

                    noticiasGlobal = noticias;

                    paginaActual = 1;

                    renderPagina();

                } catch (error) {

                    console.error(error);

                }

            }, 350);

        });

    }

    // CATEGORIA
    else if (tipo === "categoria") {

        camposBusqueda.innerHTML = `
        
            <select id="categoria" class="input" required>
                <option value="">
                    Selecciona categoría
                </option>
            </select>
        
        `;

        cargarCategorias();

    }

    // AUTOR
    else if (tipo === "autor") {

        camposBusqueda.innerHTML = `
        
            <select id="autor" class="input" required>
                <option value="">
                    Selecciona autor
                </option>
            </select>
        
        `;

        cargarAutores();

    }

    // FECHAS
    else if (tipo === "fecha") {

        camposBusqueda.innerHTML = `
        
            <div class="date-grid">
                <input
                    type="text" 
                    id="fecha_inicio"
                    class="input" placeholder="Fecha inicio"
                    onfocus="(this.type='date')" 
                    onblur="if(!this.value) this.type='text'"
                >

                <input
                    type="text" 
                    id="fecha_fin"
                    class="input" placeholder="Fecha fin"
                    onfocus="(this.type='date')" 
                    onblur="if(!this.value) this.type='text'"
                >

            </div>
        
        `;

    }

});


// CARGAR CATEGORIAS
async function cargarCategorias() {

    const response = await fetch(
        `${API_BASE}/categorias`
    );

    const categorias = await response.json();

    const select = document.getElementById("categoria");

    categorias.forEach(cat => {

        select.innerHTML += `
        
            <option value="${cat.id_categoria}">
                ${cat.nombre}
            </option>
        
        `;

    });

}


// CARGAR AUTORES
async function cargarAutores() {

    const response = await fetch(
        `${API_BASE}/autores`
    );

    const autores = await response.json();

    const select = document.getElementById("autor");

    autores.forEach(autor => {

        select.innerHTML += `
        
            <option value="${autor.id_autor}">
                ${autor.nombre_autor}
            </option>
        
        `;

    });

}


// BUSCAR
buscarBtn.addEventListener("click", async () => {

    const tipo = tipoBusqueda.value;

    let url = "";

    // TITULO
    if (tipo === "titulo") {

        const titulo =
            document.getElementById("titulo").value;

        url =
            `${API_BASE}/noticias/buscar?titulo=${encodeURIComponent(titulo)}`;

    }

    // CATEGORIA
    else if (tipo === "categoria") {

        const categoria =
            document.getElementById("categoria").value;

        url =
            `${API_BASE}/categorias/${categoria}/noticias`;

    }

    // AUTOR
    else if (tipo === "autor") {

        const autor =
            document.getElementById("autor").value;

        url =
            `${API_BASE}/autores/${autor}/noticias`;

    }

    // FECHAS
    else if (tipo === "fecha") {

        const inicio =
            document.getElementById("fecha_inicio").value;

        const fin =
            document.getElementById("fecha_fin").value;

        url =
            `${API_BASE}/noticias/fechas?fecha_inicio=${inicio}&fecha_fin=${fin}`;

    }

    if (!url) return;

    const response = await fetch(url);

    let noticias = await response.json();

    if (!Array.isArray(noticias)) {

        noticias = noticias ? [noticias] : [];

    }

    // LIMPIAR INVALIDAS
    noticias = noticias.filter(n =>
        n &&
        n.slug &&
        n.titulo
    );

    noticiasGlobal = noticias;

    paginaActual = 1;

    renderPagina();

});


// RENDER PAGINA
function renderPagina() {

    resultados.innerHTML = "";

    // SI NO HAY RESULTADOS
    if (
        !noticiasGlobal ||
        noticiasGlobal.length === 0 ||
        noticiasGlobal[0] == null
    ) {

        resultados.innerHTML = `
        
            <div class="empty-state">

                <h2 class="marker-text">
                    No encontramos nada vv
                </h2>

                <p>
                    Intenta buscar otra cosa,
                    cambiar filtros
                    o escribir diferente.
                </p>

            </div>
        
        `;

        pagination.innerHTML = "";

        return;

    }

    const inicio =
        (paginaActual - 1) * noticiasPorPagina;

    const fin =
        inicio + noticiasPorPagina;

    const noticiasPagina =
        noticiasGlobal.slice(inicio, fin);

    noticiasPagina.forEach((noticia, index) => {

        if (
            !noticia ||
            !noticia.slug ||
            !noticia.titulo
        ) {
            return;
        }

        const color =
            index % 2 === 0
                ? "bg-purple"
                : "bg-green";

        const button =
            index % 2 === 0
                ? "btn-green"
                : "btn-purple";

        resultados.innerHTML += `
        
            <article class="card">

                <div
                    class="card-image ${color}"
                    style="
                        background-image:
                        linear-gradient(
                            rgba(0,0,0,0.25),
                            rgba(0,0,0,0.25)
                        ),
                        url('${noticia.portada}');
                        background-size: cover;
                        background-position: center;
                    "
                ></div>

                <h3>${noticia.titulo}</h3>

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

    renderPagination();

}


function cambiarPagina(numero) {

    paginaActual = numero;

    renderPagina();

}

function renderPagination() {

    pagination.innerHTML = "";

    const totalPaginas = Math.ceil(
        noticiasGlobal.length /
        noticiasPorPagina
    );

    // SI SOLO HAY 1 PAGINA
    if (totalPaginas <= 1) {

        return;

    }

    // BOTON ANTERIOR
    if (paginaActual > 1) {

        pagination.innerHTML += `
        
            <button
                class="page-btn"
                onclick="cambiarPagina(${paginaActual - 1})"
            >
                ←
            </button>
        
        `;

    }

    // PAGINAS
    for (let i = 1; i <= totalPaginas; i++) {

        pagination.innerHTML += `
        
            <button
                class="
                    page-btn
                    ${i === paginaActual ? "active" : ""}
                "
                onclick="cambiarPagina(${i})"
            >
                ${i}
            </button>
        
        `;

    }

    // BOTON SIGUIENTE
    if (paginaActual < totalPaginas) {

        pagination.innerHTML += `
        
            <button
                class="page-btn"
                onclick="cambiarPagina(${paginaActual + 1})"
            >
                →
            </button>
        
        `;

    }

}

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