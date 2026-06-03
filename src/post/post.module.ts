import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-guard';
@Module({
  controllers: [PostController],
  providers: [PostService, JwtAuthGuard,PrismaService],
})
export class PostModule {}
