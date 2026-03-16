import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private msgService: MessagesService) { }

    @Get(':conId')
    async getMessagesByConversation(@Param('conId') conId: string, @Query('limit') limit?: number) {
        return await this.msgService.getMessagesByConversation(conId, limit);
    }
}
