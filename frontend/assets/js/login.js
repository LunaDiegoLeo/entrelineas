const API_BASE = "https://entrelineas.onrender.com/api";
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que la página recargue al enviar el formulario

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    // Limpiar mensajes de error previos
    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Mostrar error si las credenciales son incorrectas
            throw new Error(data.error || "Error al iniciar sesión");
        }

        // Si es exitoso, guardamos el Token de seguridad en el navegador
        localStorage.setItem("entrelineas_token", data.token);

        // Redirigir al dashboard de autores (crea este archivo después)
        window.location.replace("dashboard.html");

    } catch (error) {
        console.error("Fallo el login:", error);
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
    }
});