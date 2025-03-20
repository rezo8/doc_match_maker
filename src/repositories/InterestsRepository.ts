import { AppDataSource } from '../config/ormconfig';
import { Interest } from '../entities/Interest';

export const InterestRepository = AppDataSource.getRepository(Interest).extend({

    async getIdsByNames(names: string[]): Promise<number[]> {
        // Find interests with the given names
        const interests = await this.createQueryBuilder('interests')
            .where('interests.name IN (:...names)', { names }) // Filter by names
            .getMany();

        // Extract and return the IDs
        return interests.map((interest) => interest.id);
    },
})
