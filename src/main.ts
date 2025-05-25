import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as compression from 'compression';
import * as helmet from 'helmet';

import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);
    const config = getAppConfig(configService);

    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));


    app.use(compression());


    app.enableCors({
      origin: config.corsOrigin.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: config.nodeEnv === 'production',
        validationError: {
          target: false,
          value: false,
        },
      }),
    );


    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');


    app.useStaticAssets(join(__dirname, '..', 'public'), {
      prefix: '/static/',
    });

    if (config.nodeEnv === 'development') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle(config.swaggerTitle)
        .setDescription(config.swaggerDescription)
        .setVersion(config.swaggerVersion)
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Введите JWT токен',
            in: 'header',
          },
          'JWT-auth',
        )
        .addTag('auth', 'Авторизация и аутентификация')
        .addTag('admin', 'Административные функции')
        .addTag('polls', 'Управление опросами')
        .addTag('votes', 'Голосование')
        .addTag('users', 'Пользователи')
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);

      SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
        customSiteTitle: 'Poll System API Documentation',
      });

      logger.log(`📚 Swagger документация: http://localhost:${config.port}/api`);
    }

    app.setGlobalPrefix('api/v1', {
      exclude: [
        'graphql',
        'health',
        '/',
      ],
    });

    process.on('SIGTERM', async () => {
      logger.log('🛑 Получен SIGTERM, завершаем работу...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('🛑 Получен SIGINT, завершаем работу...');
      await app.close();
      process.exit(0);
    });

    await app.listen(config.port, '0.0.0.0');

    logger.log(`🚀 Приложение запущено на порту ${config.port}`);
    logger.log(`🌍 Режим: ${config.nodeEnv}`);
    logger.log(`📊 GraphQL: http://localhost:${config.port}/graphql`);
    logger.log(`🏠 Web интерфейс: http://localhost:${config.port}/`);

    if (config.nodeEnv === 'development') {
      logger.log(`🔧 Hot reload включён`);
    }

  } catch (error) {
    logger.error('❌ Ошибка при запуске приложения:', error);
    process.exit(1);
  }
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();