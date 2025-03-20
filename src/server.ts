import 'dotenv/config'; // Load environment variables
import { AppDataSource } from './config/ormconfig'; // Import your TypeORM DataSource
import app from './app'; // Import the configured Express app

// This class is for handling database connections and start the server.

// Start the server
const PORT = process.env.PORT || 8080;

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully');

        // Start the Express server after the database connection is established
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });