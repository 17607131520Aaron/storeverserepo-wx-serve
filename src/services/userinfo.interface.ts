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
 * 微信注册参数
 */
export interface WechatRegisterParams {
  code: string;
  nickName?: string;
  avatarUrl?: string;
}

/**
 * PC端登录参数
 */
export interface PcLoginParams {
  username: string;
  password: string;
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
   * @param params 微信注册参数
   * @returns 登录token
   */
  wechatRegister(params: WechatRegisterParams): Promise<LoginToken>;

  /**
   * PC端登录
   * @param params PC端登录参数
   * @returns 登录token
   */
  pcLogin(params: PcLoginParams): Promise<LoginToken>;

  /**
   * PC端注册
   * @param params PC端注册参数
   */
  pcRegister(params: PcRegisterParams): Promise<void>;

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
