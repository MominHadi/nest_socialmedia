import { IsEmail, IsNotEmpty, IsString, isString, Length } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @Length(5, 10)
    password: string;
}