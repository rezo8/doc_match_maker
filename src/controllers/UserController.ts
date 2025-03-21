import { Request, Response } from 'express';
import { CreateUserDto, UpdateUserInterestsDto, UpdateUserLanguagesDto } from '../dtos/CreateUserDTO';
import { LanguageProficiency } from '../entities/UserLanguage';
import { UserService } from '../services/UserService';

const userService = new UserService()

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query; // Extract query parameters
        const users = await userService.list(queryParams)
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userUuid = req.params.userUuid;

        const user = await userService.findByUuid(userUuid); // Await the promise

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const createUser = async (req: Request, res: Response) => {
    const { user, interests, languages }: CreateUserDto = req.body;

    // Validate the request body
    if (!user || !interests || !languages) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Save the user to the database
        const languageMap = languages.reduce((map, { name, proficiency }) => map.set(name, proficiency), new Map<string, LanguageProficiency>());
        const newUser = await userService.createUserWithDetails(user, interests.map(x => x.name), languageMap);

        // Return the response
        res.status(201).json({
            message: 'User created successfully',
            data: {
                user: newUser,
                interests,
                languages,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserInterests = async (req: Request, res: Response) => {
    const userId = req.params.userUuid
    const updateUserInterestsReq: UpdateUserInterestsDto = req.body

    if (!updateUserInterestsReq) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Save the user to the database
        await userService.updateUserInterests(userId, updateUserInterestsReq.interests.map(x => x.name));

        const updatedUser = await userService.findByUuid(userId)
        // Return the response
        res.status(201).json({
            message: 'User Interests updated successfully',
            data: {
                user: updatedUser
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserLanguages = async (req: Request, res: Response) => {
    const userId = req.params.userUuid
    const updateLanguagesReq: UpdateUserLanguagesDto = req.body

    if (!updateLanguagesReq) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // Save the user to the database
        const languageMap = updateLanguagesReq.languages.reduce((map, { name, proficiency }) => map.set(name, proficiency), new Map<string, LanguageProficiency>());
        await userService.updateUserLanguages(userId, languageMap);
        const updatedUser = await userService.findByUuid(userId)
        // Return the response
        res.status(201).json({
            message: 'User Languages updated successfully',
            data: {
                user: updatedUser
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};