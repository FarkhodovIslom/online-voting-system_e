import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Poll } from './poll.entity';

@Entity('votes')
@Unique('unique_user_poll_vote', ['userId', 'pollId'])
@Index('idx_vote_poll_option', ['pollId', 'selectedOption'])
@Index('idx_vote_user', ['userId'])
@Index('idx_vote_created_at', ['createdAt'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ type: 'varchar', length: 50 })
  selectedOption: string;


  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;


  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.votes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  userId: string;


  @ManyToOne(() => Poll, poll => poll.votes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @Column('uuid')
  pollId: string;

  get isRecent(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.createdAt > fiveMinutesAgo;
  }


  getSelectedOptionText(): string | null {
    if (!this.poll?.options) return null;

    const option = this.poll.options.find(opt => opt.id === this.selectedOption);
    return option?.text || null;
  }

  toSafeObject() {
    const { ipAddress, userAgent, metadata, ...safeVote } = this;
    return safeVote;
  }
}