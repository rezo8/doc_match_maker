import { UserRole } from '../entities/User'; // Adjust the import path as needed

export class CreateUserDto {
    user: {
        email: string;
        name: string;
        role: UserRole;
        location?: string;
        experienceLevel?: number;
        dateOfBirth?: Date;
        profilePictureUrl?: string;
        phoneNumber?: string;
    };
    interests: { name: string }[];
    languages: { name: string }[];
}