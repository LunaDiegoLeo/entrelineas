const modalAuth = document.getElementById('modal-auth');
const btnCerrar = document.getElementById('cerrar-modal');


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
            alert(data.mensaje); 
            document.getElementById('ver-email').value = email; 
            cambiarFormulario('verificacion');
        } else {
            alert(data.error); 
        }
    } catch (error) {
        alert("Ocurrió un error. Intenta de nuevo." + error.message);
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
            alert(data.mensaje); 
            document.getElementById('login-email').value = email;
            cambiarFormulario('login');
        } else {
            alert(data.error); // "El código es incorrecto"
        }
    } catch (error) {
        alert("Ocurrió un error con la verificación.");
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
            
            alert(`¡Bienvenidx, ${data.usuario.alias}!`);
            cerrarModal();
            
            
            actualizarMenuUsuario(); 
        } else {
            alert(data.error); 
        }
    } catch (error) {
        alert("Ocurrió un error al iniciar sesión." + error.message);
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
                location.reload(); // Recarga la página
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', actualizarMenuUsuario);