import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [UserService, PrismaService], // ✅ services go here
  exports: [UserService],
})
export class UserModule {}