import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Importa tu conexión a la BD aquí (ajusta la ruta según tu proyecto)
import {pool} from "../config/db.js"; 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desarrollo_123";

// En routes/auth.routes.js
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

        // --- MAGIA DE SEGURIDAD AQUÍ ---
        res.cookie("entrelineas_token", token, {
            httpOnly: true, // Inaccesible para JavaScript (Protección XSS)
            secure: true,   // Solo viaja por HTTPS (Protección MITM)
            sameSite: "none", // Necesario porque tu Front y Back están en URLs distintas de Render
            maxAge: 8 * 60 * 60 * 1000 // Expira en 8 horas
        });

        res.json({ mensaje: "Login exitoso" });

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Ruta para verificar si la cookie es válida
router.get("/verify", (req, res) => {
    const token = req.cookies.entrelineas_token;
    
    if (!token) return res.status(401).json({ error: "No autorizado" });

    try {
        jwt.verify(token, JWT_SECRET);
        res.status(200).json({ status: "ok" });
    } catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
});

// Ruta para CERRAR SESIÓN
router.post("/logout", (req, res) => {
    res.clearCookie("entrelineas_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.json({ mensaje: "Sesión cerrada" });
});

export default router;