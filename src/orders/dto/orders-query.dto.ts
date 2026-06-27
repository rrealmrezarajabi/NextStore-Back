import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class OrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderId?: number;
}
