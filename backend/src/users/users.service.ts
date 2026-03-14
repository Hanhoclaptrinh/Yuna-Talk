import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identity },
          { username: identity }
        ]
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
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

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

  async updatePassword(id: string, newPass: string) {
    await this.prisma.user.update({
      where: { id },
      data: { password: newPass }
    })
  }
}
