import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 微信登录请求DTO
 */
export class WechatLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  public code: string;
}

/**
 * 微信注册请求DTO
 */
export class WechatRegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  public code: string;

  @IsString()
  @IsOptional()
  public nickName?: string;

  @IsString()
  @IsOptional()
  public avatarUrl?: string;
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
}

