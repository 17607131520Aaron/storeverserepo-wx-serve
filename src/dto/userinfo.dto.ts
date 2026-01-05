import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 微信登录DTO
 */
export class WechatLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  public code: string;
}

/**
 * 微信注册DTO
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

