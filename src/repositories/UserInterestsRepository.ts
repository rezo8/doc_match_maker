import { AppDataSource } from '../config/ormconfig';
import { UserInterest } from '../entities/UserInterest';

export const UserInterestRepository = AppDataSource.getRepository(UserInterest).extend({

})
