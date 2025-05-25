import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Poll } from '../entities/poll.entity';
import { Vote } from '../entities/vote.entity';


export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', 'poll_system'),
    entities: [User, Poll, Vote], 
    synchronize: configService.get<string>('NODE_ENV') === 'development', 
    logging: configService.get<string> ('NODE_ENV') === 'development',
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations_history',
    ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
      max: 20, 
      min: 5,  
      acquire: 30000, 
      idle: 10000     
    }
  };
};


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'poll_system',
  entities: [User, Poll, Vote],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Yoqilmasin!
  logging: true
});