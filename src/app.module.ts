import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';


import { getDatabaseConfig } from './config/database.config';
import { getRedisConfig } from './config/redis.config';
import { getAppConfig, validateConfig } from './config/app.config';


import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PollModule } from './modules/poll/poll.module';
import { VoteModule } from './modules/vote/vote.module';
import { AdminModule } from './modules/admin/admin.module';
import { GraphqlModule } from './modules/graphql/graphql.module';


import { User } from './entities/user.entity';
import { Poll } from './entities/poll.entity';
import { Vote } from './entities/vote.entity';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => {
        const appConfig = getAppConfig(new ConfigService(config));
        validateConfig(appConfig);
        return config;
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([User, Poll, Vote]),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),


    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 10),
        storage: 'redis',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('NODE_ENV') === 'development',
        introspection: configService.get('NODE_ENV') === 'development',
        context: ({ req, res }) => ({
          req,
          res,
          user: req.user,
        }),

        formatError: (error) => {
          console.error('GraphQL Error:', error);

          if (configService.get('NODE_ENV') === 'production') {
            return {
              message: error.message,
            };
          }

          return error;
        },

        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': true,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PollModule,
    VoteModule,
    AdminModule,
    GraphqlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    const config = getAppConfig(this.configService);
    console.log('🚀 Poll System configlari:');
    console.log(`   • PORT: ${config.port}`);
    console.log(`   • Env: ${config.nodeEnv}`);
    console.log(`   • Database: ${this.configService.get('DB_HOST')}:${this.configService.get('DB_PORT')}`);
    console.log(`   • Redis: ${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`);
    console.log(`   • CORS Origin: ${config.corsOrigin}`);

    if (config.nodeEnv === 'development') {
      console.log(`   • Swagger: http://localhost:${config.port}/api`);
      console.log(`   • GraphQL Playground: http://localhost:${config.port}/graphql`);
    }
  }
}