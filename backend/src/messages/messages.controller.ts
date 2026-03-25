import { Controller, Delete, Get, Param, Query, Request, UseGuards, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('messages')
export class MessagesController {
    constructor(
        private msgService: MessagesService,
        private cloudinaryService: CloudinaryService
    ) { }

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

    @UseGuards(JwtAuthGuard)
    @Post('upload/:type')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB limit
        }
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('type') fileType: 'image' | 'video' | 'audio' | 'file',
        @Request() req
    ) {
        if (!file) {
            throw new BadRequestException('Không có file được upload');
        }

        // Validate file type
        const validTypes = ['image', 'video', 'audio', 'file'];
        if (!validTypes.includes(fileType)) {
            throw new BadRequestException('Loại file không hợp lệ');
        }

        try {
            const result = await this.cloudinaryService.uploadMessageFile(file, fileType);
            return {
                url: result.secure_url,
                publicId: result.public_id,
                type: fileType,
                size: result.bytes,
                duration: result.duration, // for audio/video
                format: result.format
            };
        } catch (error) {
            throw new BadRequestException('Lỗi upload file: ' + error.message);
        }
    }
}
