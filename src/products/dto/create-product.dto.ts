import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsString()
  description!: string;

  @IsInt()
  categoryId!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images!: string[];
}
