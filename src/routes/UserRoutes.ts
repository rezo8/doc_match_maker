import { Router } from 'express';

import { createUser, getAllUsers, getUser, updateUserInterests, updateUserLanguages } from '../controllers/UserController';

const router = Router();

// Define routes
router.get('/:userUuid', getUser);
router.put('/:userUuid/interests', updateUserInterests);
router.put('/:userUuid/languages', updateUserLanguages);
router.get('/', getAllUsers);
router.post('/', createUser);

export default router;