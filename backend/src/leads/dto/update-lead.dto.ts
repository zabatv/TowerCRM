import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({ required: false, enum: ['new', 'contacted', 'converted', 'lost'] })
  @IsOptional()
  @IsString()
  status?: string;
}
