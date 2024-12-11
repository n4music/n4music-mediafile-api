import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { cfg } from 'submodules/config/env.config';

@Injectable()
export class S3UploadService {
    private readonly s3Client: AWS.S3;
    private BUCKET = cfg('OBJECT_STORAGE_BUCKET');
    private ACCESS_KEY = cfg('OBJECT_STORAGE_ACCESS_KEY');
    private SECRET_KEY = cfg('OBJECT_STORAGE_SECRET_KEY');
    private ALLOW_SET_POLICY = cfg('OBJECT_STORAGE_ALLOW_SET_POLICY');
    constructor() {
        this.s3Client = new AWS.S3({
            accessKeyId: this.ACCESS_KEY,
            secretAccessKey: this.SECRET_KEY,
        });
        this.s3Client
            .listBuckets()
            .promise()
            .then((data) => console.log(data));

        if (this.ALLOW_SET_POLICY === 'ON') {
            const policyParams = {
                Bucket: this.BUCKET,
                Policy: JSON.stringify({
                    Statement: [
                        {
                            Sid: '',
                            Effect: 'Allow',
                            Principal: '*',
                            Action: 's3:GetObject',
                            Resource: `arn:aws:s3:::${this.BUCKET}/*`,
                        },
                    ],
                }),
            };
            this.s3Client.putBucketPolicy(policyParams, (error, data) => {
                if (error) {
                    console.error('Error setting bucket policy:', error);
                } else {
                    console.log('Bucket policy set to public successfully!');
                }
            });
        }
    }

    async uploadFile(buffer: Buffer, keyName: string, contentType: string) {
        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.BUCKET,
            Key: keyName,
            Body: buffer,
            ContentType: contentType,
        };

        try {
            await this.s3Client.putObject(params).promise(); // Upload the file to AWS S3
            return { message: 'File uploaded successfully to AWS S3!' };
        } catch (error) {
            console.error('Error uploading file to AWS S3:', error);
            throw new Error('Failed to upload file to AWS S3');
        }
    }
}