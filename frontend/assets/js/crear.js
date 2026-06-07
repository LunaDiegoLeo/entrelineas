const API_BASE = "https://entrelineas.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("entrelineas_token");

    if (!token) {
        alert("Atrapado: No se encontró ningún token en el navegador.");
        window.location.replace("login.html");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Sesión inválida");
        }
        
        // ¡Éxito!
        document.body.style.display = "block";

    } catch (error) {
        console.error("Error de verificación capturado:", error);
        localStorage.removeItem("entrelineas_token");
        window.location.replace("login.html"); // <-- Quítale los // para activarlo de nuevo
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("entrelineas_token");
            window.location.replace("login.html");
        });
    }
});


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
    if (selCat.options.length > 0) document.getElementById("preview-categoria").textContent = selCat.options[selCat.selectedIndex].text;
    if (selAutor.options.length > 0) document.getElementById("preview-autor").textContent = selAutor.options[selAutor.selectedIndex].text;
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
function generarHTMLdelContenido(modo = 'preview') {
    let htmlFinal = "";
    document.querySelectorAll(".block-card").forEach(bloque => {
        const inputs = bloque.querySelectorAll(".bloque-input");
        const tipo = inputs[0].getAttribute("data-tipo");
        let valorBruto = inputs[0].value.trim();

        if (!valorBruto && tipo !== 'img') return;

        // 🛡️ MAGIA POTAXIE: Lavamos el código antes de usarlo
        // Solo permitimos negritas, cursivas, subrayados y enlaces. Todo lo demás (scripts) SE ELIMINA.
        let valorLimpio = DOMPurify.sanitize(valorBruto, { 
            ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'a'], 
            ALLOWED_ATTR: ['href', 'target'] 
        });

        // Reemplazar \n por <br> usando el texto ya limpio
        const textoBr = valorLimpio.replace(/\n/g, "<br>");

        if (tipo === "p") {
            htmlFinal += `<p>\n    ${textoBr}\n</p>\n\n`;
        } else if (tipo === "h2") {
            // Un H2 no debería llevar etiquetas extra, lo limpiamos al 100% (solo texto plano)
            let h2Limpio = DOMPurify.sanitize(valorBruto, { ALLOWED_TAGS: [] });
            htmlFinal += `<h2>${h2Limpio}</h2>\n\n`;
        } else if (tipo === "blockquote") {
            htmlFinal += `<blockquote>\n    <b>${textoBr}</b>\n</blockquote>\n\n`;
        } else if (tipo === "card-estilo") {
            htmlFinal += `<div class="inline-card" style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">\n    ${textoBr}\n</div>\n\n`;
        } else if (tipo === "card-simple") {
            htmlFinal += `<div class="inline-card">\n    ${textoBr}\n</div>\n\n`;
        } else if (tipo === "img") {
            // Limpiamos el texto alternativo por si las moscas
            let altTextBruto = inputs[1].value.trim();
            const altText = DOMPurify.sanitize(altTextBruto, { ALLOWED_TAGS: [] }); 
            
            let imgSrc = valorBruto; 
            if (modo === 'sql') {
                const fName = inputs[0].getAttribute('data-filename') || 'imagen.jpg';
                imgSrc = `URL_CLOUDINARY_AQUI/${fName}`;
            }

            htmlFinal += `<img class="cover-image" src="${imgSrc}" style="width: 80%; display: block; margin: 0 auto;" alt="${altText}">\n`;
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
    const CLOUD_NAME = "dd86ahlsj";
    const UPLOAD_PRESET = "entrelineas_preset";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        return data.secure_url.replace("/upload/", "/upload/c_scale,w_1200/f_webp/q_auto/"); // Optimización automática para web
    } catch (error) {
        console.error("Error subiendo imagen a Cloudinary:", error);
        return null;
    }
}


// --- 5. GENERAR SQL (AHORA CON SUBIDA A LA NUBE) ---
async function publicarNoticia() {
    const titulo = document.getElementById("input-titulo").value.trim();
    const resumen = document.getElementById("input-resumen").value.trim();
    const autor = document.getElementById("input-autor").value;
    const categoria = document.getElementById("input-categoria").value;
    const archivoPortada = document.getElementById("input-portada").files[0];
    
    if (!titulo || !resumen) return alert("Falta el título o el resumen");

    const btnSQL = document.querySelector(".btn-green");
    const textoOriginal = btnSQL.textContent;
    btnSQL.textContent = "⏳ Subiendo e insertando... ¡Soporten!";
    btnSQL.disabled = true;
    btnSQL.style.opacity = "0.7";

    try {
        // 1. SUBIMOS LAS FOTOS A CLOUDINARY (Tu código intacto)
        let urlPortadaFinal = "";
        if (archivoPortada) {
            urlPortadaFinal = await subirACloudinary(archivoPortada);
            if (!urlPortadaFinal) throw new Error("Falló la subida de la portada");
        }

        const bloques = document.querySelectorAll(".block-card");
        for (let bloque of bloques) {
            const fileInput = bloque.querySelector('input[type="file"]');
            const hiddenInput = bloque.querySelector('.bloque-input[data-tipo="img"]');
            if (fileInput && fileInput.files[0]) {
                const urlReal = await subirACloudinary(fileInput.files[0]);
                if (urlReal) hiddenInput.value = urlReal; 
            }
        }

        // 2. ARMAMOS EL PAQUETE DE DATOS
        const contenidoHTML = generarHTMLdelContenido('preview'); // Ya no es 'sql', queremos el HTML final limpio
        const slug = titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const paqueteNoticia = {
            titulo: titulo,
            slug: slug,
            resumen: resumen,
            contenido: contenidoHTML,
            portada: urlPortadaFinal,
            autor: autor,
            categoria: categoria
        };

        // 3. SACAMOS EL GAFETE VIP (El token guardado del login)
        const token = localStorage.getItem("entrelineas_token");
        if (!token) throw new Error("No tienes sesión iniciada.");

        // 4. DISPARAMOS AL BACKEND
        const respuestaBD = await fetch(`${API_BASE}/noticias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Mostramos el gafete al cadenero
            },
            body: JSON.stringify(paqueteNoticia)
        });

        const data = await respuestaBD.json();

        if (!respuestaBD.ok) {
            throw new Error(data.error || "Error al publicar en la Base de Datos");
        }

        // ¡Y LA QUESO! Terminamos.
        alert(`✨ ${data.mensaje} ✨\n\nNoticia insertada con éxito en la base de datos.`);
        
        // Opcional: Redirigir al dashboard para ver el triunfo
        window.location.replace("dashboard.html");

    } catch (error) {
        alert("Ocurrió un error. Revisa la consola: " + error.message);
        console.error(error);
    } finally {
        btnSQL.textContent = textoOriginal;
        btnSQL.disabled = false;
        btnSQL.style.opacity = "1";
    }
}