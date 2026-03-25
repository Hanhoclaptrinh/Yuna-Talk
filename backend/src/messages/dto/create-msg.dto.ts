import { MessageType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl } from "class-validator";

export class CreateMsgDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsEnum(MessageType)
    @IsOptional()
    type?: MessageType;

    @IsUUID()
    @IsNotEmpty()
    conversationId: string;

    @IsUUID()
    @IsOptional()
    replyToId?: string;

    // For file messages
    @IsUrl()
    @IsOptional()
    fileUrl?: string;

    @IsString()
    @IsOptional()
    filePublicId?: string;

    @IsString()
    @IsOptional()
    fileSize?: string;

    @IsString()
    @IsOptional()
    fileDuration?: string; // for audio/video files
}
