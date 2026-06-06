import { Router } from "express";

import {
    getAutores,
    getNoticiasPorAutor
} from "../controllers/autores.controller.js";

const router = Router();

router.get("/", getAutores);

router.get("/:id/noticias",
    getNoticiasPorAutor
);

export default router;