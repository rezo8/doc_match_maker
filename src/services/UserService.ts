import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { AppDataSource } from '../config/ormconfig';

export class UserService {
    constructor() { }

    async createUserWithDetails(userData: Partial<User>): Promise<User> {
        const user = UserRepository.create(userData)
        return UserRepository.save(user);
    }



    /**
     * Find a user by id.
     * @param uuid - The uuid of the user.
     * @returns The user if found, otherwise undefined.
     */
    findByUuid(uuid: string): Promise<User> {
        return UserRepository.findOne({ where: { uuid } });
    }

    /**
     * Find a user by email.
     * @param email - The email of the user.
     * @returns The user if found, otherwise undefined.
     */
    findByEmail(email: string): Promise<User> {
        return UserRepository.findByEmail(email)
    }

    /**
     * Deactivate a user by ID.
     * @param id - The UUID of the user.
     * @returns The updated user.
     */
    deactivateUser(id: string): Promise<User | undefined> {
        return AppDataSource.transaction(async (manager) => {
            return UserRepository.deactivateUser(id);
        })
    }

    /**
     * Find all active users.
     * @returns A list of active users.
     */
    findActiveUsers(): Promise<User[]> {
        return UserRepository.findActiveUsers();
    }

    findAllUsers(): Promise<User[]> {
        return UserRepository.find({})
    }
    /**
     * Find users by role.
     * @param role - The role of the users (e.g., 'doctor', 'student', 'patient').
     * @returns A list of users with the specified role.
     */
    findByRole(role: 'doctor' | 'student' | 'patient'): Promise<User[]> {
        return UserRepository.findByRole(role);
    }
}
