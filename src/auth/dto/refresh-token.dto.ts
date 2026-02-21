import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
  @ApiProperty({ example: "eyJhbGci..." })
  @IsString()
  refresh_token!: string;
}
