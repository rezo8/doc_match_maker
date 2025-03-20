
import { Request, Response } from 'express';
import { Interest } from '../entities/Interest';
import { LanguageService } from '../services/LanguageService';

const languageService = new LanguageService()

export const getAllLanguages = async (req: Request, res: Response) => {
    try {
        const languages = await languageService.list()
        res.status(200).json({ languages });
    } catch (error) {
        console.error("Error fetching languages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const createLanguage = async (req: Request, res: Response) => {
    try {
        const language: Partial<Interest> = req.body;
        if (!language) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const createdLanguage = await languageService.addLanguage(language)
        res.status(200).json({ createdInterest: createdLanguage });
    } catch (error) {
        console.error("Error creating language:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteLanguage = async (req: Request, res: Response) => {
    try {
        const languageId = Number(req.params.languageId);

        if (isNaN(languageId)) {
            return res.status(400).json({ error: "Invalid language ID" });
        }

        const deleteRes = await languageService.deleteLanguage(languageId);

        if (deleteRes == null) {
            return res.status(404).json({ error: "Language Not Found" });
        }

        res.status(200).json({});
    } catch (error) {
        console.error("Error creating language:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};