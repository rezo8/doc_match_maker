import { AppDataSource } from '../config/ormconfig';
import { UserLanguage } from '../entities/UserLanguage';

export const UserLanguageRepository = AppDataSource.getRepository(UserLanguage).extend({

})
