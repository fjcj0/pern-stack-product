import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import { response, request } from 'express';
import cors from 'cors';
import productsRoutes from './routes/productsRoutes.js';
import { sql } from './config/db.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.get('/test', (request, response) => {
    console.log(response.getHeaders());
    return response.send('<h1>Hello world!!!</h1>');
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
