import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
  UploadedFiles, UseGuards, Req,
  BadRequestException
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { memoryStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express, Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-guard';

@Controller('api/post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),

      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'video/mp4',
          'video/mpeg',
          'video/quicktime', // .mov
        ];

        const allowedExtensions = [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.mp4',
          '.mov',
        ];

        const ext = require('path')
          .extname(file.originalname)
          .toLowerCase();

        const isMimeValid = allowedMimeTypes.includes(file.mimetype);
        const isExtValid = allowedExtensions.includes(ext);

        if (isMimeValid && isExtValid) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file: ${file.originalname}. Only images and videos are allowed.`,
            ),
            false,
          );
        }
      },

      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
      },
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request & { user: { id: number } },
  ) {
    return this.postService.create(createPostDto, files, req.user.id);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postService.remove(+id);
  // }
}
