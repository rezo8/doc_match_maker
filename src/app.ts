import compression from 'compression';
import express from 'express';
import interestRoutes from './routes/InterestRoutes';
import languageRoutes from './routes/LanguagesRoutes';
import userRoutes from './routes/UserRoutes';

import bodyParser from 'body-parser';
import morganBody from 'morgan-body';

const app = express();

// must parse body before morganBody as body will be logged
app.use(bodyParser.json());
morganBody( // hook up morgan to express app.
    app,
    { filterParameters: ["email", "phoneNumber", "dateOfBirth", "location"] }); // Example filters. (wish I could add user name but doesn't work as it filters others.)
app.use(compression())

// Routes
app.use('/api/users', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/languages', languageRoutes);

// Export the app for use in server.ts or tests
export default app;

