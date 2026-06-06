document.addEventListener("DOMContentLoaded", async () => {
    
    const token = localStorage.getItem("entrelineas_token");

    // Si ni siquiera hay token guardado, para afuera
    if (!token) {
        window.location.replace("login.html");
        return;
    }

    try {
        // Le mandamos el token al backend como un "Gafete VIP"
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // El backend dijo que el token es falso o expiró
            throw new Error("Sesión inválida");
        }
        
        // ¡Validación exitosa! Mostramos la página
        document.body.style.display = "block";

    } catch (error) {
        // En caso de error, borramos el token falso y lo sacamos
        localStorage.removeItem("entrelineas_token");
        window.location.replace("login.html");
    }

    // Botón Cerrar Sesión
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("entrelineas_token");
        window.location.replace("login.html");
    });
});