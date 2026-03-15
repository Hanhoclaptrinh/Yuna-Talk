import { MessageType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
}