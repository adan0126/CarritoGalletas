import supabase from '../config/dbconfig.js';

// Endpoint: registro de usuarios
export const register = async (req, res) => {
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
};

// Endpoint: login
export const login = async (req, res) => {
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
};

// Endpoint: logout (placeholder para simetría con el frontend)
export const logout = (req, res) => {
	// Aquí se podrían limpiar sesiones o tokens; el frontend ya borra almacenamiento local.
	return res.json({ message: 'Sesión finalizada.' });
};

// Endpoint: obtener productos
export const getProducts = async (req, res) => {
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
};

// Endpoint: crear un nuevo producto
export const create = async (req, res) => {
	const { categoryid, name, price, stock, img } = req.body;

	if (!name || !price) {
		return res.status(400).json({ message: 'El nombre y precio del producto son requeridos.' });
	}

	try {
		const { data: created, error: insertError } = await supabase
			.from('products')
			.insert({
				categoryid: categoryid || null,
				name,
				price,
				stock: stock || 0,
				img: img || null
			})
			.select()
			.single();

		if (insertError) {
			console.error('Error creando producto:', insertError);
			return res.status(500).json({ message: 'No se pudo crear el producto.' });
		}

		return res.status(201).json({ product: created });
	} catch (err) {
		console.error('Fallo inesperado en /products:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};

// --- Endpoints para carrito ---

// Añade un producto al carrito
export const addToCart = async (req, res) => {
	const { userId, productId, quantity = 1 } = req.body;
	if (!userId || !productId) return res.status(400).json({ message: 'userId y productId son requeridos.' });

	try {
		const { data: product, error: prodErr } = await supabase
			.from('products')
			.select('id')
			.eq('id', productId)
			.limit(1);

		if (prodErr) {
			console.error('Error verificando producto:', prodErr);
			return res.status(500).json({ message: 'Error verificando producto.' });
		}

		if (!product || product.length === 0) {
			return res.status(404).json({ message: 'Producto no encontrado.' });
		}

		const { data: existing, error: existErr } = await supabase
			.from('cart')
			.select('*')
			.eq('usr_id', userId)
			.eq('game_id', productId)
			.limit(1);

		if (existErr) {
			console.error('Error comprobando carrito:', existErr);
			return res.status(500).json({ message: 'Error comprobando carrito.' });
		}


		if (existing && existing.length > 0) {
			// Ya existe la fila, rechazar
			return res.status(409).json({ message: 'Este juego ya está en el carrito.' });
		}

		// Generar id manualmente
		const { data: maxIdData, error: maxErr } = await supabase
			.from('cart')
			.select('id')
			.order('id', { ascending: false })
			.limit(1);
		if (maxErr) {
			console.error('Error obteniendo ID máximo de cart:', maxErr);
			return res.status(500).json({ message: 'No se pudo generar el ID del carrito.' });
		}
		const newId = maxIdData && maxIdData.length > 0 ? (maxIdData[0].id + 1) : 1;

		const { data: inserted, error: insertErr } = await supabase
			.from('cart')
			.insert({ id: newId, usr_id: userId, game_id: productId })
			.select()
			.single();

		if (insertErr) {
			console.error('Error insertando en carrito:', insertErr);
			return res.status(500).json({ message: 'No se pudo agregar al carrito.' });
		}

		return res.status(201).json({ item: inserted });
	} catch (err) {
		console.error('Fallo inesperado en /api/cart/add:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};

// Obtener los items del carrito para un usuario
export const getCart = async (req, res) => {
	const userId = req.query.userId || req.body.userId;
	if (!userId) return res.status(400).json({ message: 'userId es requerido.' });

	try {
		const { data: items, error: itemsErr } = await supabase
			.from('cart')
			.select('*')
			.eq('usr_id', userId)
			.order('id', { ascending: true });

		if (itemsErr) {
			console.error('Error obteniendo carrito:', itemsErr);
			return res.status(500).json({ message: 'No se pudo obtener el carrito.' });
		}

		const productIds = items.map(i => i.game_id);
		let productsMap = {};
		if (productIds.length > 0) {
			const { data: products } = await supabase
				.from('products')
				.select('id, prod_name, prod_price, prod_img, prod_stock')
				.in('id', productIds);

			productsMap = (products || []).reduce((acc, p) => {
				acc[p.id] = p;
				return acc;
			}, {});
		}

		const detailed = items.map(it => ({
			...it,
			product: productsMap[it.game_id] || null
		}));

		return res.json({ items: detailed });
	} catch (err) {
		console.error('Fallo inesperado en /api/cart:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};

// Eliminar un item del carrito (por usuario + productId)
export const removeFromCart = async (req, res) => {
	const { userId, productId } = req.body;
	if (!userId || !productId) return res.status(400).json({ message: 'userId y productId son requeridos.' });

	try {
		const { error } = await supabase
			.from('cart')
			.delete()
			.eq('usr_id', userId)
			.eq('game_id', productId);

		if (error) {
			console.error('Error eliminando item del carrito:', error);
			return res.status(500).json({ message: 'No se pudo eliminar el item.' });
		}

		return res.json({ message: 'Item eliminado.' });
	} catch (err) {
		console.error('Fallo inesperado en /api/cart/remove:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};

// Vaciar carrito del usuario (Cuando hace la acción de "Comprar")
export const clearCart = async (req, res) => {
	const { userId } = req.body;
	if (!userId) return res.status(400).json({ message: 'userId es requerido.' });

	try {
		const { error } = await supabase
			.from('cart')
			.delete()
			.eq('usr_id', userId);

		if (error) {
			console.error('Error vaciando carrito:', error);
			return res.status(500).json({ message: 'No se pudo vaciar el carrito.' });
		}

		return res.json({ message: 'Carrito vaciado.' });
	} catch (err) {
		console.error('Fallo inesperado en /api/cart/clear:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};

// Actualizar cantidad de un item del carrito (si cantidad <= 0 elimina)
export const updateCartQuantity = async (req, res) => {
	const { userId, productId, quantity } = req.body;
	if (!userId || !productId || typeof quantity === 'undefined') {
		return res.status(400).json({ message: 'userId, productId y quantity son requeridos.' });
	}

	try {
		if (Number(quantity) <= 0) {
			const { error } = await supabase
				.from('cart')
				.delete()
				.eq('usr_id', userId)
				.eq('game_id', productId);
			if (error) {
				console.error('Error eliminando item por cantidad <= 0:', error);
				return res.status(500).json({ message: 'No se pudo actualizar el carrito.' });
			}
			return res.json({ message: 'Item eliminado por cantidad 0.' });
		}

    // Validar que la cantidad no exceda el stock
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('prod_stock')
      .eq('id', productId)
      .limit(1);

    if (prodErr || !product || product.length === 0) {
      console.error('Error verificando stock del producto:', prodErr);
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    const stock = product[0].prod_stock;
    if (Number(quantity) > stock) {
      return res.status(400).json({
        message: `Solo hay ${stock} unidades disponibles.`,
        maxStock: stock
      });
    }

    const { data: updated, error: updErr } = await supabase
      .from('cart')
      .update({ cart_quantity: Number(quantity) })
      .eq('usr_id', userId)
      .eq('game_id', productId)
      .select()
      .single();

    if (updErr) {
      console.error('Error actualizando cantidad del carrito:', updErr);
      return res.status(500).json({ message: 'No se pudo actualizar la cantidad.' });
    }

    return res.json({ item: updated });
  } catch (err) {
    console.error('Fallo inesperado en /api/cart/update:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Pasar el carrito a la biblioteca del usuario
export const checkoutLibrary = async (req, res) => {
	const { userId, items } = req.body;
	if (!userId || !Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ message: 'userId e items son requeridos.' });
	}

	try {
		const gameIds = items.map(i => Number(i.gameId)).filter(Boolean);
		const quantitiesMap = items.reduce((acc, it) => {
			const gameId = Number(it.gameId);
			const qty = Math.max(1, Number(it.quantity) || 1);
			if (gameId) acc[gameId] = (acc[gameId] || 0) + qty;
			return acc;
		}, {});

		if (gameIds.length === 0) {
			return res.status(400).json({ message: 'No hay juegos para procesar.' });
		}

		// Validar y restar stock inmediatamente para evitar condiciones de carrera
		for (const gameId of gameIds) {
			const qty = quantitiesMap[gameId] || 1;

			const { data: product, error: prodErr } = await supabase
				.from('products')
				.select('id, prod_stock')
				.eq('id', gameId)
				.single();

			if (prodErr || !product) {
				console.error('Error obteniendo producto:', prodErr);
				return res.status(404).json({ message: `Producto ${gameId} no encontrado.` });
			}

			if (qty > product.prod_stock) {
				return res.status(400).json({
					message: `Stock insuficiente para el juego. Disponible: ${product.prod_stock}, solicitado: ${qty}`
				});
			}

			const newStock = product.prod_stock - qty;
			const { error: stockUpdErr } = await supabase
				.from('products')
				.update({ prod_stock: newStock })
				.eq('id', gameId);

			if (stockUpdErr) {
				console.error('Error actualizando stock:', stockUpdErr);
				return res.status(500).json({ message: 'No se pudo actualizar el stock.' });
			}
		}

		const { data: existingLib, error: libErr } = await supabase
			.from('library')
			.select('id, game_id, lib_quantity')
			.eq('usr_id', userId)
			.in('game_id', gameIds);

		if (libErr) {
			console.error('Error consultando biblioteca:', libErr);
			return res.status(500).json({ message: 'No se pudo verificar la biblioteca.' });
		}

		const { data: maxIdData, error: maxErr } = await supabase
			.from('library')
			.select('id')
			.order('id', { ascending: false })
			.limit(1);

		if (maxErr) {
			console.error('Error obteniendo ID máximo de biblioteca:', maxErr);
			return res.status(500).json({ message: 'No se pudo generar el ID de la biblioteca.' });
		}

		let nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

		for (const gameId of gameIds) {
			const qty = quantitiesMap[gameId] || 1;
			const existing = (existingLib || []).find(l => l.game_id === gameId);

			if (existing) {
				const { error: updErr } = await supabase
					.from('library')
					.update({ lib_quantity: Number(existing.lib_quantity || 0) + qty })
					.eq('usr_id', userId)
					.eq('game_id', gameId);

				if (updErr) {
					console.error('Error actualizando biblioteca:', updErr);
					return res.status(500).json({ message: 'No se pudo actualizar la biblioteca.' });
				}
			} else {
				const { error: insErr } = await supabase
					.from('library')
					.insert({ id: nextId, usr_id: userId, game_id: gameId, lib_quantity: qty });

				if (insErr) {
					console.error('Error insertando en biblioteca:', insErr);
					return res.status(500).json({ message: 'No se pudo agregar a la biblioteca.' });
				}
				nextId += 1;
			}
		}

		const { error: clearErr } = await supabase
			.from('cart')
			.delete()
			.eq('usr_id', userId);

		if (clearErr) {
			console.error('Error limpiando carrito después del checkout:', clearErr);
			return res.status(500).json({ message: 'Compra creada, pero no se pudo vaciar el carrito.' });
		}

		return res.json({ message: 'Compra completada. Juegos agregados a tu biblioteca.' });
	} catch (err) {
		console.error('Fallo inesperado en checkout:', err);
		return res.status(500).json({ message: 'Error interno del servidor.' });
	}
};
