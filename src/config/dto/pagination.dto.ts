import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value ?? 1)
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @IsPositive({ message: 'Page must be a positive number' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => value ?? 15)
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @IsPositive({ message: 'Limit must be a positive number' })
  limit?: number;
}
