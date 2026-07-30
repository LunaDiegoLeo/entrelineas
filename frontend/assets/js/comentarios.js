const listaComentarios = document.getElementById('lista-comentarios');
const formComentario = document.getElementById('form-comentario');
const btnEnviarComentario = document.getElementById('btn-enviar-comentario');
const msjLoginComentario = document.getElementById('mensaje-login-comentario');
const textoComentario = document.getElementById('texto-comentario');


const parametrosURL = new URLSearchParams(window.location.search);
const idNoticiaActual = parametrosURL.get('id') || null;

function revisarSesionComentarios() {
    const token = localStorage.getItem('token_revista');
    
    if (!token) {
        textoComentario.disabled = true;
        btnEnviarComentario.classList.add('oculto');
        msjLoginComentario.classList.remove('oculto');
    } else {
        textoComentario.disabled = false;
        btnEnviarComentario.classList.remove('oculto');
        msjLoginComentario.classList.add('oculto');
    }
}

async function cargarComentarios() {
    try {
        const urlFetch = idNoticiaActual
            ? `${API_URL}/comentarios?id_noticia=${idNoticiaActual}`
            : `${API_URL}/comentarios`;

        const respuesta = await fetch(urlFetch);
        const comentarios = await respuesta.json();

        listaComentarios.innerHTML = '';

        if (comentarios.length === 0) {
            const mensaje = document.createElement("p");
            mensaje.style.fontStyle = "italic";
            mensaje.style.backgroundColor = "#f9f9f9";
            mensaje.style.padding = "10px";
            mensaje.textContent = "Sé lx primerx en dejar un chismecito";
            listaComentarios.appendChild(mensaje);
            return;
        }

        comentarios.forEach(com => {

            const fechaBonita = new Date(com.fecha_creacion).toLocaleDateString();

            const comentarioItem = document.createElement("div");
            comentarioItem.className = "comentario-item";

            const autor = document.createElement("div");
            autor.className = "comentario-autor";

            autor.appendChild(
                document.createTextNode(`${com.alias} `)
            );

            const fecha = document.createElement("span");
            fecha.className = "comentario-fecha";
            fecha.textContent = fechaBonita;

            autor.appendChild(fecha);

            const texto = document.createElement("p");
            texto.className = "comentario-texto";
            texto.textContent = com.contenido;

            comentarioItem.appendChild(autor);
            comentarioItem.appendChild(texto);

            listaComentarios.appendChild(comentarioItem);

        });

    } catch (error) {

        listaComentarios.innerHTML = "";

        const mensaje = document.createElement("p");
        mensaje.style.backgroundColor = "#f9f9f9";
        mensaje.style.padding = "10px";
        mensaje.textContent = "Error al cargar los comentarios.";

        listaComentarios.appendChild(mensaje);
    }
}

formComentario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token_revista');
    const contenido = textoComentario.value;
    
    try {
        const respuesta = await fetch(`${API_URL}/comentar`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Entregamos la pulsera VIP
            },
            body: JSON.stringify({
                id_noticia: idNoticiaActual,
                contenido: contenido
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            textoComentario.value = ''; 
            cargarComentarios(); 
            mostrarNotificacion("¡Comentario publicado con éxito!", "exito");
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion("Ocurrió un error al intentar publicar el comentario.", 'error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    revisarSesionComentarios();
    cargarComentarios();
});