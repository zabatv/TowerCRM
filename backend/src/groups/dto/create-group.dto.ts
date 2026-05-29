import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'English Beginner A1' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
