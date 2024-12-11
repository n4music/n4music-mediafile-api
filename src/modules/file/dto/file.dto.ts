import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
    @ApiProperty({ required: true, type: 'string', format: 'binary' })
    file: any;
}