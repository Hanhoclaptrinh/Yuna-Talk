import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessageGateway } from './socket/message-gateway';

@Module({
  providers: [MessagesService, MessageGateway],
  controllers: [MessagesController],
  exports: [MessagesService]
})
export class MessagesModule { }
