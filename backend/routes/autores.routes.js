import { Router } from "express";

import {
    getAutores,
    getAutoresIndex,
    getNoticiasPorAutor
} from "../controllers/autores.controller.js";

const router = Router();

router.get("/", getAutores);
router.get("/index", getAutoresIndex);

router.get("/:id/noticias",
    getNoticiasPorAutor
);

export default router;