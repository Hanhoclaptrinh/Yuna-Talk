import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  findByIdentity(@Query('identity') identity: string) {
    return this.usersService.findByIdentity(identity);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Request() req, @Body() body: UpdateUserDto) {
    return this.usersService.update(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const res = await this.cloudinaryService.uploadFile(file);
    return this.usersService.updateAvatar(req.user.id, res.secure_url);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  remove(@Request() req) {
    return this.usersService.remove(req.user.id);
  }
}
