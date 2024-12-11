import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import mimeTypes from 'mime-types';
import sharp from 'sharp';
import { MediaFileInterface } from 'common/interfaces/mediafile-variants.interface';
import { UploadServiceProvider } from 'common/services/upload.service';
import { ErrorHttpException } from 'submodules/common/exceptions/throw.exception';
import { cfg } from 'submodules/config/env.config';
import { Mediafile } from 'submodules/entities';
import { Mediafile as MediafileConst } from 'submodules/common/constants/mediafile.constant' 
import { Repository } from 'typeorm';

@Injectable()
export class MediaFileService {
    constructor(
        @InjectRepository(Mediafile)
        private fileRepository: Repository<Mediafile>,
        
        @Inject('UploadService')
        private readonly uploadService: UploadServiceProvider,
    ) {}
    async getList() {
        const files = await this.fileRepository.findAndCount();
        return files;
    }

    buildMediafile(file: Express.Multer.File) {
        if(!file) {
            throw ErrorHttpException(HttpStatus.BAD_REQUEST, 'BAD_REQUEST');
        }

        let id = crypto.randomUUID() as string;
        const extension = mimeTypes.extension(file.mimetype) || 'false';
        if (!file.mimetype.includes('image')) {
            id = id + `.${extension}`;
        }
        const result = {
            id,
            extension,
            name: file.originalname,
            mimeType: file.mimetype,
            physicalPath: `${cfg("FILE_CDN_URL")}/${id}`,
            size: file.size,
            status: MediafileConst.STATUS.ACTIVE,
        };
        return result;
    }
    async buildUpload(input: MediaFileInterface, file: Express.Multer.File) {
        try {
            await this.uploadService.uploadFile(file.buffer, input.id, input.mimeType);
        } catch (error) {
            throw error;
        }

        if (input.variants) {
            let variantBuffer: Buffer;
            for (const variant in input.variants) {
                if (variant === 'thumbnail') {
                    variantBuffer = await this.resizeImage(
                        file.buffer,
                        [MediafileConst.SIZES.THUMP, MediafileConst.SIZES.THUMP],
                        true,
                    );
                } else {
                    variantBuffer = await this.resizeImage(file.buffer, Number(variant));
                }
                input.variants[variant].size = Buffer.byteLength(variantBuffer);

                await this.uploadService.uploadFile(
                    variantBuffer,
                    input.variants[variant].id,
                    input.mimeType,
                );
            }
        }

        return input;
    }
    async resizeImage(
        buffer: Buffer,
        resolution: number | Array<number>,
        isThump?: boolean,
    ) {
        let targetObject = sharp(buffer);
        if (isThump) {
            targetObject = targetObject.resize(resolution[0], resolution[1]);
        } else {
            targetObject = targetObject.resize(Number(resolution));
        }
        return await targetObject.toBuffer();
    }
    buildImageVariants() {
        const result = {};
        for (const size of MediafileConst.SIZES.RESOLUTIONS) {
            const id = crypto.randomUUID();
            result[size] = { id };
        }

        return result;
    }
    async saveToDatabase(input: MediaFileInterface) {
        await this.fileRepository.save(input);
    }

}

