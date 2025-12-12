require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const { randomBytes, scryptSync, timingSafeEqual } = require('crypto');
const supabase = require('./dbconfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//Adán aquí debe ir true o false?      ^^^^^

// Static assets (CSS/JS/imagenes)
app.use(express.static(path.join(__dirname, '../Frontend')));

// Motor de vistas EJS para servir las páginas del frontend
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Frontend/views'));

/* Vamos a usar hash?
function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;

    function verifyPassword(password, storedHash) {
	const [salt, originalHash] = (storedHash || '').split(':');
	if (!salt || !originalHash) return false;

	const computedHash = scryptSync(password, salt, 64);
	const originalBuffer = Buffer.from(originalHash, 'hex');

	if (originalBuffer.length !== computedHash.length) return false;
	return timingSafeEqual(originalBuffer, computedHash);
}
}
*/


// Rutas de páginas (renderizan los .ejs que vive en Frontend/views)
app.get(['/', '/main', '/main.html'], (req, res) => res.sendFile(path.join(__dirname, '../Frontend/views/main.html')));
app.get(['/login', '/login.html'], (req, res) => res.render('login'));
app.get(['/registro', '/registro.html', '/register', '/register.html'], (req, res) => res.render('registro'));
app.get(['/perfil', '/perfil.html'], (req, res) => res.render('perfil'));
app.get(['/productos', '/productos.html', '/catalogo', '/catalogo.html'], (req, res) => res.render('productos'));
app.get(['/carrito', '/carrito.html', '/index', '/index.html'], (req, res) => res.render('index'));
app.get(['/filtro', '/filtro.html'], (req, res) => res.render('filtro'));
app.get(['/logout', '/logout.html'], (req, res) => res.sendFile(path.join(__dirname, '../Frontend/views/logout.html')));

// Endpoint: registro de usuarios
app.post('/register', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
	}

	if (password.length < 8) {
		return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
	}

	try {
		const { data: existing, error: existingError } = await supabase
			.from('users')
			.select('id')
			.eq('usr_email', email)
			.limit(1);

		if (existingError) {
			console.error('Error verificando usuario:', existingError);
			return res.status(500).json({ message: 'No se pudo verificar el usuario.' });
		}

		if (existing && existing.length > 0) {
			return res.status(409).json({ message: 'El correo ya está registrado.' });
		}

		// Obtener el ID más grande actual
		const { data: maxIdData, error: maxIdError } = await supabase
			.from('users')
			.select('id')
			.order('id', { ascending: false })
			.limit(1);

		if (maxIdError) {
			console.error('Error obteniendo ID máximo:', maxIdError);
			return res.status(500).json({ message: 'No se pudo generar el ID del usuario.' });
		}

		const newId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

		// const passwordHash = hashPassword(password);
		const passwordHash = password; // Temporalmente sin hash

		const { data: created, error: insertError } = await supabase
			.from('users')
			.insert({ id: newId, usr_email: email, usr_password: passwordHash })
			.select('id, usr_email')
			.single();

		if (insertError) {
			console.error('Error creando usuario:', insertError);
			return res.status(500).json({ message: 'No se pudo crear el usuario.' });
		}

		return res.status(201).json({ user: created });
	} catch (err) {
		console.error('Fallo inesperado en /register:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
});

// Endpoint: login
app.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
	}

	try {
		const { data: users, error: fetchError } = await supabase
			.from('users')
			.select('id, usr_email, usr_password')
			.eq('usr_email', email)
			.limit(1);

		if (fetchError) {
			console.error('Error consultando usuario:', fetchError);
			return res.status(500).json({ message: 'No se pudo validar al usuario.' });
		}

		const user = users && users[0];
		// Temporalmente sin hash - comparación directa
		if (!user || user.usr_password !== password) {
			return res.status(401).json({ message: 'Credenciales inválidas.' });
		}

		// Devolver solo confirmación sin exponer datos
		return res.json({ id: user.id, email: user.usr_email });
	} catch (err) {
		console.error('Fallo inesperado en /login:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
});

// Endpoint: logout (placeholder para simetría con el frontend)
app.post('/logout', (req, res) => {
	// Aquí se podrían limpiar sesiones o tokens; el frontend ya borra almacenamiento local.
	return res.json({ message: 'Sesión finalizada.' });
});

// Endpoint: obtener productos
app.get('/api/products', async (req, res) => {
	try {
		const { data: products, error } = await supabase
			.from('products')
			.select('*')
			.order('id', { ascending: true });

		if (error) {
			console.error('Error obteniendo productos:', error);
			return res.status(500).json({ message: 'No se pudieron obtener los productos.' });
		}

		return res.json({ products });
	} catch (err) {
		console.error('Fallo inesperado en /api/products:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
});

// Inicio del servidor
app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
