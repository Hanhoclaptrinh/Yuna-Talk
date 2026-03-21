import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(payload: CreateUserDto) {
    const exUser = await this.prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (exUser) throw new BadRequestException('Người dùng đã tồn tại');

    const nUser = await this.prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        avatar: payload.avatar,
        bio: payload.bio,
        status: payload.status
      },

      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        status: true
      }
    });

    return nUser;
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findByIdentity(identity: string) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: identity } },
          { username: { contains: identity } }
        ]

      },

      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        status: true
      },

      take: 10
    });
  }


  async update(id: string, payload: UpdateUserDto) {
    if (payload.username) {
      const exUsername = await this.prisma.user.findFirst({
        where: {
          username: payload.username,
          id: { not: id } // loai tru ban than
        },
      });

      if (exUsername) throw new ConflictException('Tên người dùng đã được sử dụng');
    }

    if (payload.email) {
      const exEmail = await this.prisma.user.findFirst({
        where: {
          email: payload.email,
          id: { not: id } // loai tru ban than
        },
      });

      if (exEmail) throw new ConflictException('Email đã được sử dụng');
    }

    return this.prisma.user.update({
      where: { id },
      data: payload
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    await this.prisma.user.delete({ where: { id } });

    return { message: 'Xóa tài khoản người dùng thành công' };
  }

  // auth
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');

    return user;
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: { id: true, username: true, avatar: true }
    });
  }

  async updatePassword(id: string, newPass: string) {
    await this.prisma.user.update({
      where: { id },
      data: { password: newPass }
    })
  }

  async updateStatus(id: string, status: Status) {
    await this.prisma.user.update({
      where: { id },
      data: { status }
    })
  }
}
