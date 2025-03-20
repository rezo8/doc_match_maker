// For some reason this shows compilation error :( but imports need to be capitalized.
import { DataSource } from 'typeorm';
import { Language } from '../entities/Language';
import { User } from '../entities/User';
import { UserLanguage } from '../entities/UserLanguage';
import { Interest } from '../entities/Interest';
import { UserInterest } from '../entities/UserInterest';
import { Match } from '../entities/Match';

export const AppDataSource = new DataSource({
    type: 'postgres', // Database type
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, // Automatically sync schema (disable in production)
    logging: true,
    entities: [Language, User, UserLanguage, Interest, UserInterest, Match], // Add all entities here
    migrations: ['src/migrations/*.ts'], // Add all migrations here
    subscribers: ['src/subscribers/*.ts'], // Add all subscribers here
});