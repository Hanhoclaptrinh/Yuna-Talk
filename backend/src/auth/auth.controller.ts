import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService) { }

    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authservice.register(body);
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authservice.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    changePassword(@Body() body: ChangePasswordDto, @Request() req) {
        return this.authservice.changePassword(req.user.id, body);
    }

    @Post('refresh')
    refresh(@Body('refresh-token') refreshToken: string, @Body('uid') uid: string) {
        return this.authservice.refresh(uid, refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Request() req) {
        return this.authservice.logout(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req) {
        return this.authservice.getMe(req.user.id);
    }
}
