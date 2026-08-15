import { Router } from "express";

import {
    getAutores,
    getAutoresIndex,
    getNoticiasPorAutor,
    getAutoresInvitadxs
} from "../controllers/autores.controller.js";

const router = Router();

router.get("/", getAutores);
router.get("/index", getAutoresIndex);
router.get("/invitadxs", getAutoresInvitadxs);

router.get("/:id/noticias",
    getNoticiasPorAutor
);

export default router;