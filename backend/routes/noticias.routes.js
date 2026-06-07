import { Router } from "express";
import jwt from "jsonwebtoken"; 

import {
    getNoticias,
    getNoticiaPorSlug,
    buscarPorTitulo,
    getNoticiasPorFecha,
    crearNoticia
} from "../controllers/noticias.controller.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No tienes permiso para publicar, mi ciela." });
    }
    
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Ese token ya caducó o es falso." });
    }
};

router.get("/", getNoticias);
router.get("/buscar", buscarPorTitulo);
router.get("/fechas", getNoticiasPorFecha);

router.post("/", verificarToken, crearNoticia);

router.get("/:slug", getNoticiaPorSlug);

export default router;