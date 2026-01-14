// Rutas de páginas (renderizan los .ejs que vive en Frontend/views)

import { Router } from 'express';
import * as productController from '../controllers/productcontroller.js';

const router = Router();

app.get(['/', '/main', '/main.html'], (req, res) => res.sendFile(path.join(__dirname, '../Frontend/views/main.html')));
app.get(['/login', '/login.html'], (req, res) => res.render('login'));
app.get(['/registro', '/registro.html', '/register', '/register.html'], (req, res) => res.render('registro'));
app.get(['/perfil', '/perfil.html'], (req, res) => res.render('perfil'));
app.get(['/productos', '/productos.html', '/catalogo', '/catalogo.html'], (req, res) => res.render('productos'));
app.get(['/carrito', '/carrito.html', '/index', '/index.html'], (req, res) => res.render('index'));
app.get(['/filtro', '/filtro.html'], (req, res) => res.render('filtro'));
app.get(['/logout', '/logout.html'], (req, res) => res.sendFile(path.join(__dirname, '../Frontend/views/logout.html')));

export default router;