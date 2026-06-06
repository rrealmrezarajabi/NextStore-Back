import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Jane" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "jane_doe" })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: "jane@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "newpass1234", minLength: 4 })
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatar?: string;
}
