import { Public } from '@/auth/public.decorator';
import { useDto } from '@/decorators/use-dto.decorator';
import type { User } from '@/entity/user.entity';
import type { IUserInfoService } from '@/services/userinfo.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { GetUserInfoDto, PcLoginDto, PcRegisterDto } from './request.dto';
import { LoginResponseDto, UserInfoResponseDto } from './response.dto';

@Controller('userinfo')
export class UserController {
  constructor(@Inject('IUserInfoService') private readonly userinfoService: IUserInfoService) {}

  /**
   * 登录接口
   */
  @Post('userLogin')
  @Public()
  @useDto(LoginResponseDto)
  public async handleUserLogin(@Body() loginDto: PcLoginDto): Promise<LoginResponseDto> {
    // 若传入微信OpenId，则直接通过OpenId登录
    if (loginDto.wechatOpenId) {
      const token = await this.userinfoService.loginWithCredentialsOrOpenId({
        wechatOpenId: loginDto.wechatOpenId,
      });
      return token as LoginResponseDto;
    }

    // 否则使用账号密码登录
    const token = await this.userinfoService.loginWithCredentialsOrOpenId({
      username: loginDto.username,
      password: loginDto.password,
    });
    return token as LoginResponseDto;
  }

  /**
   * 注册接口
   */
  @Post('registerUser')
  @Public()
  // @useDto(RegisterResponseDto)
  public async handleUserRegistration(@Body() registerDto: PcRegisterDto): Promise<boolean> {
    // 验证确认密码是否一致
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    await this.userinfoService.registerUserAccount({
      username: registerDto.username,
      password: registerDto.password,
      realName: registerDto.realName,
      email: registerDto.email,
      phone: registerDto.phone,
      // 如果传入了微信唯一ID，则在注册时一并绑定
      wechatOpenId: registerDto.wechatOpenId,
      wechatAvatarUrl: registerDto.wechatAvatarUrl,
      wechatNickName: registerDto.wechatNickName,
    });

    return true;
  }

  /**
   * 查询用户信息
   * 支持通过ID、用户名或微信OpenId查询
   */
  @Get('getUserInfoByUsername')
  @Public()
  @useDto(UserInfoResponseDto)
  public async fetchUserInfo(@Query() queryDto: GetUserInfoDto): Promise<UserInfoResponseDto> {
    // 至少需要提供一个查询参数
    if (!queryDto.id && !queryDto.username && !queryDto.wechatOpenId) {
      throw new BadRequestException('请提供用户ID、用户名或微信OpenId');
    }

    let user: User | null = null;

    // 优先使用ID查询
    if (queryDto.id) {
      const userId = Number.parseInt(queryDto.id, 10);
      if (Number.isNaN(userId)) {
        throw new BadRequestException('用户ID格式不正确');
      }
      user = await this.userinfoService.findUserById(userId);
    } else if (queryDto.wechatOpenId) {
      // 使用微信OpenId查询
      user = await this.userinfoService.findUserByOpenId(queryDto.wechatOpenId);
    } else if (queryDto.username) {
      // 使用用户名查询
      user = await this.userinfoService.findUserByUsername(queryDto.username);
    }

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user as UserInfoResponseDto;
  }
}
