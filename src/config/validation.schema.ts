import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RedisConfig {
  @IsString()
  @IsNotEmpty({ message: 'Redis host is required' })
  host: string;

  @Type(() => Number)
  @IsNumber()
  port: number;
}

class MailConfig {
  @IsString()
  @IsNotEmpty({ message: 'Mail host is required' })
  host: string;

  @Type(() => Number)
  @IsNumber()
  port: number;

  @IsString()
  @IsNotEmpty({ message: 'Mail user is required' })
  user: string;

  @IsString()
  @IsNotEmpty({ message: 'Mail password is required' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Mail from is required' })
  from: string;

  @IsString()
  @IsNotEmpty({ message: 'Mail secure is required' })
  secure: string;
}

class JWTSecret {
  @IsString()
  @IsNotEmpty({ message: 'JWT access secret is required' })
  access_secret: string;

  @IsString()
  @IsNotEmpty({ message: 'JWT refresh secret is required' })
  refresh_secret: string;
}

export class EnvConfig {
  @IsString()
  @IsIn(['local', 'development', 'production', 'test'])
  node_env: 'local' | 'development' | 'production' | 'test';

  @IsString()
  app_name: string;

  @Type(() => Number)
  @IsNumber()
  port: number;

  @IsString()
  @IsNotEmpty({ message: 'Mongo URL is required' })
  mongo_uri: string;

  @ValidateNested()
  @Type(() => JWTSecret)
  jwt: JWTSecret;

  // @ValidateNested()
  // @Type(() => RedisConfig)
  // redis: RedisConfig;
  //
  // @ValidateNested()
  // @Type(() => MailConfig)
  // email: MailConfig;
}
