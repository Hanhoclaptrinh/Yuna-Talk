import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMsgDto } from './dto/create-msg.dto';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) { }

    async saveMessage(uid: string, payload: CreateMsgDto) {
        return await this.prisma.$transaction(async (tx) => {
            const newMsg = await tx.message.create({
                data: {
                    content: payload.content,
                    type: payload.type || MessageType.TEXT,
                    conversationId: payload.conversationId,
                    senderId: uid,
                    replyToId: payload.replyToId,
                },

                include: {
                    sender: {
                        select: { username: true, avatar: true, status: true }
                    }
                }
            });

            // cap nhat last message cho convos
            await tx.conversation.update({
                where: { id: payload.conversationId },
                data: { lastMessageId: newMsg.id }
            });

            return newMsg;
        });
    }

    async getUserConversations(uid: string) {
        return await this.prisma.conversationParticipant.findMany({
            where: { userId: uid },
            select: { conversationId: true }
        });
    }
}
