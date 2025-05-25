import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  throttleTtl: number;
  throttleLimit: number;
  swaggerTitle: string;
  swaggerDescription: string;
  swaggerVersion: string;
  logLevel: string;
}



export const getAppConfig = (configService: ConfigService): AppConfig => {
  return {
    port: configService.get<number>('PORT', 3000),
    nodeEnv: configService.get<string>('NODE_ENV', 'development'),
    corsOrigin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    jwtSecret: configService.get<string>('JWT_SECRET', 'change_this_in_production'),
    jwtExpiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
    bcryptRounds: configService.get<number>('BCRYPT_ROUNDS', 12),
    throttleTtl: configService.get<number>('THROTTLE_TTL', 60),
    throttleLimit: configService.get<number>('THROTTLE_LIMIT', 10),
    swaggerTitle: configService.get<string>('SWAGGER_TITLE', 'Poll System API'),
    swaggerDescription: configService.get<string>('SWAGGER_DESCRIPTION', 'API для системы опросов'),
    swaggerVersion: configService.get<string>('SWAGGER_VERSION', '1.0'),
    logLevel: configService.get<string>('LOG_LEVEL', 'debug'),
  };
};


export const validateConfig = (config: AppConfig): void => {
  const requiredFields: (keyof AppConfig)[] = [
    'jwtSecret',
    'port',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Отсутствуют обязательные переменные окружения: ${missingFields.join(', ')}`
    );
  }


  if (config.nodeEnv === 'production' && config.jwtSecret === 'change_this_in_production') {
    throw new Error('В продакшене нельзя использовать дефолтный JWT_SECRET!');
  }


  if (config.bcryptRounds < 10 || config.bcryptRounds > 15) {
    console.warn(`BCRYPT_ROUNDS=${config.bcryptRounds} может быть неоптимальным. Рекомендуется 10-15.`);
  }
};


export const APP_CONSTANTS = {

  MAX_POLL_QUESTION_LENGTH: 500,
  MAX_POLL_DESCRIPTION_LENGTH: 2000,
  MAX_POLL_OPTION_TEXT_LENGTH: 200,
  MAX_USER_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,

  MAX_POLL_OPTIONS: 10,
  MIN_POLL_OPTIONS: 2,

  VOTE_COOLDOWN_SECONDS: 5,
  MAX_POLL_DURATION_DAYS: 365,

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  CACHE_KEYS_PREFIX: 'poll_system',
} as const;