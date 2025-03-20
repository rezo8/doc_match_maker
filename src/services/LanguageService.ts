import { Language } from "../entities/Language";
import { LanguageRepository } from "../repositories/LanguagesRepository";

export class LanguageService {
    constructor() { }

    async list(): Promise<Language[]> {
        return LanguageRepository.find({})
    }

    async addLanguage(languageData: Partial<Language>): Promise<Language> {
        const createdLanguage = LanguageRepository.create(languageData)
        return LanguageRepository.save(createdLanguage)
    }

    async deleteLanguage(languageId: number): Promise<Language | null> {
        const language = await LanguageRepository.findOne({ where: { id: languageId } });

        if (!language) {
            return null;
        }

        await LanguageRepository.delete(languageId);

        return language;
    }
}