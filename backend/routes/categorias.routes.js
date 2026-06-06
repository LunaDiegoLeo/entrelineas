import { Router } from "express";

import {
    getCategorias,
    getNoticiasPorCategoria
} from "../controllers/categorias.controller.js";

const router = Router();

router.get("/", getCategorias);

router.get("/:id/noticias",
    getNoticiasPorCategoria
);

export default router;