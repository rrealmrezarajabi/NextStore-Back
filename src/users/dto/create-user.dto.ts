import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { APP_ROLES, AppRole } from "../../common/types/role.type";

export class CreateUserDto {
  @ApiProperty({ example: "Jane" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: "jane_doe" })
  @IsString()
  username!: string;

  @ApiProperty({ example: "jane@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "1234", minLength: 4 })
  @IsString()
  @MinLength(4)
  password!: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatar?: string;

  @ApiPropertyOptional({ enum: APP_ROLES, example: "customer" })
  @IsOptional()
  @IsIn(APP_ROLES)
  role?: AppRole;
}
