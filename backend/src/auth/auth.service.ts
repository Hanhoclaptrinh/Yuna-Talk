import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private redis: RedisService
    ) { }

    private signAccessToken(uid: string, username: string, email: string) {
        return this.jwtService.sign({
            sub: uid,
            username: username,
            email: email
        }, { expiresIn: '20m' });
    }

    private async generateRefreshToken(uid: string, deviceId: string = 'default') {
        const refreshToken = uuidv4();
        const key = `refresh_token:${uid}:${deviceId}`;

        await this.redis.set(key, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 ngay

        return refreshToken;
    }

    async register(payload: RegisterDto) {
        const [exEmail, exUsername] = await Promise.all([
            this.usersService.findByEmail(payload.email),
            this.usersService.findByUsername(payload.username)
        ]);

        if (exEmail) throw new ConflictException('Email đã tồn tại');
        if (exUsername) throw new ConflictException('Tên người dùng đã tồn tại');

        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const user = await this.usersService.create({
            ...payload,
            password: hashedPassword
        });

        const accessToken = this.signAccessToken(user.id, user.username, user.email);
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            message: 'Đăng ký thành công',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    async login(payload: LoginDto) {
        let user = await this.usersService.findByEmail(payload.identity);
        if (!user) user = await this.usersService.findByUsername(payload.identity);

        if (!user || !(await bcrypt.compare(payload.password, user.password))) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

        const accessToken = this.signAccessToken(user.id, user.username, user.email);
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            message: 'Đăng nhập thành công',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    async changePassword(uid: string, payload: ChangePasswordDto) {
        if (payload.newPass === payload.oldPass) throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');

        const user = await this.usersService.findOne(uid);

        const isMatch = await bcrypt.compare(payload.oldPass, user.password);
        if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không chính xác');

        const hashedPassword = await bcrypt.hash(payload.newPass, 10);
        await this.usersService.updatePassword(uid, hashedPassword);

        // xoa toan bo session tren redis
        const keys = await this.redis.keys(`refresh_token:${uid}:*`);
        if (keys.length > 0) await this.redis.del(...keys);

        const accessToken = this.signAccessToken(user.id, user.username, user.email);
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            message: 'Đổi mật khẩu thành công và đã đăng xuất khỏi các thiết bị khác',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    // cap lai refresh token
    async refresh(uid: string, oldToken: string, deviceId: string = 'default') {
        const key = `refresh_token:${uid}:${deviceId}`;
        const savedToken = await this.redis.get(key);

        if (!savedToken || savedToken !== oldToken) throw new UnauthorizedException('Phiên làm việc hết hạn, vui lòng đăng nhập lại');

        const user = await this.usersService.findOne(uid);

        const newAccessToken = this.signAccessToken(user.id, user.username, user.email);
        const newRefreshToken = await this.generateRefreshToken(user.id, deviceId);

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        };
    }

    async logout(uid: string, deviceId: string = 'default') {
        await this.redis.del(`refresh_token:${uid}:${deviceId}`);
        return { message: 'Đăng xuất thành công' };
    }

    async getMe(uid: string) {
        const user = await this.usersService.findOne(uid);

        if (!user) throw new UnauthorizedException('Không tìm thấy người dùng');

        const { password, ...result } = user;

        return result;
    }
}
