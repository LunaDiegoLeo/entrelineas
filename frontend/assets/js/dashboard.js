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
            // Si el backend responde pero dice que el token es malo
            throw new Error(`El servidor rechazó el token. Código: ${response.status}`);
        }
        
        // ¡Éxito!
        document.body.style.display = "block";

    } catch (error) {
        // TRAMPA DEFINITIVA: Esto mostrará el error en tu cara antes de sacarte
        alert("Fallo la conexión con el backend. Razón: " + error.message);
        
        localStorage.removeItem("entrelineas_token");
        // Dejaremos la redirección comentada una última vez para que puedas leer la alerta
        // window.location.replace("login.html");
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("entrelineas_token");
            window.location.replace("login.html");
        });
    }
});