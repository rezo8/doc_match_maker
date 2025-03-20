import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Language } from './Language';

export enum LanguageProficiency {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    FLUENT = "fluent"
}


@Entity('user_languages')
export class UserLanguage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid' })
    userId: string;

    @Column()
    languageId: number;

    // TODO make enum
    @Column({ type: 'enum', enum: LanguageProficiency })
    proficiency: LanguageProficiency;

    @ManyToOne(() => User, (user) => user.userLanguages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Language, (language) => language.userLanguages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'languageId' })
    language: Language;
}