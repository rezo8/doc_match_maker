import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { AppDataSource } from '../config/ormconfig';
import { Interest } from '../entities/Interest';
import { InterestRepository } from '../repositories/InterestsRepository';
import { UserInterestRepository } from '../repositories/UserInterestsRepository';
import { UserInterest } from '../entities/UserInterest';
import { LanguageRepository } from '../repositories/LanguagesRepository';
import { LanguageProficiency, UserLanguage } from '../entities/UserLanguage';
import { UserLanguageRepository } from '../repositories/UserLanguagesRepository copy';

export class UserService {
    constructor() { }

    async createUserWithDetails(
        userData: Partial<User>,
        interestNames: string[],
        languageMap: Map<string, LanguageProficiency>
    ): Promise<User> {
        try {
            return await AppDataSource.transaction(async (transactionalEntityManager) => {
                // Step 1: Create and save the user
                const user = transactionalEntityManager.create(User, userData);
                const savedUser = await transactionalEntityManager.save(user);

                console.log(interestNames)
                // Step 2: Add interests (if any)    
                if (interestNames && interestNames.length > 0) {
                    const interestIds = await InterestRepository.getIdsByNames(interestNames);
                    console.log(interestIds)
                    console.log(savedUser.uuid)
                    const userInterests = interestIds.map((interestId) =>
                        transactionalEntityManager.create(UserInterest,
                            {
                                userId: savedUser.uuid,
                                interestId: interestId
                            }
                        )
                    );
                    await transactionalEntityManager.save(UserInterest, userInterests);
                }

                // Step 3: Add languages (if any)
                if (languageMap && languageMap.size > 0) {
                    const languages = await LanguageRepository.getLanguagesFromNames({ names: [...languageMap.keys()] });
                    const userLanguages = languages.map((language) =>
                        transactionalEntityManager.create(UserLanguage,
                            {
                                userId: savedUser.uuid,
                                languageId: language.id,
                                proficiency: languageMap.get(language.name)
                            }
                        )
                    );
                    await transactionalEntityManager.save(UserLanguage, userLanguages);
                }
                // TODO return some information about the created language and interests.

                // Step 4: Return the saved user
                return savedUser;
            });
        } catch (error) {
            console.error('Error creating user with details:', error);
            throw new Error('Failed to create user due to an internal error');
        }
    }


    /**
     * Return all users
     * @returns all users in the database.
     */
    async list(): Promise<User[]> {
        return UserRepository.find({});
    }

    /**
     * Find a user by id.
     * @param uuid - The uuid of the user.
     * @returns The user if found, otherwise undefined.
     */
    async findByUuid(uuid: string): Promise<User> {
        return UserRepository.findOne({ where: { uuid } });
    }

    /**
     * Find a user by email.
     * @param email - The email of the user.
     * @returns The user if found, otherwise undefined.
     */
    findByEmail(email: string): Promise<User> {
        return UserRepository.findByEmail(email)
    }

    /**
     * Deactivate a user by ID.
     * @param id - The UUID of the user.
     * @returns The updated user.
     */
    deactivateUser(id: string): Promise<User | undefined> {
        return AppDataSource.transaction(async (manager) => {
            return UserRepository.deactivateUser(id);
        })
    }

    /**
     * Find all active users.
     * @returns A list of active users.
     */
    findActiveUsers(): Promise<User[]> {
        return UserRepository.findActiveUsers();
    }

    findAllUsers(): Promise<User[]> {
        return UserRepository.find({})
    }
    /**
     * Find users by role.
     * @param role - The role of the users (e.g., 'doctor', 'student', 'patient').
     * @returns A list of users with the specified role.
     */
    findByRole(role: 'doctor' | 'student' | 'patient'): Promise<User[]> {
        return UserRepository.findByRole(role);
    }
}
