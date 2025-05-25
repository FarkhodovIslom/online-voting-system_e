import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Vote } from './vote.entity';
import { Poll } from './poll.entity';


export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}


@Entity('users')
@Index('idx_user_email', ['email'], { unique: true }) 
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => Vote, vote => vote.user, {
    cascade: false, 
  })
  votes: Vote[];

  
  @OneToMany(() => Poll, poll => poll.createdBy, {
    cascade: false,
  })
  createdPolls: Poll[];

  
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  
  get voteCount(): number {
    return this.votes?.length || 0;
  }

  toSafeObject() {
    const { password, ...safeUser } = this;
    return safeUser;
  }
}