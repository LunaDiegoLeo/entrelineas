// AGREGAR ESTA LÍNEA AL PRINCIPIO:
const API_BASE = "https://entrelineas.onrender.com/api"; // Asegúrate de que sea tu URL real del backend

document.addEventListener("DOMContentLoaded", async () => {
    
    const token = localStorage.getItem("entrelineas_token");

    if (!token) {
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
        
        document.body.style.display = "block";

    } catch (error) {
        console.error("Error de verificación:", error); // <-- Agregué esto para que veas el error real en consola por si acaso
        localStorage.removeItem("entrelineas_token");
        window.location.replace("login.html");
    }

    // Botón Cerrar Sesión
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("entrelineas_token");
            window.location.replace("login.html");
        });
    }
});