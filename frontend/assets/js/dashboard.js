const API_BASE = "https://entrelineas.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: "GET",
            credentials: "include" 
        });

        if (!response.ok) {
            throw new Error("Sesión inválida o cookie ausente");
        }
        
        document.body.style.display = "block";

    } catch (error) {
        console.error("Acceso denegado:", error);
        //window.location.replace("login.html"); 
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: "POST",
                    credentials: "include"
                });
            } catch (error) {
                console.error("Error al cerrar sesión", error);
            }
            window.location.replace("login.html");
        });
    }
});