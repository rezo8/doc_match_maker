import { AppDataSource } from '../config/ormconfig';
import { Language } from '../entities/Language';

export const LanguageRepository = AppDataSource.getRepository(Language).extend({

    async getLanguagesFromNames({ names }: { names: string[]; }): Promise<Language[]> {
        // Find language with the given names
        const languages = await this.createQueryBuilder('languages')
            .where('languages.name IN (:...names)', { names }) // Filter by names
            .getMany();

        return languages
    },
})
