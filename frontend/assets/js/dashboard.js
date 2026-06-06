// En assets/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Verificamos la sesión con el backend al cargar la página
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: "GET",
            credentials: "include" // Siempre mandar la cookie
        });

        if (!response.ok) {
            // Si el backend dice que no hay cookie válida, lo rebotamos
            window.location.replace("login.html");
            return;
        }
        
        // Si todo está ok, mostramos el contenido de la página
        document.body.style.display = "block";

    } catch (error) {
        window.location.replace("login.html");
    }

    // 2. Botón de Cerrar Sesión
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
        window.location.replace("login.html");
    });
});