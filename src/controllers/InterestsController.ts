
import { Request, Response } from 'express';
import { Interest } from '../entities/Interest';
import { InterestService } from '../services/InterestService';

const interestService = new InterestService()

export const getAllInterests = async (req: Request, res: Response) => {
    try {
        const interests = await interestService.list()
        res.status(200).json({ interests });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const createInterest = async (req: Request, res: Response) => {
    try {
        const interest: Partial<Interest> = req.body;
        if (!interest) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const createdInterest = await interestService.addInterest(interest)
        res.status(200).json({ createdInterest });
    } catch (error) {
        console.error("Error creating interest:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteInterest = async (req: Request, res: Response) => {
    try {
        const interestId = Number(req.params.interestId);
        if (isNaN(interestId)) {
            return res.status(400).json({ error: "Invalid interest ID" });
        }

        const deleteRes = await interestService.deleteInterest(interestId);
        if (deleteRes == null) {
            return res.status(404).json({ error: "Interest Not Found" });
        }

        res.status(200).json({});
    } catch (error) {
        console.error("Error creating interest:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};