import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Get()
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'List enrollments' })
  findAll(@Query() query: any) {
    return this.enrollmentsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Enroll a student in a group' })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Put(':id/status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update enrollment status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.enrollmentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove enrollment' })
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
