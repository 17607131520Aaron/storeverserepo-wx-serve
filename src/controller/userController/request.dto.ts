import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/**
 * 微信登录请求DTO
 */
export class WechatLoginDto {
  @ValidateIf((o) => !o.username && !o.password)
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  public code: string;

  @ValidateIf((o) => !o.code)
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  public username?: string;

  @ValidateIf((o) => !o.code)
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  public password?: string;
}

/**
 * PC端登录请求DTO
 */
export class PcLoginDto {
  @ValidateIf((o) => !o.wechatOpenId)
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  @MinLength(3, { message: '账号长度至少3个字符' })
  @MaxLength(20, { message: '账号长度不能超过20个字符' })
  public username?: string;

  @ValidateIf((o) => !o.wechatOpenId)
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  public password?: string;

  /**
   * 可选的微信唯一ID（openid），若传入则直接用openid登录
   */
  @ValidateIf((o) => !o.username && !o.password)
  @IsString()
  @IsNotEmpty({ message: '微信OpenId不能为空' })
  public wechatOpenId?: string;
}

/**
 * PC端注册请求DTO
 */
export class PcRegisterDto {
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  @MinLength(3, { message: '账号长度至少3个字符' })
  @MaxLength(20, { message: '账号长度不能超过20个字符' })
  public username: string;

  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  public realName: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  public password: string;

  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  public confirmPassword: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  public email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  public phone?: string;

  /**
   * 可选的微信唯一ID（openid），如果传入则在注册时一并绑定
   */
  @IsString()
  @IsOptional()
  public wechatOpenId?: string;

  /**
   * 微信头像
   */
  @IsString()
  @IsOptional()
  public wechatAvatarUrl?: string;

  /**
   * 微信昵称
   */
  @IsString()
  @IsOptional()
  public wechatNickName?: string;
}

/**
 * 查询用户信息请求DTO
 */
export class GetUserInfoDto {
  @IsString()
  @IsOptional()
  public id?: string;

  @IsString()
  @IsOptional()
  public username?: string;

  @IsString()
  @IsOptional()
  public wechatOpenId?: string;
}
