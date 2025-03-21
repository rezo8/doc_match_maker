import { Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/ormconfig';
import { Language } from '../../src/entities/Language';
import { LanguageService } from '../../src/services/LanguageService';

// Mock the dependencies
jest.mock('../../src/config/ormconfig');

const defaultLanguage: Language = {
    id: 1,
    name: 'English',
    userLanguages: [],
};

describe('LanguageService', () => {
    let languageService: LanguageService;
    let languageRepository: jest.Mocked<Repository<Language>>;

    beforeEach(() => {
        // Initialize mocks
        languageRepository = {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        } as unknown as jest.Mocked<Repository<Language>>;

        // Mock AppDataSource.getRepository
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(languageRepository);

        // Initialize LanguageService with mocked dependencies
        languageService = new LanguageService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should return a list of languages', async () => {
            const mockLanguages = [defaultLanguage];
            languageRepository.find.mockResolvedValue(mockLanguages);

            const result = await languageService.list();

            expect(result).toEqual(mockLanguages);
            expect(languageRepository.find).toHaveBeenCalledWith({});
        });
    });

    describe('addLanguage', () => {
        it('should add a new language', async () => {
            const languageData: Partial<Language> = { name: 'Spanish' };
            const createdLanguage = { ...languageData, id: 1, name: 'Spanish', userLanguages: [] };

            languageRepository.create.mockReturnValue(createdLanguage);
            languageRepository.save.mockResolvedValue(createdLanguage);

            const result = await languageService.addLanguage(languageData);

            expect(result).toEqual(createdLanguage);
            expect(languageRepository.create).toHaveBeenCalledWith(languageData);
            expect(languageRepository.save).toHaveBeenCalledWith(createdLanguage);
        });
    });

    describe('deleteLanguage', () => {
        it('should delete an existing language', async () => {
            const languageId = 1;
            languageRepository.findOne.mockResolvedValue(defaultLanguage);
            languageRepository.delete.mockResolvedValue({} as any);

            const result = await languageService.deleteLanguage(languageId);

            expect(result).toEqual(defaultLanguage);
            expect(languageRepository.findOne).toHaveBeenCalledWith({ where: { id: languageId } });
            expect(languageRepository.delete).toHaveBeenCalledWith(languageId);
        });

        it('should return null if language is not found', async () => {
            const languageId = 999;
            languageRepository.findOne.mockResolvedValue(null);

            const result = await languageService.deleteLanguage(languageId);

            expect(result).toBeNull();
            expect(languageRepository.findOne).toHaveBeenCalledWith({ where: { id: languageId } });
        });
    });

    describe('getLanguagesFromNames', () => {
        it('should return languages for given names', async () => {
            const names = ['English', 'Spanish'];
            const mockLanguages = [
                { id: 1, name: 'English', userLanguages: [] },
                { id: 2, name: 'Spanish', userLanguages: [] },
            ];

            languageRepository.createQueryBuilder.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockLanguages),
            } as any);

            const result = await languageService.getLanguagesFromNames(names);

            expect(result).toEqual(mockLanguages);
            expect(languageRepository.createQueryBuilder).toHaveBeenCalledWith('languages');
            expect(languageRepository.createQueryBuilder().where).toHaveBeenCalledWith('languages.name IN (:...names)', { names });
            expect(languageRepository.createQueryBuilder().getMany).toHaveBeenCalled();
        });

        it('should return an empty array if no languages are found', async () => {
            const names = ['NonExistentLanguage'];
            languageRepository.createQueryBuilder.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            } as any);

            const result = await languageService.getLanguagesFromNames(names);

            expect(result).toEqual([]);
        });
    });
});