import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConvosDto } from './dto/create-convos.dto';
import { Role } from '@prisma/client';
import { UpdateConvosDto } from './dto/update-convos.dto';

@Injectable()
export class ConversationsService {
    constructor(private prisma: PrismaService) { }

    async createConvos(creatorId: string, payload: CreateConvosDto) {
        const { name, isGroup, participantIds } = payload;

        // khong nhan tin chinh ban than
        if (!payload.isGroup && payload.participantIds.includes(creatorId))
            throw new BadRequestException('Không thể tạo cuộc trò chuyện với chính mình');

        if (payload.isGroup) {
            if (!payload.name || payload.name.trim() === '')
                throw new BadRequestException('Tên nhóm không được để trống');

            if (payload.participantIds.length < 2)
                throw new BadRequestException('Nhóm phải có ít nhất 3 thành viên (bao gồm cả bạn)');
        }

        // chat 1-1
        if (!isGroup) {
            const targetId = participantIds[0];


            // kiem tra lich su nhan tin
            const existing = await this.prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        { participants: { some: { userId: creatorId } } },
                        { participants: { some: { userId: targetId } } },
                    ]
                },

                include: {
                    participants: {
                        include: {
                            user: {
                                select: { username: true, avatar: true }
                            }
                        }
                    }
                }
            });

            if (existing) return existing;
        }

        // neu chua tung nhan tin
        // hoac group
        return this.prisma.conversation.create({
            data: {
                name: isGroup ? name : null,
                isGroup,
                createdById: creatorId,
                participants: {
                    create: [
                        { userId: creatorId, role: Role.ADMIN }, // nguoi tao
                        ...participantIds.map((id) => ({ userId: id, role: Role.MEMBER })) // members
                    ]
                }
            },

            include: { participants: true }
        });
    }

    async findAllMyConvos(uid: string) {
        return await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: uid } // lay cac cuoc hoi thoai ban than la thanh vien
                }
            },

            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                status: true
                            }
                        }
                    }
                },

                // lay tin nhan cuoi cung trong doan hoi thoai
                lastMessage: {
                    include: {
                        sender: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            },

            orderBy: {
                updatedAt: 'desc' // dua cac cuoc tro chuyen moi nhat len tren
            }
        });
    }

    async updateConvos(conId: string, uid: string, payload: UpdateConvosDto) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: uid,
                    conversationId: conId
                }
            }
        });

        if (!participant) throw new ForbiddenException('Bạn không phải là thành viên của cuộc trò chuyện này');

        const convos = await this.prisma.conversation.findUnique({
            where: { id: conId },
            select: { isGroup: true }
        })

        if (!convos?.isGroup) throw new BadRequestException('Chỉ có thể đổi tên cho nhóm chat');

        return await this.prisma.conversation.update({
            where: { id: conId },
            data: { name: payload.name }
        });
    }

    async removeConvos(conId: string, uid: string) {
        const convos = await this.prisma.conversation.findUnique({
            where: { id: conId },
            select: { createdById: true }
        });

        if (!convos) throw new NotFoundException('Cuộc trò chuyện không tồn tại');

        if (convos.createdById !== uid) throw new ForbiddenException('Chỉ người tạo cuộc trò chuyện mới có quyền xóa toàn bộ');

        try {
            // su dung transaction
            return await this.prisma.$transaction(async (tx) => {
                // xoa msg status
                await tx.messageStatus.deleteMany({
                    where: { message: { conversationId: conId } }
                });

                // xoa tin nhan
                await tx.message.deleteMany({
                    where: { conversationId: conId }
                });

                // xoa thanh vien
                await tx.conversationParticipant.deleteMany({
                    where: { conversationId: conId }
                })

                await tx.conversation.deleteMany({
                    where: { id: conId }
                })

                return { message: 'Xóa thành công cuộc trò chuyện' };
            });
        } catch (er) {
            console.log(er);
            throw new InternalServerErrorException('Có lỗi xảy ra khi xóa dữ liệu');
        }
    }
}
