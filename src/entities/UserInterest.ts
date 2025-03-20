import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Language } from './Language';
import { Interest } from './Interest';

@Entity('user_interests')
export class UserInterest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid' })
    userId: string;

    @Column()
    interestId: number;

    @ManyToOne(() => User, (user) => user.userInterests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Interest, (interest) => interest.userInterests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'interestId' })
    interest: Interest;
}