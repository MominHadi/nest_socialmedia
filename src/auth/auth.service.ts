import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/registerUser.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService) { }

    async register(registerUserDto: RegisterDto) {
        let saltedRounds = 10;
        let hashedPw = await hash(registerUserDto.password, saltedRounds);

        let newUser = await this.userService.createUser({ ...registerUserDto, password: hashedPw });
        let payload = { id: newUser.id, name: newUser.name, email: newUser.email };
        let token = await this.jwtService.sign(payload);
        return { accessToken: token };
    }

    async login(loginDto: LoginDto) {
        let user = await this.userService.findUser(loginDto)

        if (!user) {
            throw new NotFoundException("User with this email does not exist.")
        };

        let isMatch = await compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new BadRequestException("Invalid credentials")
        }
        await this.userService.updateLastLogin(user.id);

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        const token = await this.jwtService.signAsync(payload);

        return { accessToken: token,};

    }
}
