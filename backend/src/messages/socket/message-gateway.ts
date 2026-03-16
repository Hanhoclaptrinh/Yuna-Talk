import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "../messages.service";
import { CreateMsgDto } from "../dto/create-msg.dto";
import { JwtService } from "@nestjs/jwt";
import { UsePipes, ValidationPipe } from "@nestjs/common";

@WebSocketGateway(3001, { cors: { origin: true } })
export class MessageGateway {
    @WebSocketServer() server: Server;

    constructor(
        private messageService: MessagesService,
        private jwtService: JwtService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            if (!token) return client.disconnect();

            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            });
            client.data.user = { id: payload.sub, username: payload.username, email: payload.email };
            console.log(`User ${payload.username} đã kết nối qua socket`);
        } catch (e) {
            console.error('Lỗi kết nối socket:', e.message);
            client.disconnect();
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
}