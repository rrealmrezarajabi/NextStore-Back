import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CategoriesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  name?: string;
}
