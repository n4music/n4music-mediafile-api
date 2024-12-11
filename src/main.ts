import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { ValidationExceptionFilter } from 'submodules/common/exceptions/validation.exception';
import { cfg } from 'submodules/config/env.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalFilters(new ValidationExceptionFilter());
  const whitelist = cfg('WHITELIST')?.split(',') || ['*'];
  whitelist.includes('*')
    ? true
    : {
        origin: (
          origin: string,
          callback: (err: Error, callback: any) => void,
        ) => {
          // bypass the requests with no origin (like curl requests, mobile apps, etc )
          if (!origin) return callback(null, true);
          if (whitelist.indexOf(origin) === -1) {
            const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
      };
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useStaticAssets(join(__dirname, 'assets', 'imgs'), {
    prefix: '/',
  });

  if (cfg('APP_NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('n4music ADMIN PANEL API')
      .setDescription('n4music ADMIN PANEL API description')
      .setVersion('0.1')
      .addBearerAuth()
      .addServer(cfg('APP_PUBLIC_ENDPOINT'))
      .addServer(cfg('APP_PUBLIC_ENDPOINT_DEV'))
      .addServer(cfg('APP_PUBLIC_ENDPOINT_STAGING'))
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/v1/docs', app, document);
  }

  await app.listen(cfg('APP_PORT', Number));
  console.log(`server run on: http://localhost:${cfg('APP_PORT')}`);
}
bootstrap();
