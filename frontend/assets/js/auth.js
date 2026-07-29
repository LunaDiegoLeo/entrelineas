const modalAuth = document.getElementById('modal-auth');
const btnCerrar = document.getElementById('cerrar-modal');

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    
    // Le agregamos la clase base y la clase del tipo (exito o error)
    notificacion.classList.add('notificacion-elegante', `notificacion-${tipo}`);

    document.body.appendChild(notificacion);

    // Animación de entrada
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => notificacion.remove(), 400); 
    }, 3000);
}

function confirmarCierreSesion(onConfirm) {
    // Creamos el fondo oscuro
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay-logout';
    
    // Creamos la caja chueca
    const modal = document.createElement('div');
    modal.className = 'modal-logout-aesthetic';
    
    // Textos
    const titulo = document.createElement('h3');
    titulo.textContent = '¿Te vas tan pronto?';
    
    const texto = document.createElement('p');
    texto.textContent = 'Estás a punto de cerrar sesión. ¿Segura que quieres salir del chismecito?';
    
    // Contenedor de botones
    const btnContainer = document.createElement('div');
    btnContainer.className = 'modal-logout-botones';
    
    // Botón de cancelar (Usa tus clases de CSS existentes)
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Mejor me quedo';
    btnCancelar.className = 'btn btn-purple';
    
    // Botón de confirmar (Usa tus clases de CSS existentes)
    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Sí, cerrar sesión';
    btnConfirmar.className = 'btn btn-green';
    
    // Armamos el lego
    btnContainer.appendChild(btnCancelar);
    btnContainer.appendChild(btnConfirmar);
    modal.appendChild(titulo);
    modal.appendChild(texto);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Función para cerrar este modal chiquito
    const cerrar = () => {
        overlay.classList.remove('mostrar');
        setTimeout(() => overlay.remove(), 400); // Espera que acabe la animación
    };
    
    // Pequeño truco para que se vea la animación al inyectarlo al DOM
    setTimeout(() => {
        overlay.classList.add('mostrar');
    }, 10);

    // Eventos de los botones
    btnCancelar.addEventListener('click', cerrar);
    btnConfirmar.addEventListener('click', () => {
        cerrar();
        onConfirm(); // Ejecuta el cierre de sesión real
    });
}

function abrirModal() {
    modalAuth.classList.remove('oculto');
    cambiarFormulario('login'); 
}

function cerrarModal() {
    modalAuth.classList.add('oculto');
}

btnCerrar.addEventListener('click', cerrarModal);

window.addEventListener('click', (e) => {
    if (e.target === modalAuth) {
        cerrarModal();
    }
});

window.cambiarFormulario = function(tipo) {
    document.getElementById('form-login').classList.add('oculto');
    document.getElementById('form-registro').classList.add('oculto');
    document.getElementById('form-verificacion').classList.add('oculto');
    
    document.getElementById('tab-login').classList.remove('tab-activa');
    document.getElementById('tab-registro').classList.remove('tab-activa');
    
    document.getElementById('tabs-auth').classList.remove('oculto');
    
    if (tipo === 'login') {
        document.getElementById('form-login').classList.remove('oculto');
        document.getElementById('tab-login').classList.add('tab-activa');
    } else if (tipo === 'registro') {
        document.getElementById('form-registro').classList.remove('oculto');
        document.getElementById('tab-registro').classList.add('tab-activa');
    } else if (tipo === 'verificacion') {
        document.getElementById('form-verificacion').classList.remove('oculto');
        document.getElementById('tabs-auth').classList.add('oculto'); // Ocultamos pestañas
    }
};

const API_URL = 'https://entrelineas.onrender.com/api/usuarios'; 

document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.getElementById('reg-email').value;
    const alias = document.getElementById('reg-alias').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const respuesta = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, alias, password })
        });
        
        const data = await respuesta.json();
        
        if (respuesta.ok) {
            mostrarNotificacion(data.mensaje, 'exito'); 
            document.getElementById('ver-email').value = email; 
            cambiarFormulario('verificacion');
        } else {
            mostrarNotificacion(data.error, 'error'); 
        }
    } catch (error) {
        mostrarNotificacion("Ocurrió un error. Intenta de nuevo.", 'error');
    }
});

document.getElementById('form-verificacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('ver-email').value;
    const codigo = document.getElementById('ver-codigo').value;
    
    try {
        const respuesta = await fetch(`${API_URL}/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo })
        });
        
        const data = await respuesta.json();
        
        if (respuesta.ok) {
            mostrarNotificacion(data.mensaje, 'exito'); 
            document.getElementById('login-email').value = email;
            cambiarFormulario('login');
        } else {
            mostrarNotificacion(data.error, 'error'); // "El código es incorrecto"
        }
    } catch (error) {
        mostrarNotificacion("Ocurrió un error con la verificación.", 'error');
    }
});

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await respuesta.json();
        
        if (respuesta.ok) {
            localStorage.setItem('token_revista', data.token);
            localStorage.setItem('alias_usuario', data.usuario.alias);
            
            mostrarNotificacion(`¡Bienvenidx, ${data.usuario.alias}!`, 'exito');
            cerrarModal();
            
            // Recargamos la página después de 1.5 segundos para que vean el mensaje
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } else {
            mostrarNotificacion(data.error, 'error'); 
        }
    } catch (error) {
        mostrarNotificacion("Ocurrió un error al iniciar sesión.", 'error');
    }
});

function actualizarMenuUsuario() {
    const alias = localStorage.getItem('alias_usuario');
    const btnIngresarOriginal = document.getElementById('btn-abrir-modal'); 
    
    if (alias && btnIngresarOriginal) {
        const btnIngresar = btnIngresarOriginal.cloneNode(true);
        btnIngresarOriginal.parentNode.replaceChild(btnIngresar, btnIngresarOriginal);
        
        btnIngresar.textContent = `Hola, ${alias}`;
        
        btnIngresar.removeAttribute('onclick'); 
        if (btnIngresar.tagName === 'A') {
            btnIngresar.href = "javascript:void(0)"; 
        }
        
        btnIngresar.addEventListener('click', (e) => {
            e.preventDefault(); 
            confirmarCierreSesion(() => {
                localStorage.removeItem('token_revista');
                localStorage.removeItem('alias_usuario');
                
                setTimeout(() => {
                    location.reload(); 
                }, 300);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', actualizarMenuUsuario);