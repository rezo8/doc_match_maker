import { AppDataSource } from '../config/ormconfig';
import { User } from '../entities/User';


export const UserRepository = AppDataSource.getRepository(User).extend({
    /**
     * Find a user by email.
     * @param email - The email of the user.
     * @returns The user if found, otherwise undefined.
     */
    async findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ where: { email }, relations: ['userLanguages', 'userInterests'], });
    },


    /**
     * Find all active users.
     * @returns A list of active users.
     */
    async findActiveUsers(): Promise<User[]> {
        return this.findOne({ where: { isActive: true }, relations: ['userLanguages', 'userInterests'], });
    },

    /**
     * Find users by role.
     * @param role - The role of the users (e.g., 'doctor', 'student', 'patient').
     * @returns A list of users with the specified role.
     */
    async findByRole(role: 'doctor' | 'student' | 'patient'): Promise<User[]> {
        return this.findOne({ where: { role }, relations: ['userLanguages', 'userInterests'], });
    },

    /**
     * Deactivate a user by ID.
     * @param id - The UUID of the user.
     * @returns The updated user.
     */
    async deactivateUser(id: string): Promise<User | undefined> {
        const user = await this.findOne(id);
        if (user) {
            user.isActive = false;
            return this.save(user);
        }
        return undefined;
    }
})
