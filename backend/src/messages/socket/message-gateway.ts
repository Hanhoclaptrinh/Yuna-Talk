import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "../messages.service";
import { CreateMsgDto } from "../dto/create-msg.dto";
// import { AuthService } from "src/auth/auth.service";
import { UsePipes, ValidationPipe } from "@nestjs/common";

@WebSocketGateway(3001, { cors: { origin: true } })
export class MessageGateway {
    @WebSocketServer() server: Server;

    constructor(
        private messageService: MessagesService,
        // private authService: AuthService
    ) { }

    // async handleConnection(client: Socket) {
    //     const token = client.handshake.auth.token;
    //     if (!token) return client.disconnect();

    //     const user = await this.authService.verifyToken(token);
    //     client.data.user = user;
    // }

    @SubscribeMessage('join_conversation')
    handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conId: string) {
        // tham gia vao phong chat
        // khong tham gia thi khong nhan duoc tin nhan
        client.join(conId);
        console.log(`socket ${client.id} da connect vao phong ${conId}`);
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: CreateMsgDto
    ) {
        const uid = client.data.user.id; // id nguoi gui duoc lay tu jwt

        // save tin nhan vao db
        const saveMsg = await this.messageService.saveMessage(uid, payload);

        // phat tin nhan den toan user trong phong
        this.server.to(payload.conversationId).emit('new_message', saveMsg);
    }
}