import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';


export const getRedisConfig = async (configService: ConfigService): Promise<CacheModuleOptions> => {
  return {
    store: redisStore as any, 
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    db: configService.get<number>('REDIS_DB', 0),
    ttl: configService.get<number>('CACHE_TTL', 300),
    max: 100,
    socket: {
      connectTimeout: 5000,
      commandTimeout: 5000,
    },
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  };
};

export const CACHE_KEYS = {
  POLLS_ACTIVE: 'polls:active',
  POLL_RESULTS: (pollId: string) => `poll:${pollId}:results`,
  USER_VOTES: (userId: string) => `user:${userId}:votes`,
  POLL_DETAILS: (pollId: string) => `poll:${pollId}:details`,
  VOTE_COUNT: (pollId: string, option: string) => `votes:${pollId}:${option}`,
  TOTAL_VOTES: (pollId: string) => `votes:${pollId}:total`,
} as const;

export const CACHE_TTL = {
  POLLS: 300, 
  POLL_RESULTS: 60, 
  USER_DATA: 900, 
  VOTE_LOCKS: 10, 
} as const;