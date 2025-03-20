import express from 'express';
import interestRoutes from './routes/InterestRoutes';
import languageRoutes from './routes/LanguagesRoutes';
import userRoutes from './routes/UserRoutes';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/languages', languageRoutes);

// Export the app for use in server.ts or tests
export default app;

