import { Body, Controller, Get, Inject, Post, Request, UnauthorizedException } from '@nestjs/common';
import { Public } from '@/auth/public.decorator';
import type { IUserInfoService } from '@/services/userinfo.interface';
import { WechatLoginDto, WechatRegisterDto } from '@/dto/userinfo.dto';
import type { JwtPayload } from '@/auth/auth.service';

@Controller('userinfo')
export class UserController {
  constructor(@Inject('IUserInfoService') private readonly userinfoService: IUserInfoService) {}

  /**
   * 微信登录接口
   */
  @Post('login')
  @Public()
  public async login(@Body() loginDto: WechatLoginDto) {
    const token = await this.userinfoService.wechatLogin(loginDto.code);
    return {
      token: token.token,
      expiresIn: token.expiresIn,
    };
  }

  /**
   * 微信注册接口
   */
  @Post('register')
  @Public()
  public async register(@Body() registerDto: WechatRegisterDto) {
    const token = await this.userinfoService.wechatRegister(
      registerDto.code,
      registerDto.nickName,
      registerDto.avatarUrl,
    );
    return {
      token: token.token,
      expiresIn: token.expiresIn,
    };
  }

  /**
   * 查询当前登录用户信息
   */
  @Get('profile')
  public async getProfile(@Request() req: Request & { user?: JwtPayload }) {
    const userPayload = req.user;
    if (!userPayload) {
      throw new UnauthorizedException('未找到用户信息');
    }

    const user = await this.userinfoService.findById(userPayload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 返回用户信息，排除敏感字段
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      wechatOpenId: user.wechatOpenId,
      wechatNickName: user.wechatNickName,
      wechatAvatarUrl: user.wechatAvatarUrl,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}