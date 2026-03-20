import { Controller, Delete, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
    constructor(private msgService: MessagesService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':conId')
    async getMessagesByConversation(@Param('conId') conId: string, @Request() req, @Query('limit') limit?: number) {
        return await this.msgService.getMessagesByConversation(conId, req.user.id, limit);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteMsg(@Param('id') id: string, @Request() req) {
        return await this.msgService.deleteMsg(id, req.user.id);
    }
}
