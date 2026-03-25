import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessageGateway } from './socket/message-gateway';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CloudinaryModule, UsersModule],
  providers: [MessagesService, MessageGateway],
  controllers: [MessagesController],
  exports: [MessagesService]
})
export class MessagesModule { }
