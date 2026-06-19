import { pool } from "../config/db.js";

export const getNoticias = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT titulo, slug, resumen, portada
            FROM noticias
            ORDER BY fecha_publicacion DESC
            LIMIT 6
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error obteniendo noticias"
        });

    }

};
export const getTrending = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT titulo, slug
            FROM noticias
            ORDER BY fecha_publicacion DESC
            LIMIT 6
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error obteniendo noticias"
        });

    }

};

export const getNoticiaPorSlug = async (req, res) => {

    try {

        const { slug } = req.params;

        const result = await pool.query(`
            SELECT *
            FROM noticias n
            JOIN autores a
                ON n.autor_id = a.id_autor
            JOIN categorias c
                ON n.categoria_id = c.id_categoria
            WHERE slug = $1
        `, [slug]);

        res.json(result.rows[0] || null);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const buscarPorTitulo = async (req, res) => {

    try {

        const { titulo } = req.query;

        const result = await pool.query(`
            SELECT titulo, slug, resumen, portada
            FROM noticias
            WHERE titulo ILIKE $1
        `, [`%${titulo}%`]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getNoticiasPorFecha = async (req, res) => {

    try {

        const {
            fecha_inicio,
            fecha_fin
        } = req.query;

        const result = await pool.query(`
            SELECT titulo, slug, resumen, portada
            FROM noticias
            WHERE fecha_publicacion
                BETWEEN $1 AND $2
            ORDER BY fecha_publicacion DESC
        `, [
            fecha_inicio,
            fecha_fin
        ]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const crearNoticia = async (req, res) => {
    const { titulo, slug, resumen, contenido, portada, autor, categoria } = req.body;

    try {
        const query = `
            INSERT INTO noticias (titulo, slug, resumen, contenido, portada, fecha_publicacion, autor_id, categoria_id) 
            VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7) RETURNING id;
        `;
        
        const values = [titulo, slug, resumen, contenido, portada, autor, categoria];
        
        const result = await pool.query(query, values);
        
        res.status(201).json({ 
            mensaje: "¡Noticia publicada con éxito! Devoraste.", 
            id_insertado: result.rows[0].id_noticia 
        });

    } catch (error) {
        console.error("Error al insertar noticia en la BD:", error);
        res.status(500).json({ error: "Hubo un error en la base de datos y la queso." });
    }
};