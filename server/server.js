import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import productsRoutes from './routes/productsRoutes.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
const __dirname = path.resolve();
const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : '',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));

// Arcjet protection middleware
app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: 'Rate limit exceeded, Too many requests!' });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ error: 'Bot access denied!' });
            } else {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        if (decision.results.some(result => result.reason.isBot() && result.reason.isSpoofed())) {
            return res.status(403).json({ error: 'Spoofed bot detected!' });
        }

        next();
    } catch (error) {
        console.error(error.message);
        next(error);
    }
});

// Routes
app.use('/api/products', productsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, 'client', 'dist');
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
    });
}
const initDb = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(500) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('DB init error:', error.message);
        throw error;
    }
};
const PORT = process.env.PORT || 2500;
initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at => http://localhost:${PORT}`);
            console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(error => {
        console.error('Server failed to start:', error.message);
    });
