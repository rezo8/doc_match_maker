import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserLanguage } from './UserLanguage';
import { UserInterest } from './UserInterest';

export enum UserRole {
    DOCTOR = "doctor",
    STUDENT = "student",
    PATIENT = "patient",
}

@Entity('users') // Table name in the database
export class User {
    @PrimaryGeneratedColumn('uuid') // Auto-generate UUID as the primary key
    uuid: string;

    @Column({ unique: true }) // Ensure email is unique
    email: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: UserRole }) // Enforce role values
    role: UserRole;

    @Column({ nullable: true }) // Optional field
    location: string;

    @Column({ default: 0 }) // Default value for experienceLevel
    experienceLevel: number;

    @Column({ type: 'date', nullable: true }) // Optional date field
    dateOfBirth: Date;

    @Column({ nullable: true }) // Optional field
    profilePictureUrl: string;

    @Column({ nullable: true }) // Optional field
    phoneNumber: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Auto-set on creation
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }) // Auto-update on change
    lastUpdatedAt: Date;

    @Column({ default: true }) // Default value for isActive
    isActive: boolean;

    @OneToMany(() => UserLanguage, (userLanguage) => userLanguage.user)
    userLanguages: UserLanguage[];

    @OneToMany(() => UserInterest, (userInterest) => userInterest.user)
    userInterests: UserLanguage[];

}