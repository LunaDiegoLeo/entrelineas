import { pool } from "../config/db.js";

export const getAutores = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT id_autor, nombre_autor
            FROM autores
            WHERE id_autor > 2
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getAutoresIndex = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT id_autor, nombre_autor, bio, foto
            FROM autores
            WHERE id_autor > 2 and invitado = false
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getAutoresInvitadxs = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT a.id_autor, a.nombre_autor, a.foto, n.titulo, n.slug, n.invitado_resumen
            FROM autores a  JOIN noticias n ON a.id_autor = n.autor_id
            WHERE a.id_autor > 2 and a.invitado = true
            ORDER BY n.fecha_publicacion DESC

        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getNoticiasPorAutor = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT id, titulo, slug, resumen, portada
            FROM noticias
            WHERE autor_id = $1 AND invitado_resumen = false
            ORDER BY fecha_publicacion DESC
        `, [id]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};