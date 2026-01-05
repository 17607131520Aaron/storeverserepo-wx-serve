import { Body, Controller, Get, Inject, Post, Query, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Public } from '@/auth/public.decorator';
import { useDto } from '@/decorators/use-dto.decorator';
import type { IUserInfoService } from '@/services/userinfo.interface';
import type { User } from '@/entity/user.entity';
import { WechatLoginDto, WechatRegisterDto, GetUserInfoDto } from './request.dto';
import { LoginResponseDto, RegisterResponseDto, UserInfoResponseDto } from './response.dto';

@Controller('userinfo')
export class UserController {
  constructor(@Inject('IUserInfoService') private readonly userinfoService: IUserInfoService) {}

  /**
   * 微信登录接口
   */
  @Post('login')
  @Public()
  @useDto(LoginResponseDto)
  public async login(@Body() loginDto: WechatLoginDto): Promise<LoginResponseDto> {
    const token = await this.userinfoService.wechatLogin(loginDto.code);
    return token as LoginResponseDto;
  }

  /**
   * 微信注册接口
   */
  @Post('register')
  @Public()
  @useDto(RegisterResponseDto)
  public async register(@Body() registerDto: WechatRegisterDto): Promise<RegisterResponseDto> {
    await this.userinfoService.wechatRegister(
      registerDto.code,
      registerDto.nickName,
      registerDto.avatarUrl,
    );

    const result: RegisterResponseDto = { message: '注册成功' };
    return result;
  }

  /**
   * 查询用户信息
   * 支持通过ID或用户名查询
   */
  @Get('info')
  @Public()
  @useDto(UserInfoResponseDto)
  public async getUserInfo(@Query() queryDto: GetUserInfoDto): Promise<UserInfoResponseDto> {
    // 至少需要提供一个查询参数
    if (!queryDto.id && !queryDto.username) {
      throw new BadRequestException('请提供用户ID或用户名');
    }

    let user: User | null = null;

    // 优先使用ID查询
    if (queryDto.id) {
      const userId = Number.parseInt(queryDto.id, 10);
      if (Number.isNaN(userId)) {
        throw new BadRequestException('用户ID格式不正确');
      }
      user = await this.userinfoService.findById(userId);
    } else if (queryDto.username) {
      // 使用用户名查询
      user = await this.userinfoService.findByUsername(queryDto.username);
    }

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user as UserInfoResponseDto;
  }
}