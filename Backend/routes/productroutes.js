// Rutas de páginas y APIs

import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as productController from '../controllers/productcontroller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// --- Rutas de autenticación ---
router.post('/register', productController.register);
router.post('/login', productController.login);
router.post('/logout', productController.logout);

// --- Rutas de productos ---
router.post('/products', productController.create);
router.put('/products/:id', productController.updateProduct);
router.get('/api/products', productController.getProducts);

// --- Rutas del carrito ---
router.post('/api/cart/add', productController.addToCart);
router.get('/api/cart', productController.getCart);
router.delete('/api/cart/remove', productController.removeFromCart);
router.post('/api/cart/clear', productController.clearCart);
router.post('/api/library/checkout', productController.checkoutLibrary);
router.get('/api/library', productController.getLibrary);

// --- Rutas de páginas (renderizan los .ejs que viven en Frontend/views) ---
router.get(['/', '/main', '/main.html'], (req, res) => {
	res.sendFile(path.join(__dirname, '../../Frontend/views/main.html'));
});
router.get(['/login', '/login.html'], (req, res) => res.render('login'));
router.get(['/registro', '/registro.html', '/register', '/register.html'], (req, res) => res.render('registro'));
router.get(['/perfil', '/perfil.html'], (req, res) => res.render('perfil'));
router.get(['/productos', '/productos.html', '/catalogo', '/catalogo.html'], (req, res) => res.render('productos'));
router.get(['/carrito', '/carrito.html', '/index', '/index.html'], (req, res) => res.render('carrito'));
router.get(['/metodoPago', '/metodoPago.html'], (req, res) => res.render('metodoPago'));
router.get(['/biblioteca', '/biblioteca.html'], (req, res) => res.render('biblioteca'));
router.get(['/admin', '/admin.html'], (req, res) => res.render('admin'));
router.get(['/logout', '/logout.html'], (req, res) => {
	res.sendFile(path.join(__dirname, '../../Frontend/views/logout.html'));
});

export default router;
