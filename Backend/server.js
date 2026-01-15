import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productroutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets (CSS/JS/imagenes)
app.use(express.static(path.join(__dirname, '../Frontend')));

// Motor de vistas EJS para servir las páginas del frontend
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Frontend/views'));

// Usar las rutas definidas
app.use('/', productRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
	res.status(404).json({ message: 'Ruta no encontrada' });
});

// Inicio del servidor
app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
