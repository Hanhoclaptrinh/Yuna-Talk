import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateConvosDto } from './dto/create-convos.dto';
import { UpdateConvosDto } from './dto/update-convos.dto';

@Controller('conversations')
export class ConversationsController {
    constructor(private convosService: ConversationsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    createConvos(@Request() req, @Body() body: CreateConvosDto) {
        return this.convosService.createConvos(req.user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-convos')
    findAllMyConvos(@Request() req) {
        return this.convosService.findAllMyConvos(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    updateConvos(@Param('id') id: string, @Request() req, @Body() body: UpdateConvosDto) {
        return this.convosService.updateConvos(id, req.user.id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    removeConvos(@Param('id') id: string, @Request() req) {
        return this.convosService.removeConvos(id, req.user.id);
    }
}
