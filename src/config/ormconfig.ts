// For some reason this shows compilation error :( but imports need to be capitalized.
import { DataSource } from 'typeorm';
import { Language } from '../entities/Language';
import { User } from '../entities/User';
import { UserLanguage } from '../entities/UserLanguage';
import { Interest } from '../entities/Interest';
import { UserInterest } from '../entities/UserInterest';
import { Match } from '../entities/Match';

export const AppDataSource = new DataSource({
    type: "postgres", // Define database type
    url: process.env.DATABASE_URL, // Load database URL from environment variables
    synchronize: true, // Set to false in production
    logging: true, // Enable query logging for debugging
    ssl: {
        rejectUnauthorized: false, // Required for Render's SSL setup
    },
    entities: [Language, User, UserLanguage, Interest, UserInterest, Match], // Add all entities here
    migrations: ["src/migration/**/*.ts"], // Path to migrations
    subscribers: ["src/subscriber/**/*.ts"], // Path to subscribers
});