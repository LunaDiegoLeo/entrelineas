import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js"; 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desarrollo_123";

router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM usuario WHERE usuario = $1", [usuario]);

        if (result.rows.length === 0) return res.status(401).json({ error: "Credenciales inválidas" });

        const user = result.rows[0];
        const passwordValida = await bcrypt.compare(password, user.password);

        if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas" });

        const token = jwt.sign(
            { id_usuario: user.id_usuario, usuario: user.usuario },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Devolvemos el token en el JSON, ya no usamos res.cookie
        res.json({ mensaje: "Login exitoso", token: token });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// NUEVO: Verificar leyendo los Headers
router.get("/verify", (req, res) => {
    // El frontend enviará el token en el formato "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No autorizado" });
    }

    const token = authHeader.split(" ")[1]; // Extraemos solo el token

    try {
        jwt.verify(token, JWT_SECRET);
        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
});

export default router;