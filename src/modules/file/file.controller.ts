import {
	Controller,
	ParseFilePipeBuilder,
	Post,
	UploadedFile,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaFileInterface } from 'common/interfaces/mediafile-variants.interface';
import { Public } from 'submodules/common/decorators/public.decorator';
import { MediaFileService } from './file.service';
@ApiTags('3. Files')
@Controller('files')
export class MediaFileController {
	constructor(private readonly mediaFileService: MediaFileService) {}
	@Post('upload')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
			schema: {
					type: 'object',
					properties: {
							file: {
									type: 'string',
									format: 'binary',
							},
					},
			},
	})
	@Public()
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
			@UploadedFile(
					new ParseFilePipeBuilder()
							.addMaxSizeValidator({ maxSize: 100 * 1024 * 1024 })
							.build({
									fileIsRequired: true,
							}),
			)
			file: Express.Multer.File,
	) {
			let input: MediaFileInterface = this.mediaFileService.buildMediafile(file);

			if (input.mimeType.includes('image')) {
					input.variants = this.mediaFileService.buildImageVariants();
			}
			
			try {
					input = await this.mediaFileService.buildUpload(input, file);
			} catch (error) {
					throw error;
			}
			try {
					await this.mediaFileService.saveToDatabase(input);
			} catch (error) {
					throw error;
			}

			console.log(`🚀 File uploaded successfully: ${input.physicalPath} 🚀`);
			return input
	}

	@Post("uploads")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
          description: "Array of files to be uploaded",
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor("files", 20),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadedFiles = [];

    for (const file of files) {
      let input: MediaFileInterface = this.mediaFileService.buildMediafile(file);

      if (input.mimeType.includes("image")) {
        input.variants = this.mediaFileService.buildImageVariants();
      }

      try {
        input = await this.mediaFileService.buildUpload(input, file);
        await this.mediaFileService.saveToDatabase(input);


        console.log(`🚀 File uploaded successfully: ${input.physicalPath} 🚀`);
        uploadedFiles.push(input);
      } catch (error) {
        throw error;
      }
    }

    return uploadedFiles;
  }

}