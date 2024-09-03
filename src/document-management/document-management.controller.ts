import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentManagementService } from './document-management.service';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileType } from 'src/utils/enum';

@Controller('document-management')
export class DocumentManagementController {
  constructor(
    private readonly documentManagementService: DocumentManagementService,
  ) {}

  @Post('/upload/:type')
  @ApiOperation({
    summary: 'Upload a file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'type',
    description: 'File type',
    enum: FileType,
    example: FileType.profilePhoto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  public async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|png|jpeg|pdf|docx|doc)$/,
        })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file,
    @Request() req: any,
    @Param('type') type: FileType,
  ) {
    const user = req.user;
    const key = `${user.uid}_${type}`;
    const originalName = `prepmeet_${type}_${user.uid}`;

    return this.documentManagementService.uploadFile(
      file.buffer,
      key,
      originalName,
    );
  }

  @Get('/generate-url/:type')
  @ApiParam({
    name: 'type',
    description: 'File type',
    enum: FileType,
    example: FileType.profilePhoto,
  })
  @UseGuards(AuthGuard('jwt'))
  async getFile(@Request() req: any, @Param('type') type: FileType) {
    const user = req.user;
    const key = `${user.uid}_${type}`;
    const originalName = `prepmeet_${type}_${user.uid}`;

    return await this.documentManagementService.getPresignedUrl(
      key,
      originalName,
    );
  }
}
