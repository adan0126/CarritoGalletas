require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const { randomBytes, scryptSync, timingSafeEqual } = require('crypto');
const supabase = require('./config/dbconfig');

// Rutas que tenemos que consumir
import productRoutes from './routes/productroutes.js';

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

// Usar las rutas definidas de los productos
app.use('/', productRoutes);

// Inicio del servidor
app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
