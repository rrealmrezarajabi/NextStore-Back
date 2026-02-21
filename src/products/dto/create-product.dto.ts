import { ArrayNotEmpty, IsArray, IsInt, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({ example: "iPhone 16" })
  @IsString()
  title!: string;

  @ApiProperty({ example: 1200, minimum: 0 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ example: "Latest iPhone model" })
  @IsString()
  description!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId!: number;

  @ApiProperty({ example: ["https://example.com/img1.jpg"], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images!: string[];
}
