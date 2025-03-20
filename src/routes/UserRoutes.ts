import { Router } from 'express';

import { getUser, createUser, getAllUsers } from '../controllers/UserController';

const router = Router();

// Define routes
router.get('/:userUuid', getUser);
router.get('/', getAllUsers);
router.post('/', createUser);

export default router;