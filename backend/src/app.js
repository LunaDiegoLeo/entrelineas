// En tu app.js del backend
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // NUEVO

import noticiasRoutes from "../routes/noticias.routes.js";
import autoresRoutes from "../routes/autores.routes.js";
import categoriasRoutes from "../routes/categorias.routes.js";
import authRoutes from "../routes/auth.routes.js"; 

const app = express();

// --- CONFIGURACIÓN ESTRICTA DE CORS PARA COOKIES ---
app.use(cors({
    origin: "https://entre-lineas-f6ek.onrender.com", 
    credentials: true
}));

app.use(express.json());

app.use("/api/noticias", noticiasRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/auth", authRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});