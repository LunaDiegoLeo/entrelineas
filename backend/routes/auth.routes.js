import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Importa tu conexión a la BD aquí (ajusta la ruta según tu proyecto)
import pool from "../db.js"; 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desarrollo_123";

router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // 1. Buscar al usuario en la base de datos
        const result = await pool.query(
            "SELECT id_usuario, usuario, password FROM usuario WHERE usuario = $1",
            [usuario]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        const user = result.rows[0];

        // 2. Comparar la contraseña enviada con el hash de la base de datos
        const passwordValida = await bcrypt.compare(password, user.password);

        if (!passwordValida) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        // 3. Generar el Token de seguridad (JWT)
        const token = jwt.sign(
            { id_usuario: user.id_usuario, usuario: user.usuario },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Enviar el token al frontend
        res.json({
            mensaje: "Login exitoso",
            token: token
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;