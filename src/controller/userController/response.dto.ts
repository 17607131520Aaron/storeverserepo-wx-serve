import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

/**
 * 登录/注册响应DTO
 */
@Exclude()
export class LoginResponseDto {
  @Expose()
  @IsString()
  public token: string;

  @Expose()
  @IsNumber()
  public expiresIn: number;
}

/**
 * 注册响应DTO
 */
@Exclude()
export class RegisterResponseDto {
  @Expose()
  @IsString()
  public message: string;
}

/**
 * 用户信息响应DTO
 * 用于定义接口返回的用户信息结构
 * 自动排除未标记@Expose()的字段（如password等敏感信息）
 */
@Exclude()
export class UserInfoResponseDto {
  @Expose()
  @IsNumber()
  public id: number;

  @Expose()
  @IsString()
  public username: string;

  @Expose()
  @IsString()
  @IsOptional()
  public realName?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  public email?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  public phone?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  public wechatOpenId?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  public wechatNickName?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  public wechatAvatarUrl?: string | null;

  @Expose()
  @IsNumber()
  public status: number;

  @Expose()
  @IsDateString()
  public createdAt: Date;

  @Expose()
  @IsDateString()
  public updatedAt: Date;
}

