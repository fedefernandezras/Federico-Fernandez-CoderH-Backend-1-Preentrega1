import { Router } from "express";
import fs from "fs";

const router = Router();
const cartPath = "src/managers/data/cart.json";
const productsPath = "src/managers/data/products.json";

// Función para leer los carritos desde data
const readCart = () => {
    if (!fs.existsSync(cartPath)) {
        fs.writeFileSync(cartPath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(cartPath, 'utf-8'));
};

// Función para leer los productos desde data
const readProducts = () => {
    if (!fs.existsSync(productsPath)) {
        return []; // Si no existe el archivo de productos, retorna un arrays vacío
    }
    return JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
};

// Función para guardar los carritos en el json
const saveCart = (carts) => {
    fs.writeFileSync(cartPath, JSON.stringify(carts, null, 2));
};

// Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readCart();
    const newCart = { id: carts.length ? (parseInt(carts[carts.length - 1].id) + 1).toString() : "1", products: [] };
    carts.push(newCart);
    saveCart(carts);
    res.status(201).json(newCart);
});

// Obtener productos de un carrito por ID
router.get('/:cid', (req, res) => {
    const carts = readCart();
    const cart = carts.find(c => c.id === req.params.cid);   
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readCart();
    const cart = carts.find(c => c.id === req.params.cid);  
    
    if (cart) {
        const productId = req.params.pid;  

        // Leer productos del products.json
        const products = readProducts();

        // Verificar si el producto con el productId existe en products.json
        const productExists = products.some(product => product.id === productId);

        if (!productExists) {
            return res.status(400).json({ error: 'Producto no encontrado o ID de producto incorrecto' });
        }

        // Buscar si el producto ya está en el carrito
        const existingProduct = cart.products.find(p => p.product === productId);

        if (existingProduct) {
            // Si el producto ya existe en el carrito, aumentar la cantidad +1
            existingProduct.quantity += 1;
        } else {
            // Si el producto no existe en el carrito, agregarlo
            cart.products.push({ product: productId, quantity: 1 });
        }

        saveCart(carts);
        res.status(200).json(cart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

export default router;
