import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum ProductSortBy {
  id = 'id',
  title = 'title',
  price = 'price',
  createdAt = 'createdAt',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class ProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price_max?: number;

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.id;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.asc;
}
