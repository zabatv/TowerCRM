import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'List lessons with filters' })
  findAll(@Query() query: any) {
    return this.lessonsService.findAll(query);
  }

  @Get('calendar')
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'Get lessons for calendar view' })
  getCalendar(@Query() query: any) {
    return this.lessonsService.getCalendar(query);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'Get lesson by ID' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a lesson' })
  create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Post(':id/attendance')
  @Roles('admin', 'manager', 'teacher')
  @ApiOperation({ summary: 'Mark attendance for lesson' })
  markAttendance(@Param('id') id: string, @Body('attendance') attendance: Array<{ userId: string; status: string }>) {
    return this.lessonsService.markAttendance(id, attendance);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete lesson' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
