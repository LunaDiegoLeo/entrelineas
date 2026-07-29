const modalAuth = document.getElementById('modal-auth');
const btnCerrar = document.getElementById('cerrar-modal');

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    
    // Estilos del mensaje flotante
    notificacion.style.position = 'fixed';
    notificacion.style.bottom = '20px';
    notificacion.style.right = '20px';
    notificacion.style.backgroundColor = tipo === 'exito' ? '#28a745' : '#dc3545'; // Verde para éxito, rojo para error
    notificacion.style.color = 'white';
    notificacion.style.padding = '15px 25px';
    notificacion.style.borderRadius = '8px';
    notificacion.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notificacion.style.zIndex = '9999';
    notificacion.style.fontFamily = 'sans-serif';
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateY(20px)';
    notificacion.style.transition = 'all 0.4s ease-in-out';

    document.body.appendChild(notificacion);

    // Animación de entrada
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateY(0)';
    }, 10);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(20px)';
        setTimeout(() => notificacion.remove(), 400); // Espera a que termine la animación para borrarlo del DOM
    }, 3000);
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
    const btnIngresar = document.getElementById('btn-abrir-modal'); 
    
    if (alias && btnIngresar) {
        btnIngresar.textContent = `Hola, ${alias}`;
        btnIngresar.onclick = null; 
        
        btnIngresar.addEventListener('click', () => {
            if(confirm('¿Quieres cerrar sesión?')) {
                localStorage.removeItem('token_revista');
                localStorage.removeItem('alias_usuario');
                location.reload(); // Recarga la página instantáneamente
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', actualizarMenuUsuario);