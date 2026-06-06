import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class CreateAddressDto {
  @ApiPropertyOptional({ example: "Home" })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: "09123456789" })
  @IsString()
  @Length(7, 20)
  phone!: string;

  @ApiProperty({ example: "Tehran" })
  @IsString()
  province!: string;

  @ApiProperty({ example: "Tehran" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "Valiasr St, No. 12" })
  @IsString()
  street!: string;

  @ApiProperty({ example: "1234567890" })
  @IsString()
  @Length(4, 20)
  postalCode!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
