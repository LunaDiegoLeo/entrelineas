import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

const router = Router();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const verificarToken = (req, res, next) => {
    const token = req.cookies.entrelineas_token;
    
    if (!token) return res.status(401).json({ error: "No tienes permiso" });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secreto_desarrollo_123");
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};

router.post("/", verificarToken, upload.single("imagen"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No enviaste ninguna imagen" });

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const resultado = await cloudinary.uploader.upload(dataURI, {
            folder: "entrelineas_noticias", 
            transformation: [
                { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }
            ]
        });

        res.status(200).json({ secure_url: resultado.secure_url });

    } catch (error) {
        console.error("Error en Cloudinary:", error);
        res.status(500).json({ error: "Error subiendo la imagen a la nube." });
    }
});

export default router;