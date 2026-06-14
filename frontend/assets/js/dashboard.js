const API_BASE = "https://entrelineas.onrender.com/api";

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
            throw new Error("Sesión inválida");
        }
        
        // ¡Éxito!
        document.body.style.display = "block";

    } catch (error) {
        console.error("Error de verificación capturado:", error);
        localStorage.removeItem("entrelineas_token");
        window.location.replace("login.html"); // <-- Quítale los // para activarlo de nuevo
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("entrelineas_token");
            window.location.replace("login.html");
        });
    }
});