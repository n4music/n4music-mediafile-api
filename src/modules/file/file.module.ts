import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadServiceProvider } from 'common/services/upload.service';
import { Mediafile } from 'submodules/entities';
import { MediaFileController } from './file.controller';
import { MediaFileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mediafile]), UploadServiceProvider.forRoot()],
  controllers: [MediaFileController],
  providers: [MediaFileService, UploadServiceProvider],
})
export class FilesModule {}
