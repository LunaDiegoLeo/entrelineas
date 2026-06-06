document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // 1. Eliminamos el token del LocalStorage para cerrar la sesión de inmediato
            localStorage.removeItem("entrelineas_token");
            
            // 2. Redirigimos al login usando replace para que no pueda volver atrás
            window.location.replace("login.html");
        });
    }
});