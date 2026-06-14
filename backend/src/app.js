import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import rateLimit from "express-rate-limit"; 

import noticiasRoutes from "../routes/noticias.routes.js";
import autoresRoutes from "../routes/autores.routes.js";
import categoriasRoutes from "../routes/categorias.routes.js";
import authRoutes from "../routes/auth.routes.js"; 
import uploadRoutes from "../routes/upload.routes.js";
const helmet = require('helmet');
const app = express();
// 🛡️ El cadenero de seguridad (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https://www.google-analytics.com", "https://region1.google-analytics.com"]
    }
  }
}));
app.use(cors({
    origin: "https://entre-lineas-f6ek.onrender.com", 
    credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 

const limitadorGeneral = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: "¡Tranquila beba! Estás recargando la página muy rápido. Toca soportar y esperar 15 minutos. 💅✨" },
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use("/api", limitadorGeneral);


app.use("/api/noticias", noticiasRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.send("¡Bienvenido a Entre Líneas API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});