import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
