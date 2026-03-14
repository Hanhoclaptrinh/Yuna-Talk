import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateConvosDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    isGroup?: boolean = false;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    participantIds: string[]
}