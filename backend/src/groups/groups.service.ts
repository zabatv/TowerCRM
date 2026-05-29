import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.branchId) where.branchId = query.branchId;
    if (query.course) where.course = query.course;
    if (query.level) where.level = query.level;
    if (query.teacherId) where.teacherId = query.teacherId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search };

    const [data, total] = await Promise.all([
      this.prisma.group.findMany({ where, skip, take: limit, include: { branch: true, teacher: true, _count: { select: { enrollments: true, lessons: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.group.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { branch: true, teacher: true, enrollments: { include: { user: true } }, lessons: true },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(dto: CreateGroupDto) {
    return this.prisma.group.create({ data: dto as any, include: { branch: true, teacher: true } });
  }

  async update(id: string, dto: UpdateGroupDto) {
    await this.findOne(id);
    return this.prisma.group.update({ where: { id }, data: dto as any, include: { branch: true, teacher: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.group.delete({ where: { id } });
    return { message: 'Group deleted' };
  }
}
