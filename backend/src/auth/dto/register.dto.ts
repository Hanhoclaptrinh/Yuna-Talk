import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString({ message: 'Tên người dùng phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
    @Length(3, 20, { message: 'Tên người dùng phải từ 3-20 ký tự' })
    username: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    })
    password: string;

    @IsOptional()
    @IsUrl({}, { message: 'Avatar phải là một đường dẫn URL hợp lệ' })
    avatar?: string;
}