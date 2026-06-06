import { Router } from "express";

import {
    getNoticias,
    getNoticiaPorSlug,
    buscarPorTitulo,
    getNoticiasPorFecha
} from "../controllers/noticias.controller.js";

const router = Router();

router.get("/", getNoticias);

router.get("/buscar", buscarPorTitulo);

router.get("/fechas", getNoticiasPorFecha);

router.get("/:slug", getNoticiaPorSlug);

export default router;