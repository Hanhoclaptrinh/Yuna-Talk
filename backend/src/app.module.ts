import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100
        }
      ]
    }),

    // cau hinh throttler cho tung hanh dong
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       name: 'short', // Chống spam nhanh
    //       ttl: 1000,     // 1 giây
    //       limit: 3,      // Tối đa 3 requests/giây
    //     },
    //     {
    //       name: 'medium', // Giới hạn chung cho hoạt động bình thường
    //       ttl: 60000,    // 1 phút
    //       limit: 60,     // Tối đa 60 requests/phút
    //     },
    //     {
    //       name: 'auth',   // Riêng cho đăng nhập/đăng ký
    //       ttl: 3600000,  // 1 giờ
    //       limit: 20,     // Tối đa 20 lần thử mỗi giờ
    //     },
    //   ],
    // }),

    PrismaModule,
    AuthModule,
    UsersModule,
    RedisModule,
    ConversationsModule,
    MessagesModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },

    AppService
  ],
  exports: [AppService]
})
export class AppModule { }
