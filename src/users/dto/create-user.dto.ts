import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { APP_ROLES, AppRole } from '../../common/types/role.type';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;

  @IsString()
  avatar!: string;

  @IsOptional()
  @IsIn(APP_ROLES)
  role?: AppRole;
}
