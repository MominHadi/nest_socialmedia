import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    files: Express.Multer.File[],
    authorId: number,
  ) {

    
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'posts');

    // Create uploads/posts dir if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save each file to disk and build media records
    const mediaData = files.map((file, index) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      return {
        fileUrl: `/uploads/posts/${filename}`,
        fileType: file.mimetype,
        fileSize: String(file.size),
        order: index,
      };
    });

    try {
      const post = await this.prisma.post.create({
        data: {
          caption: createPostDto.caption,
          location: createPostDto.location,
          authorId,
          media: {
            create: mediaData,
          },
        },
        include: {
          media: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return post;
    } catch (err: any) {
      // Rollback: delete uploaded files if DB insert fails
      mediaData.forEach(({ fileUrl }) => {
        const filePath = path.join(process.cwd(), fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      throw err;
    }
  }

  async findAll() {
    return this.prisma.post.findMany({
      where: { status: 1 },
      include: {
        media: { orderBy: { order: 'asc' } },
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) throw new NotFoundException('Post not found.');

    return post;
  }

  async remove(id: number, authorId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!post) throw new NotFoundException('Post not found.');

    if (post.authorId !== authorId) {
      throw new BadRequestException('You can only delete your own posts.');
    }

    // Delete files from disk
    post.media.forEach(({ fileUrl }) => {
      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Cascade in DB handles PostMedia rows
    return this.prisma.post.delete({ where: { id } });
  }
}