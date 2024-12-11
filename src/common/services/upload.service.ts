import { DynamicModule, Global, Injectable } from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { MinioUploadService } from "./minio-upload.service";
import { S3UploadService } from "./s3-upload.service";

@Injectable()
@Global()
export class UploadServiceProvider {
  static forRoot(): DynamicModule {
    return {
      module: UploadServiceProvider,
      imports: [ConfigModule],
      providers: [
        {
          provide: "UploadService",
          useFactory: (configService: ConfigService) => {
            const objectStorageType = configService.get("OBJECT_STORAGE_TYPE");
            let uploadService;

            if (objectStorageType === "MINIO") {
              uploadService = new MinioUploadService();
            } else {
              uploadService = new S3UploadService();
            }

            return uploadService;
          },
          inject: [ConfigService],
        },
      ],
      exports: ["UploadService"],
    };
  }
  uploadFile(buffer: Buffer, keyName: string, contentType: string) {
    throw new Error("Method not implemented.");
  }
}
