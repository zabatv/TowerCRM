import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  @Roles('admin', 'manager', 'sales')
  @ApiOperation({ summary: 'List leads with filters' })
  findAll(@Query() query: QueryLeadDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'sales')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'sales')
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'sales')
  @ApiOperation({ summary: 'Update lead' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Post(':id/convert')
  @Roles('admin', 'manager', 'sales')
  @ApiOperation({ summary: 'Convert lead to student' })
  convert(@Param('id') id: string, @Body('userId') userId?: string) {
    return this.leadsService.convertToStudent(id, userId);
  }

  @Post('bulk-assign')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Bulk assign leads' })
  bulkAssign(@Body('ids') ids: string[], @Body('assignedTo') assignedTo: string) {
    return this.leadsService.bulkAssign(ids, assignedTo);
  }

  @Post('bulk-delete')
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk delete leads' })
  bulkDelete(@Body('ids') ids: string[]) {
    return this.leadsService.bulkDelete(ids);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
