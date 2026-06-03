import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(registerUserDto: RegisterDto) {
    try {
      return await this.prisma.user.create({
        data: {
          name: registerUserDto.name,
          email: registerUserDto.email,
          password: registerUserDto.password,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('Email is already taken.');
      }
      throw err;
    }
  }

  async findUser(loginDto: LoginDto) {
    try {
      const normalizedEmail = loginDto.email.toLowerCase();

      return await this.prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });
    } catch (err: any) {
      throw err;
    }
  }

  async updateLastLogin(userId: number) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      lastLogin: new Date(),
    },
  });
}
}