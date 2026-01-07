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
import { GetUserInfoDto, PcLoginDto, PcRegisterDto, WechatLoginDto } from './request.dto';
import { LoginResponseDto, RegisterResponseDto, UserInfoResponseDto } from './response.dto';

@Controller('userinfo')
export class UserController {
  constructor(@Inject('IUserInfoService') private readonly userinfoService: IUserInfoService) {}

  /**
   * 微信登录接口
   */
  @Post('wechatLogin')
  @Public()
  @useDto(LoginResponseDto)
  public async login(@Body() loginDto: WechatLoginDto): Promise<LoginResponseDto> {
    // 支持账号密码登录，优先走账号密码
    if (loginDto.username && loginDto.password) {
      const token = await this.userinfoService.pcLogin({
        username: loginDto.username,
        password: loginDto.password,
      });
      return token as LoginResponseDto;
    }

    const token = await this.userinfoService.wechatLogin(loginDto.code);
    return token as LoginResponseDto;
  }

  /**
   * PC端登录接口
   */
  @Post('userLogin')
  @Public()
  @useDto(LoginResponseDto)
  public async pcLogin(@Body() loginDto: PcLoginDto): Promise<LoginResponseDto> {
    const token = await this.userinfoService.pcLogin({
      username: loginDto.username,
      password: loginDto.password,
    });
    return token as LoginResponseDto;
  }

  /**
   * PC端注册接口
   */
  @Post('registerUser')
  @Public()
  // @useDto(RegisterResponseDto)
  public async pcRegister(@Body() registerDto: PcRegisterDto): Promise<boolean> {
    // 验证确认密码是否一致
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    await this.userinfoService.pcRegister({
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
    
    return true
  }

  /**
   * 查询用户信息
   * 支持通过ID、用户名或微信OpenId查询
   */
  @Get('getUserInfoByUsername')
  @Public()
  @useDto(UserInfoResponseDto)
  public async getUserInfo(@Query() queryDto: GetUserInfoDto): Promise<UserInfoResponseDto> {
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
      user = await this.userinfoService.findById(userId);
    } else if (queryDto.wechatOpenId) {
      // 使用微信OpenId查询
      user = await this.userinfoService.findByOpenId(queryDto.wechatOpenId);
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
