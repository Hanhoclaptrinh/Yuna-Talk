import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateConvosDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
    @MinLength(3, { message: 'Tên nhóm phải có ít nhất 3 ký tự' })
    name: string;
}