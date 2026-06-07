// --- 1. CARGA DE API AL INICIAR ---
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // IMPORTANTE: Cambia estas URLs por tus endpoints reales
        const resCat = await fetch('https://entrelineas.onrender.com/api/categorias'); 
        const categorias = await resCat.json();
        const selectCat = document.getElementById("input-categoria");
        selectCat.innerHTML = categorias.map(c => `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');

        const resAutores = await fetch('https://entrelineas.onrender.com/api/autores');
        const autores = await resAutores.json();
        const selectAutor = document.getElementById("input-autor");
        selectAutor.innerHTML = autores.map(a => `<option value="${a.id_autor}">${a.nombre_autor}</option>`).join('');

        actualizarMetaPreview();
    } catch (error) {
        console.error("No se pudo conectar a la API:", error);
    }
});

// --- 2. LISTENERS GLOBALES ---
document.getElementById("input-titulo").addEventListener("input", (e) => document.getElementById("preview-titulo").textContent = e.target.value || "Título...");
document.getElementById("input-resumen").addEventListener("input", (e) => document.getElementById("preview-resumen").textContent = e.target.value || "Resumen...");
document.getElementById("input-categoria").addEventListener("change", actualizarMetaPreview);
document.getElementById("input-autor").addEventListener("change", actualizarMetaPreview);

function actualizarMetaPreview() {
    const selCat = document.getElementById("input-categoria");
    const selAutor = document.getElementById("input-autor");
    if(selCat.options.length > 0) document.getElementById("preview-categoria").textContent = selCat.options[selCat.selectedIndex].text;
    if(selAutor.options.length > 0) document.getElementById("preview-autor").textContent = selAutor.options[selAutor.selectedIndex].text;
}

// Pre-visualizar Portada
document.getElementById("input-portada").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const img = document.getElementById("preview-portada");
    if (file) {
        img.src = URL.createObjectURL(file);
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }
});

// --- 3. GESTIÓN DE BLOQUES ---
const bloquesContainer = document.getElementById("bloques-container");
let contadorBloques = 0;

function agregarBloque(tipo) {
    contadorBloques++;
    const id = `bloque-${contadorBloques}`;
    const div = document.createElement("div");
    div.className = "block-card";
    div.id = id;

    let inner = `<button class="delete-btn" onclick="borrarBloque('${id}')">X</button>`;

    if (tipo === 'parrafo') {
        inner += `<label>Párrafo:</label>
                  <textarea class="bloque-input" data-tipo="p" rows="4" placeholder="Permite etiquetas como <b>texto</b>" style="width:100%;" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'subtitulo') {
        inner += `<label>Subtítulo (H2):</label>
                  <input type="text" class="bloque-input" data-tipo="h2" style="width:100%;" oninput="actualizarVistaPrevia()">`;
    } else if (tipo === 'cita') {
        inner += `<label>Cita (Blockquote):</label>
                  <textarea class="bloque-input" data-tipo="blockquote" rows="2" style="width:100%;" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'tarjeta-estilo') {
        inner += `<label>Tarjeta (Gris con padding):</label>
                  <textarea class="bloque-input" data-tipo="card-estilo" rows="4" placeholder="Admite texto, \\n y etiquetas HTML" style="width:100%;" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'tarjeta-simple') {
        inner += `<label>Tarjeta (Sin estilo interno):</label>
                  <textarea class="bloque-input" data-tipo="card-simple" rows="4" placeholder="Admite texto, \\n y etiquetas HTML" style="width:100%;" oninput="actualizarVistaPrevia()"></textarea>`;
    } else if (tipo === 'imagen') {
        inner += `<label>Imagen de Contenido:</label>
                  <input type="file" accept="image/*" onchange="previewImagenBloque(this)">
                  <!-- Inputs ocultos para guardar la data -->
                  <input type="hidden" class="bloque-input" data-tipo="img">
                  <input type="text" class="bloque-input mt-2" data-tipo="img-alt" placeholder="Pie de foto / Alt" style="width:100%; margin-top:10px;" oninput="actualizarVistaPrevia()">
                  <img class="img-preview-temp" style="width: 100px; display: none; margin-top: 10px;">`;
    }

    div.innerHTML = inner;
    bloquesContainer.appendChild(div);
}

function borrarBloque(id) {
    document.getElementById(id).remove();
    actualizarVistaPrevia();
}

function previewImagenBloque(input) {
    const file = input.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const hiddenVal = input.nextElementSibling;
        hiddenVal.value = url; // Guardamos URL temporal
        hiddenVal.setAttribute('data-filename', file.name); // Guardamos nombre real para SQL
        
        const imgNode = input.parentElement.querySelector('.img-preview-temp');
        imgNode.src = url;
        imgNode.style.display = "block";
        
        actualizarVistaPrevia();
    }
}

