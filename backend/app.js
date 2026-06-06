import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import noticiasRoutes from "./routes/noticias.routes.js";
import autoresRoutes from "./routes/autores.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/noticias", noticiasRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

app.get("/", (req, res) => {
    res.json({
        proyecto: "Entre Líneas",
        status: "online"
    });
});