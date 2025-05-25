import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Vote } from './vote.entity';


export interface PollOption {
  id: string;
  text: string;
  color?: string;
}

@Entity('polls')
@Index('idx_poll_active', ['isActive'])
@Index('idx_poll_created_at', ['createdAt'])
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({ type: 'text', nullable: true })
  description?: string;



  @Column({ type: 'jsonb' })
  options: PollOption[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;



  @Column({ type: 'boolean', default: false })
  allowMultipleChoices: boolean;



  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;



  @Column({ type: 'timestamp with time zone', nullable: true })
  endsAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.createdPolls, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column('uuid')
  createdById: string;


  @OneToMany(() => Vote, vote => vote.poll, {
    cascade: false,
  })
  votes: Vote[];


  get totalVotes(): number {
    return this.votes?.length || 0;
  }


  get isActiveNow(): boolean {
    if (!this.isActive) return false;
    if (this.endsAt && new Date() > this.endsAt) return false;
    return true;
  }

  getResults(): { [optionId: string]: number } {
    const results: { [optionId: string]: number } = {};


    this.options.forEach(option => {
      results[option.id] = 0;
    });


    this.votes?.forEach(vote => {
      if (results[vote.selectedOption] !== undefined) {
        results[vote.selectedOption]++;
      }
    });

    return results;
  }


  getResultsWithPercentages(): Array<{
    optionId: string;
    text: string;
    votes: number;
    percentage: number;
    color?: string;
  }> {
    const results = this.getResults();
    const total = this.totalVotes;

    return this.options.map(option => ({
      optionId: option.id,
      text: option.text,
      votes: results[option.id] || 0,
      percentage: total > 0 ? Math.round((results[option.id] || 0) / total * 100) : 0,
      color: option.color,
    }));
  }
}