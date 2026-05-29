import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'English A1 - Lesson 1' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-06-01T10:00:00Z' })
  @IsDateString()
  dateTime: string;

  @ApiProperty({ default: 60 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ required: false, enum: ['scheduled', 'completed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;
}
