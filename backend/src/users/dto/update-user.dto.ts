import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Tên người dùng phải là chuỗi' })
    @Length(3, 20, { message: 'Tên người dùng phải từ 3-20 ký tự' })
    username?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Avatar phải là một đường dẫn URL hợp lệ' })
    avatar?: string;

    @IsOptional()
    @IsString({ message: 'Tiểu sử phải là chuỗi' })
    @MaxLength(200, { message: 'Tiểu sử chỉ được dài tối đa 200 ký tự' })
    bio?: string;
}
