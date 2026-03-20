import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

    async getMessagesByConversation(conId: string, uid: string, limit = 50) {
        return await this.prisma.message.findMany({
            where: {
                conversationId: conId,
                NOT: {
                    statuses: {
                        some: {
                            userId: uid,
                            isDeleted: true
                        }
                    }
                }
            },
            take: limit,
            orderBy: { createdAt: 'asc' }, // tu cu den moi
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        status: true
                    }
                },
                replyTo: true,
                statuses: {
                    where: {
                        userId: uid
                    }
                }
            }
        });
    }

    async getUserConversations(uid: string) {
        return await this.prisma.conversationParticipant.findMany({
            where: { userId: uid },
            select: { conversationId: true }
        });
    }

    async revokeMsg(id: string, uid: string) {
        const msg = await this.prisma.message.findUnique({
            where: { id }
        });

        if (!msg) throw new NotFoundException('Không tìm thấy tin nhắn');
        if (msg.senderId !== uid) throw new ForbiddenException('Chỉ người gửi mới có thể thu hồi tin nhắn');
        if (msg.isRevoked) return msg;

        return await this.prisma.message.update({
            where: { id },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                content: 'Tin nhắn đã bị thu hồi'
            }
        })
    }

    async deleteMsg(id: string, uid: string) {
        return await this.prisma.messageStatus.upsert({
            where: {
                messageId_userId: {
                    messageId: id,
                    userId: uid
                }
            },

            update: {
                isDeleted: true,
                deletedAt: new Date()
            },

            create: {
                messageId: id,
                userId: uid,
                isDeleted: true,
                deletedAt: new Date()
            }
        });
    }
}
