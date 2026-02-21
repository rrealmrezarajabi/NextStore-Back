import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@nextstore.dev" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "admin1234", minLength: 4 })
  @IsString()
  @MinLength(4)
  password!: string;
}
