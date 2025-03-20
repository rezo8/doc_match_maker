import 'dotenv/config';
import express from 'express';
import { AppDataSource } from './config/ormconfig';

const app = express();

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((error) => console.log('Database connection error:', error));