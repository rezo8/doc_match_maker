import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/ormconfig';
import { User, UserRole } from '../../src/entities/User';
import { UserInterest } from '../../src/entities/UserInterest';
import { LanguageProficiency, UserLanguage } from '../../src/entities/UserLanguage';
import { InterestService } from '../../src/services/InterestService';
import { LanguageService } from '../../src/services/LanguageService';
import { UserService } from '../../src/services/UserService';

// Mock the dependencies
jest.mock('../../src/config/ormconfig');
jest.mock('../../src/services/InterestService');
jest.mock('../../src/services/LanguageService');

const defaultUser: User = {
    uuid: "test",
    email: "test",
    name: "name",
    role: UserRole.DOCTOR,
    location: "location",
    experienceLevel: 10,
    dateOfBirth: new Date(),
    profilePictureUrl: "",
    phoneNumber: "",
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    isActive: true,
    userLanguages: [],
    userInterests: [],
    matchesAsUser1: [],
    matchesAsUser2: []
}


describe('UserService', () => {
    let userService: UserService;
    let userRepository: jest.Mocked<Repository<User>>;
    let languageService: jest.Mocked<LanguageService>;
    let interestService: jest.Mocked<InterestService>;

    beforeEach(() => {
        // Initialize mocks
        userRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        } as unknown as jest.Mocked<Repository<User>>;

        languageService = new LanguageService() as jest.Mocked<LanguageService>;
        interestService = new InterestService() as jest.Mocked<InterestService>;

        // Mock AppDataSource.getRepository
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepository);

        // Initialize UserService with mocked dependencies
        userService = new UserService(userRepository, languageService, interestService);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserWithDetails', () => {
        it('should create a user with interests and languages', async () => {
            // Mock Set up
            const userData: Partial<User> = {
                uuid: 'test-uuid',
                email: 'test@example.com',
                name: 'Test User',
                role: UserRole.DOCTOR,
            };
            const interestNames = ['Interest1', 'Interest2'];
            const languageMap = new Map<string, LanguageProficiency>([
                ['English', LanguageProficiency.FLUENT],
                ['Spanish', LanguageProficiency.INTERMEDIATE],
            ]);

            interestService.getIdsByNames.mockResolvedValue([1, 2]);
            languageService.getLanguagesFromNames.mockResolvedValue([
                { id: 1, name: 'English', userLanguages: [] },
                { id: 2, name: 'Spanish', userLanguages: [] },
            ]);


            // Create Spies
            const createMock = jest.fn().mockImplementation((entity, data) => ({ ...data }));
            const saveMock = jest.fn().mockImplementation((entity) => entity);

            // Mock transaction and capture the actual transactionalEntityManager used
            (AppDataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                return callback({
                    create: createMock,
                    save: saveMock,
                    find: jest.fn(),
                    remove: jest.fn(),
                    update: jest.fn(),
                });
            });

            // Run Test
            const result = await userService.createUserWithDetails(userData, interestNames, languageMap);

            // Assertions
            expect(result).toBeDefined();
            expect(result.uuid).toBe('test-uuid');
            expect(interestService.getIdsByNames).toHaveBeenCalledWith(interestNames);
            expect(languageService.getLanguagesFromNames).toHaveBeenCalledWith(['English', 'Spanish']);
            expect(createMock).toHaveBeenCalledWith(User, userData);
            expect(saveMock).toHaveBeenCalledWith(expect.objectContaining(userData));
            expect(createMock).toHaveBeenCalledWith(UserInterest, { userId: 'test-uuid', interestId: 1 });
            expect(createMock).toHaveBeenCalledWith(UserInterest, { userId: 'test-uuid', interestId: 2 });
            expect(saveMock).toHaveBeenCalledWith(UserInterest, [
                { userId: 'test-uuid', interestId: 1 },
                { userId: 'test-uuid', interestId: 2 },
            ]);
            expect(createMock).toHaveBeenCalledWith(UserLanguage, {
                userId: 'test-uuid',
                languageId: 1,
                proficiency: LanguageProficiency.FLUENT,
            });
            expect(createMock).toHaveBeenCalledWith(UserLanguage, {
                userId: 'test-uuid',
                languageId: 2,
                proficiency: LanguageProficiency.INTERMEDIATE,
            });
            expect(saveMock).toHaveBeenCalledWith(UserLanguage, [
                { userId: 'test-uuid', languageId: 1, proficiency: LanguageProficiency.FLUENT },
                { userId: 'test-uuid', languageId: 2, proficiency: LanguageProficiency.INTERMEDIATE },
            ]);
        });
    });


    describe('updateUserInterests', () => {
        it('should update user interests', async () => {
            const userId = 'test-uuid';
            const interestNames = ['Interest1', 'Interest2'];

            interestService.getIdsByNames.mockResolvedValue([1, 2]);

            const createMock = jest.fn().mockImplementation((entity, data) => ({ ...data }));
            const saveMock = jest.fn().mockImplementation((entity) => entity);
            const removeMock = jest.fn().mockImplementation((entity, data) => entity);
            // Mock transaction
            (AppDataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                return callback({
                    create: createMock,
                    save: saveMock,
                    find: jest.fn().mockResolvedValue([
                        { userId, interestId: 1 },
                        { userId, interestId: 4 },
                    ]),
                    remove: removeMock,
                });
            });
            await userService.updateUserInterests(userId, interestNames);

            expect(interestService.getIdsByNames).toHaveBeenCalledWith(interestNames);
            expect(removeMock).toHaveBeenCalledWith(UserInterest, [{ userId: userId, interestId: 4 }]);
            expect(createMock).toHaveBeenCalledWith(UserInterest, { userId: userId, interestId: 2 })
        });
    });

    describe('updateUserLanguages', () => {
        it('should update user languages', async () => {
            // Mock Set up
            const languageMap = new Map<string, LanguageProficiency>([
                ['Spanish', LanguageProficiency.INTERMEDIATE],
                ['Arabic', LanguageProficiency.FLUENT],
            ]);

            interestService.getIdsByNames.mockResolvedValue([1, 2]);
            languageService.getLanguagesFromNames.mockResolvedValue([
                { id: 1, name: 'Spanish', userLanguages: [] },
                { id: 2, name: 'Arabic', userLanguages: [] },
            ]);


            // Create Spies
            const createMock = jest.fn().mockImplementation((entity, data) => ({ ...data }));
            const saveMock = jest.fn().mockImplementation((entity) => entity);
            const removeMock = jest.fn().mockImplementation((entity, data) => entity);
            const updateMock = jest.fn().mockImplementation((id, entity, data) => entity);

            // Mock transaction and capture the actual transactionalEntityManager used
            (AppDataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                return callback({
                    create: createMock,
                    save: saveMock,
                    find: jest.fn().mockResolvedValue([
                        { userId, languageId: 2, proficiency: LanguageProficiency.INTERMEDIATE }, // Will be updated to Fluent
                        { userId, languageId: 4, proficiency: LanguageProficiency.INTERMEDIATE }, // Will be deleted

                    ]),
                    remove: removeMock,
                    update: updateMock,
                });
            });

            const userId = 'test-uuid';
            await userService.updateUserLanguages(userId, languageMap);

            expect(languageService.getLanguagesFromNames).toHaveBeenCalledWith(['Spanish', 'Arabic']);
            expect(removeMock).toHaveBeenCalledWith(UserLanguage, [{ userId: userId, languageId: 4, proficiency: LanguageProficiency.INTERMEDIATE }]);
            expect(createMock).toHaveBeenCalledWith(UserLanguage, { userId: userId, languageId: 1, proficiency: LanguageProficiency.INTERMEDIATE })
            expect(updateMock).toHaveBeenCalledWith(UserLanguage, { userId: userId, languageId: 2 }, { proficiency: LanguageProficiency.FLUENT })
        });
    });

    describe('list', () => {
        // TODO test query params. 
        it('should return a list of users with default query', async () => {
            const mockUsers = [defaultUser];
            userRepository.find.mockResolvedValue(mockUsers);

            const result = await userService.list();

            expect(result).toEqual(mockUsers);
            expect(userRepository.find).toHaveBeenCalledWith({
                where: {},
                relations: ['userInterests', 'userLanguages'],
            });
        });

        it('should filter users by type and email', async () => {
            const queryParams = { type: 'admin', email: 'test@example.com' };
            userRepository.find.mockResolvedValue([defaultUser]);

            await userService.list(queryParams);

            expect(userRepository.find).toHaveBeenCalledWith({
                where: { type: 'admin', email: 'test@example.com' },
                relations: ['userInterests', 'userLanguages'],
            });
        });

        it('should filter users by interest IDs', async () => {
            const queryParams = { interests: 'Cardiology,Neurology' };
            const mockInterestIds = [1, 2];
            interestService.getIdsByNames.mockResolvedValue(mockInterestIds);
            userRepository.find.mockResolvedValue([defaultUser]);

            await userService.list(queryParams);

            expect(interestService.getIdsByNames).toHaveBeenCalledWith(['Cardiology', 'Neurology']);
            expect(userRepository.find).toHaveBeenCalledWith({
                where: { userInterests: { interestId: In(mockInterestIds) } },
                relations: ['userInterests', 'userLanguages'],
            });
        });

        it('should filter users by language IDs', async () => {
            const queryParams = { languages: 'en,es' };
            const mockLanguageIds = [1, 2];
            languageService.getLanguagesFromNames.mockResolvedValue([{ id: 1, name: "en", userLanguages: [] }, { id: 2, name: "Spanish", userLanguages: [] }]);
            userRepository.find.mockResolvedValue([defaultUser]);

            await userService.list(queryParams);

            expect(languageService.getLanguagesFromNames).toHaveBeenCalledWith(['en', 'es']);
            expect(userRepository.find).toHaveBeenCalledWith({
                where: { userLanguages: { languageId: In(mockLanguageIds) } },
                relations: ['userInterests', 'userLanguages'],
            });
        });

        it('should handle empty interest and language arrays', async () => {
            const queryParams = { interests: '', languages: '' };
            userRepository.find.mockResolvedValue([defaultUser]);

            await userService.list(queryParams);

            expect(userRepository.find).toHaveBeenCalledWith({
                where: {},
                relations: ['userInterests', 'userLanguages'],
            });
        });
    });

    describe('findByUuid', () => {
        it('should return a user by UUID', async () => {

            userRepository.findOne.mockResolvedValue(defaultUser);

            const result = await userService.findByUuid('test-uuid');

            expect(result).toEqual(defaultUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { uuid: 'test-uuid' },
                relations: ['userLanguages', 'userInterests'],
            });
        });

        it('should return null if user is not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await userService.findByUuid('non-existent-uuid');

            expect(result).toBeNull();
        });
    });

    describe('deactivateUser', () => {
        it('should deactivate a user', async () => {
            userRepository.findOne.mockResolvedValue(defaultUser);
            userRepository.save.mockResolvedValue({ ...defaultUser, isActive: false });

            const result = await userService.deactivateUser('test-uuid');

            expect(result).toBeDefined();
            expect(result?.isActive).toBe(false);
        });

        it('should return null if user is not found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await userService.deactivateUser('non-existent-uuid');

            expect(result).toBeNull();
        });
    });
});