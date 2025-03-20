import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany
} from 'typeorm';
import { UserLanguage } from './UserLanguage';


@Entity('languages') // Table name in the database
export class Language {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", unique: true })
    name: string;


    @OneToMany(() => UserLanguage, (userLanguage) => userLanguage.language)
    userLanguages: UserLanguage[];
}