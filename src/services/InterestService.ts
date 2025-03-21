import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { Interest } from "../entities/Interest";

export class InterestService {
    private interestRepository: Repository<Interest>
    constructor() {
        this.interestRepository = AppDataSource.getRepository(Interest);
    }

    async list(): Promise<Interest[]> {
        return this.interestRepository.find({})
    }

    async addInterest(interestData: Partial<Interest>): Promise<Interest> {
        const createdInterest = this.interestRepository.create(interestData)
        return this.interestRepository.save(createdInterest)
    }

    async deleteInterest(interestId: number): Promise<Interest | null> {
        const interest = await this.interestRepository.findOne({ where: { id: interestId } });
        if (!interest) {
            return null;
        }
        await this.interestRepository.delete(interestId);

        return interest;
    }

    async getInterestsByNames(names: string[]): Promise<Interest[]> {
        const interests = await this.interestRepository.createQueryBuilder('interests')
            .where('interests.name IN (:...names)', { names }) // Filter by names
            .getMany();

        return interests
    }
}