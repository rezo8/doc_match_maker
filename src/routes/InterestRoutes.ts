import { Router } from 'express';

import { createInterest, getAllInterests, deleteInterest } from '../controllers/InterestsController';

const router = Router();

// Define routes
router.get('/', getAllInterests);
router.post('/', createInterest);
router.delete('/:interestId', deleteInterest)

export default router;