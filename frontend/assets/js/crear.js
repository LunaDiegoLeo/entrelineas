// VARIABLES GLOBALES
const bloquesContainer = document.getElementById("bloques-container");
const previewContenido = document.getElementById("preview-contenido");
let contadorBloques = 0;

// ESCUCHADORES EN TIEMPO REAL (Para el panel izquierdo)
document.getElementById("input-titulo").addEventListener("input", (e) => {
    document.getElementById("preview-titulo").textContent = e.target.value || "Aquí aparecerá el título";
});

document.getElementById("input-resumen").addEventListener("input", (e) => {
    document.getElementById("preview-resumen").textContent = e.target.value || "Aquí aparecerá el resumen";
});

document.getElementById("input-portada").addEventListener("input", (e) => {
    const img = document.getElementById("preview-portada");
    img.src = e.target.value;
    img.style.display = e.target.value ? "block" : "none";
});

// SISTEMA DE BLOQUES
function agregarBloque(tipo) {
    contadorBloques++;
    const id = `bloque-${contadorBloques}`;
    const div = document.createElement("div");
    div.className = "block-card";
    div.id = id;

    let innerHTML = `<button class="delete-btn" onclick="borrarBloque('${id}')">X</button>`;

    if (tipo === 'parrafo') {
        innerHTML += `<label>Párrafo:</label>
                      <textarea class="bloque-input" data-tipo="p" rows="4" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'subtitulo') {
        innerHTML += `<label>Subtítulo (H2):</label>
                      <input type="text" class="bloque-input" data-tipo="h2" oninput="actualizarVistaPrevia()">`;
    } else if (tipo === 'cita') {
        innerHTML += `<label>Cita Blockquote:</label>
                      <textarea class="bloque-input" data-tipo="blockquote" rows="2" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'imagen') {
        innerHTML += `<label>URL de Imagen Interna:</label>
                      <input type="text" class="bloque-input" data-tipo="img" placeholder="https://..." oninput="actualizarVistaPrevia()">
                      <input type="text" class="bloque-input mt-2" data-tipo="img-alt" placeholder="Descripción de la imagen (Alt)" oninput="actualizarVistaPrevia()">`;
    }

    div.innerHTML = innerHTML;
    bloquesContainer.appendChild(div);
}

function borrarBloque(id) {
    document.getElementById(id).remove();
    actualizarVistaPrevia();
}

// CONVERTIR LOS BLOQUES A HTML PURO (Para vista previa y SQL)
function generarHTMLdelContenido() {
    let htmlFinal = "";
    const bloques = document.querySelectorAll(".block-card");

    bloques.forEach(bloque => {
        const inputs = bloque.querySelectorAll(".bloque-input");
        const tipo = inputs[0].getAttribute("data-tipo");
        let valor = inputs[0].value.trim();

        if (!valor) return;

        // Convertir saltos de línea (\n) en etiquetas <br>
        valor = valor.replace(/\n/g, "<br>");

        if (tipo === "p") {
            htmlFinal += `<p>\n    ${valor}\n</p>\n\n`;
        } else if (tipo === "h2") {
            htmlFinal += `<h2>${valor}</h2>\n\n`;
        } else if (tipo === "blockquote") {
            htmlFinal += `<blockquote>\n    <b>${valor}</b>\n</blockquote>\n\n`;
        } else if (tipo === "img") {
            const altText = inputs[1].value.trim();
            htmlFinal += `<img class="cover-image" src="${valor}" style="width: 80%; display: block; margin: 0 auto;" alt="${altText}">\n`;
            if (altText) {
                htmlFinal += `<p style="text-align: center; font-style: italic; margin-top: 10px; font-size: 0.9rem;">${altText}</p>\n\n`;
            }
        }
    });

    return htmlFinal;
}

// ACTUALIZAR LA VISTA PREVIA DEL CONTENIDO
function actualizarVistaPrevia() {
    previewContenido.innerHTML = generarHTMLdelContenido();
}

// GENERAR EL SCRIPT SQL
function generarSQL() {
    const titulo = document.getElementById("input-titulo").value.trim();
    const resumen = document.getElementById("input-resumen").value.trim();
    const portada = document.getElementById("input-portada").value.trim();
    const autor = document.getElementById("input-autor").value;
    const categoria = document.getElementById("input-categoria").value;
    
    if (!titulo || !resumen) {
        alert("Falta el título o el resumen");
        return;
    }

    // Generar Slug (minúsculas, guiones en vez de espacios)
    const slug = titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Generar Fecha Actual (Formato YYYY-MM-DD HH:MM:SS)
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Obtener HTML del contenido
    const contenidoHTML = generarHTMLdelContenido();

    // Escapar comillas simples (') para evitar errores de SQL
    const tituloSQL = titulo.replace(/'/g, "''");
    const resumenSQL = resumen.replace(/'/g, "''");
    const contenidoSQL = contenidoHTML.replace(/'/g, "''");

    // Construir el INSERT
    const sql = `INSERT INTO noticias (titulo, slug, resumen, contenido, portada, fecha_publicacion, autor_id, categoria_id) VALUES\n('${tituloSQL}', '${slug}', '${resumenSQL}', '${contenidoSQL}', '${portada}', '${fecha}', ${autor}, ${categoria});`;

    // Mostrar en el textarea
    document.getElementById("output-sql").value = sql;
    
    // Auto-copiar al portapapeles por comodidad
    navigator.clipboard.writeText(sql).then(() => {
        alert("¡SQL Generado y copiado al portapapeles! 💅✨");
    });
}