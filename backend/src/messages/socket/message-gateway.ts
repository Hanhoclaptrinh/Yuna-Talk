import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "../messages.service";
import { CreateMsgDto } from "../dto/create-msg.dto";
import { JwtService } from "@nestjs/jwt";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Status } from "@prisma/client";

@WebSocketGateway(3001, { cors: { origin: true } })
export class MessageGateway {
    @WebSocketServer() server: Server;
    private userConnections = new Map<string, number>();

    constructor(
        private messageService: MessagesService,
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            if (!token) return client.disconnect();

            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            });
            const userId = payload.sub;
            client.data.user = { id: userId, username: payload.username, email: payload.email };

            const currentCount = this.userConnections.get(userId) || 0;
            this.userConnections.set(userId, currentCount + 1);

            console.log(`User ${payload.username} đã kết nối qua socket (${currentCount + 1})`);

            if (currentCount === 0) {
                await this.usersService.updateStatus(userId, Status.ONLINE);
                this.server.emit('status_changed', { userId, status: Status.ONLINE });
            }
        } catch (e) {
            console.error('Lỗi kết nối socket:', e.message);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            const user = client.data.user;

            if (user) {
                const userId = user.id;
                const currentCount = this.userConnections.get(userId) || 1;

                if (currentCount <= 1) {
                    this.userConnections.delete(userId);
                    await this.usersService.updateStatus(userId, Status.OFFLINE);
                    this.server.emit('status_changed', { userId, status: Status.OFFLINE });
                    console.log(`User ${user.username} đã OFFLINE`);
                } else {
                    this.userConnections.set(userId, currentCount - 1);
                    console.log(`User ${user.username} đã offline (${currentCount - 1})`);
                }
            }
        } catch (e) {
            console.error('Lỗi ngắt kết nối socket:', e.message);
        }
    }

    @SubscribeMessage('join_conversation')
    handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conId: string) {
        client.join(conId);
        console.log(`Socket ${client.id} đã tham gia phòng ${conId}`);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateMsgDto
    ) {
        if (!client.data.user) {
            console.error('Lỗi: socket không có thông tin người dùng');
            return;
        }
        const uid = client.data.user.id;

        const saveMsg = await this.messageService.saveMessage(uid, payload);
        this.server.to(payload.conversationId).emit('new_message', saveMsg);
    }

    @SubscribeMessage('revoke_message')
    async handleRevokeMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { msgId: string, conId: string }
    ) {
        try {
            const uid = client.data.user?.id;
            if (!uid) return;

            const revokedMsg = await this.messageService.revokeMsg(payload.msgId, uid);
            if (revokedMsg) {
                this.server.to(payload.conId).emit('message_revoked', {
                    msgId: payload.msgId,
                    revokedAt: revokedMsg.revokedAt
                })
            }
        } catch (e) {
            client.emit('error', { message: e.message })
        }
    }
}