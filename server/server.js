import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import { response, request } from 'express';
import cors from 'cors';
import productsRoutes from './routes/productsRoutes.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(async (request, response, next) => {
    try {
        const decition = await aj.protect(request, {
            requested: 1
        });
        if (decition.isDenied()) {
            if (decition.reason.isRateLimit()) {
                response.status(429).json({
                    error: 'Rate limit exceeded,Too many requests!!'
                });
            }
            else if (decition.reason.isBot()) {
                response.status(403).json({
                    error: 'Bot access denied!!'
                });
            } else {
                response.status(403).json({
                    error: 'Forbidden'
                });
            }
            return;
        }
        if (decition.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            response.status(403).json({
                error: 'Spoofed bot detected!!'
            });
            return;
        }
        next();
    } catch (error) {
        console.log(error.message);
        next(error);
    }
});
app.use('/api/products', productsRoutes);
const initDb = async () => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(500) NOT NULL,
            price DECIMAL(10,2) NOT NULL,       
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        console.log(`Database initalized successfully!!`);
    } catch (error) {
        throw new Error(error);
    }
};
initDb().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Your server is running at => http://localhost:${process.env.PORT}`);
    });
}).catch((error) => {
    console.log(error.message);
});
