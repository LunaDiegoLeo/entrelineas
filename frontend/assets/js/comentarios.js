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
            listaComentarios.innerHTML = '<p style="font-style: italic; background-color: #f9f9f9; padding: 10px;">Sé lx primerx en dejar un chismecito </p>';
            return;
        }

        comentarios.forEach(com => {
            const fechaBonita = new Date(com.fecha_creacion).toLocaleDateString();
            
            listaComentarios.innerHTML += `
                <div class="comentario-item">
                    <div class="comentario-autor">
                        ${com.alias} <span class="comentario-fecha">${fechaBonita}</span>
                    </div>
                    <p class="comentario-texto">${com.contenido}</p>
                </div>
            `;
        });
    } catch (error) {
        listaComentarios.innerHTML = '<p style="background-color: #f9f9f9; padding: 10px;">Error al cargar los comentarios.</p>';
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
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Ocurrió un error al intentar publicar el comentario.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    revisarSesionComentarios();
    cargarComentarios();
});