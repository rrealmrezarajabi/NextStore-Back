import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

function uniqueFileName(originalName: string) {
  const timestamp = Date.now();
  const rand = Math.round(Math.random() * 1e9);
  return `${timestamp}-${rand}${extname(originalName)}`;
}

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, uniqueFileName(file.originalname));
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      location: `/uploads/${file.filename}`,
    };
  }
}
