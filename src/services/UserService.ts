import { In, Repository } from 'typeorm';
import { AppDataSource } from '../config/ormconfig';
import { User, UserRole } from '../entities/User';
import { UserInterest } from '../entities/UserInterest';
import { LanguageProficiency, UserLanguage } from '../entities/UserLanguage';
import { InterestService } from './InterestService';
import { LanguageService } from './LanguageService';

export class UserService {
    private userRepository: Repository<User>;
    private languageService: LanguageService
    private interestService: InterestService

    constructor(
        userRepository: Repository<User> = AppDataSource.getRepository(User),
        languageService: LanguageService = new LanguageService(),
        interestService: InterestService = new InterestService()
    ) {
        this.userRepository = userRepository;
        this.languageService = languageService;
        this.interestService = interestService;
    }

    async createUserWithDetails(
        userData: Partial<User>,
        interestNames: string[],
        languageMap: Map<string, LanguageProficiency>
    ): Promise<User> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Step 1: Create and save the user
            const user = transactionalEntityManager.create(User, userData);
            const savedUser = await transactionalEntityManager.save(user);

            // Step 2: Add interests (if any)
            if (interestNames.length > 0) {
                const interestIds = await this.interestService.getIdsByNames(interestNames);
                const userInterests = interestIds.map((interestId) =>
                    transactionalEntityManager.create(UserInterest, { userId: savedUser.uuid, interestId })
                );
                await transactionalEntityManager.save(UserInterest, userInterests);
            }

            // Step 3: Add languages (if any)
            if (languageMap.size > 0) {
                const languages = await this.languageService.getLanguagesFromNames([...languageMap.keys()]);
                const userLanguages = languages.map((language) =>
                    transactionalEntityManager.create(UserLanguage, {
                        userId: savedUser.uuid,
                        languageId: language.id,
                        proficiency: languageMap.get(language.name),
                    })
                );
                await transactionalEntityManager.save(UserLanguage, userLanguages);
            }

            return savedUser;
        });
    }

    async updateUserInterests(userId: string, interestNames: string[]): Promise<void> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Fetch current interests
            const existingInterests = await transactionalEntityManager.find(UserInterest, { where: { userId } });
            const existingInterestIds = new Set(existingInterests.map((ui) => ui.interestId));

            // Fetch new interest IDs
            const interestIds = interestNames.length > 0 ? await this.interestService.getIdsByNames(interestNames) : [];
            const newInterestIds = new Set(interestIds);
            // Determine which interests to add and remove
            const interestsToAdd = interestIds.filter((id) => !existingInterestIds.has(id));
            const interestsToRemove = existingInterests.filter((ui) => !newInterestIds.has(ui.interestId));

            // Add new interests
            if (interestsToAdd.length > 0) {
                const newUserInterests = interestsToAdd.map((interestId) =>
                    transactionalEntityManager.create(UserInterest, { userId, interestId })
                );
                await transactionalEntityManager.save(UserInterest, newUserInterests);
            }

            // Remove outdated interests
            if (interestsToRemove.length > 0) {
                await transactionalEntityManager.remove(UserInterest, interestsToRemove);
            }
        });
    }

    async updateUserLanguages(userId: string, languageMap: Map<string, LanguageProficiency>): Promise<void> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Fetch current languages
            const existingLanguages = await transactionalEntityManager.find(UserLanguage, { where: { userId } });

            // Fetch new language IDs
            const languages = await this.languageService.getLanguagesFromNames([...languageMap.keys()]);
            console.log(languages)
            console.log(existingLanguages)

            // Determine which languages to add, update, and remove
            const existingLanguageMap = new Map(existingLanguages.map((ul) => [ul.languageId, ul.proficiency]));
            const newLanguageMap = new Map(languages.map((l) => [l.id, languageMap.get(l.name)]));

            const languagesToAdd = languages.filter((l) => !existingLanguageMap.has(l.id));
            const languagesToUpdate = languages.filter(
                (l) => existingLanguageMap.has(l.id) && existingLanguageMap.get(l.id) !== newLanguageMap.get(l.id)
            );
            const languagesToRemove = existingLanguages.filter((ul) => !newLanguageMap.has(ul.languageId));

            // Add missing languages
            if (languagesToAdd.length > 0) {
                const newUserLanguages = languagesToAdd.map((language) =>
                    transactionalEntityManager.create(UserLanguage, {
                        userId,
                        languageId: language.id,
                        proficiency: languageMap.get(language.name),
                    })
                );
                await transactionalEntityManager.save(UserLanguage, newUserLanguages);
            }

            // Update proficiency for existing languages
            for (const language of languagesToUpdate) {
                await transactionalEntityManager.update(
                    UserLanguage,
                    { userId, languageId: language.id },
                    { proficiency: newLanguageMap.get(language.id) }
                );
            }

            // Remove outdated languages
            if (languagesToRemove.length > 0) {
                await transactionalEntityManager.remove(UserLanguage, languagesToRemove);
            }
        });
    }

    // TODO make it so that it is exclusive AND rather than inclusive OR for interest and languages.
    async list(queryParams: any = {}): Promise<User[]> {
        const { type, email } = queryParams;
        const interests = queryParams.interests ? queryParams.interests.split(',') : [];
        const languages = queryParams.languages ? queryParams.languages.split(',') : [];


        // Step 1: Fetch IDs for interests and languages based on their names
        let interestIds: number[] = [];
        let languageIds: number[] = [];

        if (interests && interests.length > 0) {
            const interestNames = Array.isArray(interests) ? interests : [interests];
            interestIds = await this.interestService.getIdsByNames(interestNames);
        }

        if (languages && languages.length > 0) {
            const languageNames: string[] = Array.isArray(languages) ? languages : [languages];
            languageIds = (await this.languageService.getLanguagesFromNames(languageNames)).map(x => x.id);
        }
        // Step 2: Build the where object
        const where: any = {};

        if (type) {
            where.type = type;
        }

        if (email) {
            where.email = email;
        }

        if (interestIds.length > 0) {
            where.userInterests = { interestId: In(interestIds) };
        }

        if (languageIds.length > 0) {
            where.userLanguages = { languageId: In(languageIds) };
        }

        // Step 3: Execute the query with the where object
        return await this.userRepository.find({
            where,
            relations: ['userInterests', 'userLanguages'], // Include relations
        });
    }

    async findByUuid(uuid: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { uuid }, relations: ['userLanguages', 'userInterests'] }) ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email }, relations: ['userLanguages', 'userInterests'] }) ?? null;
    }

    async deactivateUser(uuid: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { uuid } });
        if (!user) {
            return null;
        }
        user.isActive = false;
        return this.userRepository.save(user);
    }

    async findActiveUsers(): Promise<User[]> {
        return this.userRepository.find({ where: { isActive: true }, relations: ['userLanguages', 'userInterests'] });
    }

    async findByRole(role: UserRole): Promise<User[]> {
        return this.userRepository.find({ where: { role }, relations: ['userLanguages', 'userInterests'] });
    }
}
