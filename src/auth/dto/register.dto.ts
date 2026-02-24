import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "John" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: "john_doe" })
  @IsString()
  username!: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "secret123", minLength: 4 })
  @IsString()
  @MinLength(4)
  password!: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
