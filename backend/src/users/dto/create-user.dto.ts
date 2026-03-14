import { Status } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateUserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsEnum(Status)
    status?: Status
}
