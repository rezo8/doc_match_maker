import { Router } from 'express';

import { getExample, createExample } from '../controllers/UserController';

const router = Router();

// Define routes
router.get('/:userUuid', getExample);
router.post('/', createExample);

export default router;