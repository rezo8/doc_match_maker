import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres', // Database type
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, // Automatically sync schema (disable in production)
    logging: true,
    entities: [], // Add all entities here
    migrations: ['src/migrations/*.ts'], // Add all migrations here
    subscribers: ['src/subscribers/*.ts'], // Add all subscribers here
});