import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'data-source.config';
import multer from 'multer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/file/file.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from './submodules/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
    }),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    HealthModule,
    LoggerModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
