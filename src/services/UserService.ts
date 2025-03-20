import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';
import { UserInterest } from '../entities/UserInterest';
import { LanguageProficiency, UserLanguage } from '../entities/UserLanguage';
import { InterestRepository } from '../repositories/InterestsRepository';
import { LanguageRepository } from '../repositories/LanguagesRepository';
import { UserRepository } from '../repositories/UserRepository';

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

    async updateUserInterests(userId: string, interestNames: string[]): Promise<void> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Step 1: Fetch current interests
            const existingInterests = await transactionalEntityManager.find(UserInterest, { where: { userId } });

            const existingInterestIds = new Set(existingInterests.map(ui => ui.interestId));
            var newInterestIds = new Set()
            var interestIds = []
            // Step 2: Get interest IDs for the provided names
            if (interestNames.length > 0) {
                interestIds = await InterestRepository.getIdsByNames(interestNames);
                newInterestIds = new Set(interestIds);
            }

            console.log(newInterestIds)
            // Step 3: Determine which interests to add and remove
            const interestsToAdd = interestIds.filter(id => !existingInterestIds.has(id));
            const interestsToRemove = existingInterests.filter(ui => !newInterestIds.has(ui.interestId));

            // Step 4: Add missing interests
            if (interestsToAdd.length > 0) {
                const newUserInterests = interestsToAdd.map(interestId =>
                    transactionalEntityManager.create(UserInterest, { userId, interestId })
                );
                await transactionalEntityManager.save(UserInterest, newUserInterests);
            }

            // Step 5: Remove outdated interests
            if (interestsToRemove.length > 0) {
                await transactionalEntityManager.remove(UserInterest, interestsToRemove);
            }
        });
    }

    async updateUserLanguages(userId: string, languageMap: Map<string, LanguageProficiency>): Promise<void> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Step 1: Fetch current languages
            const existingLanguages = await transactionalEntityManager.find(UserLanguage, { where: { userId } });

            // Step 2: Get language IDs for the provided names
            const languages = await LanguageRepository.getLanguagesFromNames({ names: [...languageMap.keys()] });

            // Step 3: Determine which languages to add, update, and remove
            const existingLanguageMap = new Map(existingLanguages.map(ul => [ul.languageId, ul.proficiency]));
            const newLanguageMap = new Map(languages.map(l => [l.id, languageMap.get(l.name)]));

            const languagesToAdd = languages.filter(l => !existingLanguageMap.has(l.id));
            const languagesToUpdate = languages.filter(l => existingLanguageMap.has(l.id) && existingLanguageMap.get(l.id) !== newLanguageMap.get(l.id));
            const languagesToRemove = existingLanguages.filter(ul => !newLanguageMap.has(ul.languageId));

            // Step 4: Add missing languages
            if (languagesToAdd.length > 0) {
                const newUserLanguages = languagesToAdd.map(language =>
                    transactionalEntityManager.create(UserLanguage, {
                        userId,
                        languageId: language.id,
                        proficiency: languageMap.get(language.name)
                    })
                );
                await transactionalEntityManager.save(UserLanguage, newUserLanguages);
            }

            // Step 5: Update proficiency for existing languages
            for (const language of languagesToUpdate) {
                await transactionalEntityManager.update(UserLanguage, { userId, languageId: language.id }, { proficiency: newLanguageMap.get(language.id) });
            }

            // Step 6: Remove outdated languages
            if (languagesToRemove.length > 0) {
                await transactionalEntityManager.remove(UserLanguage, languagesToRemove);
            }
        });
    }

    /**
     * Return all users
     * @returns all users in the database.
     */
    async list(): Promise<User[]> {
        return UserRepository.find({ relations: ['userLanguages', 'userInterests'], });
    }

    /**
     * Find a user by id.
     * @param uuid - The uuid of the user.
     * @returns The user if found, otherwise undefined.
     */
    async findByUuid(uuid: string): Promise<User> {
        return UserRepository.findOne({
            where: { uuid },
            relations: ['userLanguages', 'userInterests'],
        });
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
