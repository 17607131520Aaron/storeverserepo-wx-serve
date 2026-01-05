import type { User } from '@/entity/user.entity';
import type { LoginToken } from '@/auth/auth.service';

export interface WechatCode2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export interface IUserInfoService {
  /**
   * 微信登录
   * @param code 微信小程序登录code
   * @returns 登录token
   */
  wechatLogin(code: string): Promise<LoginToken>;

  /**
   * 微信注册
   * @param code 微信小程序登录code
   * @param nickName 微信昵称（可选）
   * @param avatarUrl 微信头像（可选）
   * @returns 登录token
   */
  wechatRegister(code: string, nickName?: string, avatarUrl?: string): Promise<LoginToken>;

  /**
   * 通过openid查找用户
   * @param openid 微信openid
   * @returns 用户信息
   */
  findByOpenId(openid: string): Promise<User | null>;

  /**
   * 通过用户ID查找用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  findById(userId: number): Promise<User | null>;

  /**
   * 通过用户名查找用户信息
   * @param username 用户名
   * @returns 用户信息
   */
  findByUsername(username: string): Promise<User | null>;
}
