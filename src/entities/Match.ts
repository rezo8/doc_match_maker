import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from './User';

export enum MatchStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    REJECTED = "rejected"
}

@Entity('matches') // Table name in the database
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.PENDING }) // Enforce role values
    status: MatchStatus;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Auto-set on creation
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    acceptedAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    completedAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    rejectedAt: Date;

    @ManyToOne(() => User, (user) => user.matchesAsUser1, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user1' })
    user1: User;

    @ManyToOne(() => User, (user) => user.matchesAsUser2, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user2' })
    user2: User;
}