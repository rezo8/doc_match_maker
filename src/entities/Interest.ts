import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm';

import { UserInterest } from './UserInterest';

@Entity('interests') // Table name in the database
export class Interest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", unique: true })
    name: string;

    @OneToMany(() => UserInterest, (userInterest) => userInterest.interest)
    userInterests: UserInterest[]
}