const API_BASE = "https://entrelineas.onrender.com/api";
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    errorMsg.style.display = "none";

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password }),
            credentials: "include" 
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Error al iniciar sesión");

        window.location.replace("dashboard.html");

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
    }
});