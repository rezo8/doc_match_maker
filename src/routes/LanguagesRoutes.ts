import { Router } from 'express';

import { createLanguage, deleteLanguage, getAllLanguages } from '../controllers/LanguageController';

const router = Router();

// Define routes
router.get('/', getAllLanguages);
router.post('/', createLanguage);
router.delete('/:languageId', deleteLanguage);

export default router;