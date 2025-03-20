import { AppDataSource } from "../config/ormconfig";
import { Interest } from "../entities/Interest";
import { InterestRepository } from "../repositories/InterestsRepository";

export class InterestService {
    constructor() { }

    async list(): Promise<Interest[]> {
        return InterestRepository.find({})
    }

    async addInterest(interestData: Partial<Interest>): Promise<Interest> {
        const createdInterest = InterestRepository.create(interestData)
        return InterestRepository.save(createdInterest)
    }

    async deleteInterest(interestId: number): Promise<Interest | null> {
        const interest = await InterestRepository.findOne({ where: { id: interestId } });

        if (!interest) {
            return null;
        }

        await InterestRepository.delete(interestId);

        return interest;
    }


}