// --- 4. GENERADOR DE HTML (Preview y SQL) ---
// --- 4. GENERADOR DE HTML (Preview y SQL) ---
function generarHTMLdelContenido() {
    let htmlFinal = "";
    document.querySelectorAll(".block-card").forEach(bloque => {
        const inputs = bloque.querySelectorAll(".bloque-input");
        const tipo = inputs[0].getAttribute("data-tipo");
        let valor = inputs[0].value.trim(); // Aquí estará la URL real o texto

        if (!valor && tipo !== 'img') return;

        // Reemplazar \n por <br>
        const textoBr = valor.replace(/\n/g, "<br>");

        if (tipo === "p") {
            htmlFinal += `<p>\n    ${textoBr}\n</p>\n\n`;
        } else if (tipo === "h2") {
            htmlFinal += `<h2>${valor}</h2>\n\n`;
        } else if (tipo === "blockquote") {
            htmlFinal += `<blockquote>\n    <b>${valor}</b>\n</blockquote>\n\n`;
        } else if (tipo === "card-estilo") {
            htmlFinal += `<div class="inline-card" style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">\n    ${textoBr}\n</div>\n\n`;
        } else if (tipo === "card-simple") {
            htmlFinal += `<div class="inline-card">\n    ${textoBr}\n</div>\n\n`;
        } else if (tipo === "img") {
            const altText = inputs[1].value.trim();
            // Para la imagen, el valor es la URL (ya sea la temporal o la real de Cloudinary)
            htmlFinal += `<img class="cover-image" src="${valor}" style="width: 80%; display: block; margin: 0 auto;" alt="${altText}">\n`;
            if (altText) {
                htmlFinal += `<p style="text-align: center; font-style: italic; margin-top: 10px; font-size: 0.9rem;">\n    ${altText}\n</p>\n\n`;
            }
        }
    });
    return htmlFinal;
}

function actualizarVistaPrevia() {
    document.getElementById("preview-contenido").innerHTML = generarHTMLdelContenido();
}


// --- NUEVO: FUNCIÓN PARA SUBIR A CLOUDINARY ---
async function subirACloudinary(file) {
    const CLOUD_NAME = process.env.CLOUD_NAME;
    const UPLOAD_PRESET = process.env.UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        return data.secure_url; // ¡ESTA ES LA URL OFICIAL DE LA FOTO!
    } catch (error) {
        console.error("Error subiendo imagen a Cloudinary:", error);
        return null;
    }
}


// --- 5. GENERAR SQL (AHORA CON SUBIDA A LA NUBE) ---
async function generarSQL() {
    const titulo = document.getElementById("input-titulo").value.trim();
    const resumen = document.getElementById("input-resumen").value.trim();
    const autor = document.getElementById("input-autor").value;
    const categoria = document.getElementById("input-categoria").value;
    const archivoPortada = document.getElementById("input-portada").files[0];
    
    if (!titulo || !resumen) return alert("Falta el título o el resumen 💅");

    // Cambiar estado del botón para que el usuario espere
    const btnSQL = document.querySelector(".btn-green");
    const textoOriginal = btnSQL.textContent;
    btnSQL.textContent = "⏳ Subiendo fotos a la nube... ¡Soporten!";
    btnSQL.disabled = true;
    btnSQL.style.opacity = "0.7";

    try {
        // 1. SUBIR PORTADA
        let urlPortadaFinal = "";
        if (archivoPortada) {
            urlPortadaFinal = await subirACloudinary(archivoPortada);
            if (!urlPortadaFinal) throw new Error("Falló la subida de la portada");
        }

        // 2. SUBIR IMÁGENES DEL CONTENIDO
        const bloques = document.querySelectorAll(".block-card");
        for (let bloque of bloques) {
            const fileInput = bloque.querySelector('input[type="file"]');
            const hiddenInput = bloque.querySelector('.bloque-input[data-tipo="img"]');
            
            // Si hay un archivo seleccionado en este bloque
            if (fileInput && fileInput.files[0]) {
                const urlReal = await subirACloudinary(fileInput.files[0]);
                if (urlReal) {
                    // Reemplazamos la URL temporal (blob) por la oficial de Cloudinary
                    hiddenInput.value = urlReal; 
                }
            }
        }

        // 3. GENERAR EL HTML YA CON LAS URLS REALES
        const contenidoHTML = generarHTMLdelContenido();
        const slug = titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Escapar comillas simples para SQL
        const tituloSQL = titulo.replace(/'/g, "''");
        const resumenSQL = resumen.replace(/'/g, "''");
        const contenidoSQL = contenidoHTML.replace(/'/g, "''");

        // Construir SQL Final
        const sql = `INSERT INTO noticias (titulo, slug, resumen, contenido, portada, fecha_publicacion, autor_id, categoria_id) VALUES\n('${tituloSQL}', '${slug}', '${resumenSQL}', '${contenidoSQL}', '${urlPortadaFinal}', '${fecha}', ${autor}, ${categoria});`;

        document.getElementById("output-sql").value = sql;
        
        // Auto-copiar
        navigator.clipboard.writeText(sql).then(() => {
            alert("✨ ¡Imágenes en Cloudinary y SQL Generado y copiado al portapapeles! ✨ Devoraste.");
        });

    } catch (error) {
        alert("Ocurrió un error subiendo las imágenes. Revisa la consola.");
        console.error(error);
    } finally {
        // Restaurar el botón
        btnSQL.textContent = textoOriginal;
        btnSQL.disabled = false;
        btnSQL.style.opacity = "1";
    }
}