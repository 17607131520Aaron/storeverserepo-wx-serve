import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService, type LoginToken } from '@/auth/auth.service';
import { User } from '@/entity/user.entity';
import type { IUserInfoService, WechatCode2SessionResponse } from '@/services/userinfo.interface';

@Injectable()
export class UserInfoServiceImpl implements IUserInfoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 微信登录
   */
  public async wechatLogin(code: string): Promise<LoginToken> {
    // 1. 调用微信接口获取openid
    const sessionData = await this.code2Session(code);
    const openid = sessionData.openid;

    // 2. 查找用户是否存在
    const user = await this.findByOpenId(openid);

    if (!user) {
      throw new UnauthorizedException('用户未注册，请先完成注册');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    // 3. 生成JWT token
    const token = await this.authService.signUser({
      sub: user.id,
      username: user.username ?? user.wechatOpenId,
    });

    return token;
  }

  /**
   * 微信注册
   */
  public async wechatRegister(
    code: string,
    nickName?: string,
    avatarUrl?: string,
  ): Promise<LoginToken> {
    // 1. 调用微信接口获取openid
    const sessionData = await this.code2Session(code);
    const openid = sessionData.openid;

    // 2. 检查用户是否已存在
    const existingUser = await this.findByOpenId(openid);
    if (existingUser) {
      // 如果用户已存在，直接返回登录token
      if (existingUser.status !== 1) {
        throw new UnauthorizedException('账号已被禁用，请联系管理员');
      }
      const token = await this.authService.signUser({
        sub: existingUser.id,
        username: existingUser.username ?? existingUser.wechatOpenId,
      });
      return token;
    }

    // 3. 创建新用户
    const newUserData: Partial<User> = {
      username: `wx_${openid.substring(0, 10)}_${Date.now()}`, // 生成唯一用户名
      wechatOpenId: openid,
      wechatNickName: nickName ?? undefined,
      wechatAvatarUrl: avatarUrl ?? undefined,
      password: '', // 微信登录不需要密码
      status: 1, // 默认启用
    };
    const newUser = this.userRepository.create(newUserData);
    const savedUser = await this.userRepository.save(newUser);

    // 4. 生成JWT token
    const token = await this.authService.signUser({
      sub: savedUser.id,
      username: savedUser.username,
    });

    return token;
  }

  /**
   * 通过openid查找用户
   */
  public async findByOpenId(openid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { wechatOpenId: openid },
    });
  }

  /**
   * 通过用户ID查找用户信息
   */
  public async findById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /**
   * 通过用户名查找用户信息
   */
  public async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * 调用微信code2Session接口获取openid和session_key
   */
  private async code2Session(code: string): Promise<WechatCode2SessionResponse> {
    const appId = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appId || !secret) {
      throw new BadRequestException('微信配置未设置，请联系管理员');
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: appId,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    try {
      const httpCall = this.httpService.get<WechatCode2SessionResponse>(url, { params });
      const response = await firstValueFrom(httpCall as Observable<{ data: WechatCode2SessionResponse }>);

      const data = response.data;

      // 检查微信返回的错误
      if (data.errcode) {
        throw new BadRequestException(
          `微信登录失败: ${data.errmsg ?? '未知错误'} (错误码: ${data.errcode})`,
        );
      }

      if (!data.openid) {
        throw new BadRequestException('微信登录失败: 未获取到openid');
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[Wechat] code2Session error:', error);
      throw new BadRequestException('调用微信接口失败，请稍后重试');
    }
  }
}

