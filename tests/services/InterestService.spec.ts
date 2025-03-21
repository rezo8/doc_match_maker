import { Repository } from 'typeorm';
import { AppDataSource } from '../../src/config/ormconfig';
import { Interest } from '../../src/entities/Interest';
import { InterestService } from '../../src/services/InterestService';

// Mock the dependencies
jest.mock('../../src/config/ormconfig');

const defaultInterest: Interest = {
    id: 1,
    name: 'Interest1',
    userInterests: [],
};

describe('InterestService', () => {
    let interestService: InterestService;
    let interestRepository: jest.Mocked<Repository<Interest>>;

    beforeEach(() => {
        // Initialize mocks
        interestRepository = {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        } as unknown as jest.Mocked<Repository<Interest>>;

        // Mock AppDataSource.getRepository
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(interestRepository);

        // Initialize InterestService with mocked dependencies
        interestService = new InterestService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should return a list of interests', async () => {
            const mockInterests = [defaultInterest];
            interestRepository.find.mockResolvedValue(mockInterests);

            const result = await interestService.list();

            expect(result).toEqual(mockInterests);
            expect(interestRepository.find).toHaveBeenCalledWith({});
        });
    });

    describe('addInterest', () => {
        it('should add a new interest', async () => {
            const interestData: Partial<Interest> = { name: 'NewInterest' };
            const createdInterest = { ...interestData, id: 1, name: 'NewInterest', userInterests: [] };

            interestRepository.create.mockReturnValue(createdInterest);
            interestRepository.save.mockResolvedValue(createdInterest);

            const result = await interestService.addInterest(interestData);

            expect(result).toEqual(createdInterest);
            expect(interestRepository.create).toHaveBeenCalledWith(interestData);
            expect(interestRepository.save).toHaveBeenCalledWith(createdInterest);
        });
    });

    describe('deleteInterest', () => {
        it('should delete an existing interest', async () => {
            const interestId = 1;
            interestRepository.findOne.mockResolvedValue(defaultInterest);
            interestRepository.delete.mockResolvedValue({} as any);

            const result = await interestService.deleteInterest(interestId);

            expect(result).toEqual(defaultInterest);
            expect(interestRepository.findOne).toHaveBeenCalledWith({ where: { id: interestId } });
            expect(interestRepository.delete).toHaveBeenCalledWith(interestId);
        });

        it('should return null if interest is not found', async () => {
            const interestId = 999;
            interestRepository.findOne.mockResolvedValue(null);

            const result = await interestService.deleteInterest(interestId);

            expect(result).toBeNull();
            expect(interestRepository.findOne).toHaveBeenCalledWith({ where: { id: interestId } });
        });
    });

    describe('getInterestsByNames', () => {
        it('should return interests for given names', async () => {
            const names = ['Interest1', 'Interest2'];
            const mockInterests = [
                { id: 1, name: 'Interest1', userInterests: [] },
                { id: 2, name: 'Interest2', userInterests: [] },
            ];

            interestRepository.createQueryBuilder.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockInterests),
            } as any);

            const result = await interestService.getInterestsByNames(names);

            expect(result).toEqual(mockInterests);
            expect(interestRepository.createQueryBuilder).toHaveBeenCalledWith('interests');
            expect(interestRepository.createQueryBuilder().where).toHaveBeenCalledWith('interests.name IN (:...names)', { names });
            expect(interestRepository.createQueryBuilder().getMany).toHaveBeenCalled();
        });

        it('should return an empty array if no interests are found', async () => {
            const names = ['NonExistentInterest'];
            interestRepository.createQueryBuilder.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            } as any);

            const result = await interestService.getInterestsByNames(names);

            expect(result).toEqual([]);
        });
    });
});