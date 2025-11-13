import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Hello route
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from Wendor Backend!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Wendor Backend',
    timestamp: new Date().toISOString()
  });
});

// Products API - read from data.json in project root
let products = [];
async function loadProducts() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const dataPath = path.join(__dirname, '..', 'data.json');
    const raw = await fs.readFile(dataPath, 'utf8');
    products = JSON.parse(raw);
    console.log(`Loaded ${products.length} products from ${dataPath}`);
  } catch (err) {
    console.error('Failed to load products data.json:', err.message);
    products = [];
  }
}

// load on startup
loadProducts();

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    // optional ?limit= and ?q= search
    let list = products;
    const { limit, q } = req.query;
    if (q) {
      const ql = String(q).toLowerCase();
      list = list.filter(p => (p.product_name || '').toLowerCase().includes(ql) || (p.description || '').toLowerCase().includes(ql));
    }
    if (limit) {
      const n = parseInt(limit, 10);
      if (!Number.isNaN(n) && n > 0) list = list.slice(0, n);
    }
    res.json({ count: list.length, products: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Wendor Backend API',
    version: '1.0.0',
    endpoints: {
      hello: '/hello',
      health: '/health',
      products: '/api/products'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
