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

export class UpdateUserInterestsDto {
    interests: { name: string }[];
}

// TODO figure out validation of language proficiency
export class UpdateUserLanguagesDto {
    languages: { name: string, proficiency: LanguageProficiency }[];
}