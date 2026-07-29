import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

import { enviarCorreoVerificacion } from "../services/email.service.js";

const registroLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3,
    message: { error: "Beba, te pasaste de intentos. Espera 15 minutitos, porfa." }
});



const verificarLector = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No tienes permiso para comentar. Inicia sesión primero." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Tu sesión expiró o el token no es válido." });
    }
};


router.post("/registro", registroLimiter, async (req, res) => {
    try {
        const { email, alias, password } = req.body;

        if (!email || !alias || !password) {
            return res.status(400).json({ error: "Faltan datos, amix." });
        }

        const existe = await pool.query(
            "SELECT * FROM usuarios_wp WHERE email = $1 OR alias = $2",
            [email, alias]
        );
        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "Ese correo o alias ya está ocupado." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const codigoPlano = Math.floor(100000 + Math.random() * 900000).toString();
        const saltToken = await bcrypt.genSalt(10);
        const tokenHash = await bcrypt.hash(codigoPlano, saltToken);

        await pool.query(
            "INSERT INTO usuarios_wp (email, alias, password, token_verificacion) VALUES ($1, $2, $3, $4)",
            [email, alias, passwordHash, tokenHash]
        );

        
        await enviarCorreoVerificacion({
            to: email,
            alias,
            codigo: codigoPlano
        });

        res.status(200).json({ mensaje: "¡Revisa tu correo! Te enviamos un código." });


    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: "El servidor andaba distraído. Intenta de nuevo." });
    }
});

router.post("/verificar", async (req, res) => {
    try {
        const { email, codigo } = req.body;

        if (!email || !codigo) {
            return res.status(400).json({ error: "Faltan datos, amix. Necesitamos el correo y el código." });
        }

        const resultado = await pool.query(
            "SELECT * FROM usuarios_wp WHERE email = $1",
            [email]
        );
        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(404).json({ error: "No encontramos ninguna cuenta con ese correo." });
        }

        if (usuario.verificado) {
            return res.status(400).json({ error: "Esta cuenta ya está verificada. ¡Inicia sesión!" });
        }


        const esValido = await bcrypt.compare(codigo, usuario.token_verificacion);

        if (!esValido) {
            return res.status(400).json({ error: "El código es incorrecto. Revisa tu correo de nuevo." });
        }

        await pool.query(
            "UPDATE usuarios_wp SET verificado = true, token_verificacion = NULL WHERE email = $1",
            [email]
        );

        res.status(200).json({ mensaje: "¡Cuenta verificada con éxito! Ya puedes comentar en las noticias." });

    } catch (error) {
        console.error("Error verificando cuenta:", error);
        res.status(500).json({ error: "Error en el servidor. Intenta de nuevo en unos minutos." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Ingresa tu correo y contraseña, beba." });
        }

        const resultado = await pool.query(
            "SELECT * FROM usuarios_wp WHERE email = $1",
            [email]
        );
        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        if (!usuario.verificado) {
            return res.status(403).json({ error: "Tu cuenta no está verificada. Revisa tu correo." });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }


        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                alias: usuario.alias
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            mensaje: "¡Bienvenidx de nuevo!",
            token: token,
            usuario: {
                id_usuario: usuario.id_usuario,
                alias: usuario.alias,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error en el servidor. Intenta más tarde." });
    }
});

router.post("/comentar", verificarLector, async (req, res) => {
    try {
        const { id_noticia, contenido } = req.body;

        const id_usuario = req.usuario.id_usuario;

        if (!contenido) {
            return res.status(400).json({ error: "No puedes enviar un comentario vacío, beba." });
        }

        const idNoticiaFinal = id_noticia || null;

        const nuevoComentario = await pool.query(
            `INSERT INTO comentarios_wp (id_usuario, id_noticia, contenido) 
             VALUES ($1, $2, $3) RETURNING *`,
            [id_usuario, idNoticiaFinal, contenido]
        );

        res.status(201).json({
            mensaje: "¡Comentario publicado con éxito!",
            comentario: nuevoComentario.rows[0]
        });

    } catch (error) {
        console.error("Error guardando comentario:", error);
        res.status(500).json({ error: "Error en el servidor. Intenta más tarde." });
    }
});

router.get("/comentarios", async (req, res) => {
    try {
        const { id_noticia } = req.query;

        let query;
        let parametros;

        if (id_noticia) {
            query = `
                SELECT c.id_comentario, c.contenido, c.fecha_creacion, u.alias
                FROM comentarios_wp c
                JOIN usuarios_wp u ON c.id_usuario = u.id_usuario
                WHERE c.id_noticia = $1
                ORDER BY c.fecha_creacion DESC
            `;
            parametros = [id_noticia];
        } else {
            query = `
                SELECT c.id_comentario, c.contenido, c.fecha_creacion, u.alias
                FROM comentarios_wp c
                JOIN usuarios_wp u ON c.id_usuario = u.id_usuario
                WHERE c.id_noticia IS NULL
                ORDER BY c.fecha_creacion DESC
            `;
            parametros = [];
        }

        const resultado = await pool.query(query, parametros);

        res.status(200).json(resultado.rows);

    } catch (error) {
        console.error("Error trayendo comentarios:", error);
        res.status(500).json({ error: "Error en el servidor. Intenta más tarde." });
    }
});

export default router;