import { pool } from "../config/db.js";

export const getAutores = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM autores
            WHERE id_autor >= 3
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
            SELECT titulo, slug, resumen, portada
            FROM noticias
            WHERE autor_id = $1
            ORDER BY fecha_publicacion DESC
        `, [id]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};