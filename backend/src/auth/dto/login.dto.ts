import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'Vui lòng nhập Email hoặc Tên người dùng' })
    @IsString()
    identity: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @IsString()
    password: string;
}