import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto } from '../dtos/CreateUserDTO';

const userService = new UserService()
export const getExample = (req: Request, res: Response) => {
    const userUuid = req.params.userUuid

    const user = userService.findByUuid(userUuid)

    res.status(200).json({ message: 'Hello from the example controller! for user ' + userUuid });

};


export const createExample = async (req: Request, res: Response) => {
    const { user, interests, languages }: CreateUserDto = req.body;

    console.log(user)
    console.log(interests)
    console.log(languages)
    // Validate the request body
    if (!user || !interests || !languages) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Save the user to the database
        const newUser = userService.createUserWithDetails(user);

        // Save interests and languages (assuming you have repositories for them)
        // Example:
        // const interestRepository = getRepository(Interest);
        // const newInterests = interestRepository.create(interests);
        // await interestRepository.save(newInterests);

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