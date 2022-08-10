import { IsOptional } from 'class-validator';

export class FindDto {
  @IsOptional()
  where?: any;

  @IsOptional()
  select?: any;

  @IsOptional()
  include?: any;

  @IsOptional()
  orderBy?: any;

  @IsOptional()
  page?: number;

  @IsOptional()
  size?: number;

  @IsOptional()
  modelName?: string;
}
