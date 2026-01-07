import type { LoginToken } from '@/auth/auth.service';
import type { User } from '@/entity/user.entity';

export interface WechatCode2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * PC端登录参数
 */
export interface PcLoginParams {
  username?: string;
  password?: string;
  /**
   * 可选的微信唯一ID（openid），若提供则使用openid登录
   */
  wechatOpenId?: string;
}

/**
 * PC端注册参数
 */
export interface PcRegisterParams {
  username: string;
  password: string;
  realName: string;
  email?: string;
  phone?: string;
  /**
   * 可选的微信唯一ID（openid）
   */
  wechatOpenId?: string;
  /**
   * 可选的微信头像
   */
  wechatAvatarUrl?: string;
  /**
   * 可选的微信昵称
   */
  wechatNickName?: string;
}

export interface IUserInfoService {
  /**
   * 微信登录
   * @param code 微信小程序登录code
   * @returns 登录token
   */
  loginWithWechatCode(code: string): Promise<LoginToken>;

  /**
   * PC端登录
   * @param params PC端登录参数
   * @returns 登录token
   */
  loginWithCredentialsOrOpenId(params: PcLoginParams): Promise<LoginToken>;

  /**
   * PC端注册
   * @param params PC端注册参数
   */
  registerUserAccount(params: PcRegisterParams): Promise<void>;

  /**
   * 通过openid查找用户
   * @param openid 微信openid
   * @returns 用户信息
   */
  findUserByOpenId(openid: string): Promise<User | null>;

  /**
   * 通过用户ID查找用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  findUserById(userId: number): Promise<User | null>;

  /**
   * 通过用户名查找用户信息
   * @param username 用户名
   * @returns 用户信息
   */
  findUserByUsername(username: string): Promise<User | null>;
}
