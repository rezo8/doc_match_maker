import express from 'express';
import userRoutes from './routes/UserRoutes'
// import { UserController } from './controllers/UserController';
// import { errorHandler } from './middleware/errorHandler';

// This class is for configure your Express app (middleware, routes, etc.) and export it.
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Routes
// app.use('/users', UserController); // Example route

// Error handling middleware
// app.use(errorHandler);

// Export the app for use in server.ts or tests
export default app;

