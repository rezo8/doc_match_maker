import { Language } from '../entities/Language';
import { UserRole } from '../entities/User'; // Adjust the import path as needed
import { LanguageProficiency } from '../entities/UserLanguage';

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
    languages: { name: string, proficiency: LanguageProficiency }[];
}