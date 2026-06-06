import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  addressId?: number;
}
