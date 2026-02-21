import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ example: "Electronics" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: "https://example.com/electronics.jpg" })
  @IsOptional()
  @IsString()
  image?: string;
}
