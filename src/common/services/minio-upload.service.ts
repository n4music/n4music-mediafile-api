import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { cfg } from 'submodules/config/env.config';

@Injectable()
export class MinioUploadService {
    private readonly minioClient: Minio.Client;
    private BUCKET: string = cfg('OBJECT_STORAGE_BUCKET');
    private ENDPOINT: string = cfg('OBJECT_STORAGE_ENDPOINT');
    private ACCESS_KEY: string = cfg('OBJECT_STORAGE_ACCESS_KEY');
    private SECRET_KEY: string = cfg('OBJECT_STORAGE_SECRET_KEY');
    private MINIO_PORT: number = cfg('OBJECT_STORAGE_PORT', Number);
    private MINIO_USE_SSL: string = cfg('OBJECT_STORAGE_USE_SSL');
    private ALLOW_SET_POLICY = cfg('OBJECT_STORAGE_ALLOW_SET_POLICY');

    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: this.ENDPOINT,
            port: this.MINIO_PORT, // Replace with the appropriate port if necessary
            useSSL: this.MINIO_USE_SSL == 'true' ? true : false, // Set to true if using SSL/TLS
            accessKey: this.ACCESS_KEY,
            secretKey: this.SECRET_KEY,
            
        });
        if (this.ALLOW_SET_POLICY === 'ON') {
            const policyConfig = {
                Statement: [
                    {
                        Sid: '',
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.BUCKET}/*`],
                    },
                ],
            };

            this.minioClient.setBucketPolicy(
                this.BUCKET,
                JSON.stringify(policyConfig),
                // (error: any) => {
                //     if (error) {
                //         console.error('Error setting bucket policy:', error);
                //     } else {
                //         console.log('Bucket policy set to public successfully!');
                //     }
                // },
            );
        }
    }

    async uploadFile(buffer: Buffer, keyName: string, contentType: string) {
        const metaData = {
            'Content-Type': contentType,
        };

        try {
            // await new Promise(r => setTimeout(r, 100));
            const data = await this.minioClient.putObject(
                this.BUCKET,
                keyName,
                buffer,
                null,
                metaData,
            ); 
            console.log(`File uploaded successfully.`, data);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}