import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserController } from '@/controller/userController';
import { UserInfoServiceImpl } from '@/services/imp/UserInfoServiceImpl';
import { User } from '@/entity/user.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 注册User实体，这是使用@InjectRepository的必要条件
    AuthModule,
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserInfoService',
      useClass: UserInfoServiceImpl,
    },
  ],
  exports: ['IUserInfoService'],
})
export class UserModule {}
