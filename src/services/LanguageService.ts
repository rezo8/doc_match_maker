import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { Language } from "../entities/Language";

export class LanguageService {
    private languageRepository: Repository<Language>
    constructor() {
        this.languageRepository = AppDataSource.getRepository(Language);
    }

    async list(): Promise<Language[]> {
        return this.languageRepository.find({})
    }

    async addLanguage(languageData: Partial<Language>): Promise<Language> {
        const createdLanguage = this.languageRepository.create(languageData)
        return this.languageRepository.save(createdLanguage)
    }

    async deleteLanguage(languageId: number): Promise<Language | null> {
        const language = await this.languageRepository.findOne({ where: { id: languageId } });

        if (!language) {
            return null;
        }

        await this.languageRepository.delete(languageId);

        return language;
    }

    async getLanguagesFromNames(names: string[]): Promise<Language[]> {
        // Find language with the given names
        const languages = await this.languageRepository.createQueryBuilder('languages')
            .where('languages.name IN (:...names)', { names }) // Filter by names
            .getMany();

        return languages
    }
}