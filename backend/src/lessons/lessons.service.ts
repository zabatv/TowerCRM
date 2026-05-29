import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.teacherId) where.teacherId = query.teacherId;
    if (query.groupId) where.groupId = query.groupId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.dateTime = {};
      if (query.dateFrom) where.dateTime.gte = new Date(query.dateFrom);
      if (query.dateTo) where.dateTime.lte = new Date(query.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({ where, skip, take: limit, include: { teacher: true, group: true, branch: true }, orderBy: { dateTime: 'asc' } }),
      this.prisma.lesson.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, include: { teacher: true, group: true, branch: true, attendance: { include: { user: true } } } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: { ...dto, dateTime: new Date(dto.dateTime) } as any,
      include: { teacher: true, group: true, branch: true },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dateTime) data.dateTime = new Date(dto.dateTime);
    return this.prisma.lesson.update({ where: { id }, data, include: { teacher: true, group: true, branch: true } });
  }

  async markAttendance(lessonId: string, attendance: Array<{ userId: string; status: string }>) {
    await this.findOne(lessonId);
    for (const record of attendance) {
      await this.prisma.attendance.upsert({
        where: { id: `${lessonId}_${record.userId}` },
        create: { lessonId, userId: record.userId, status: record.status },
        update: { status: record.status },
      });
    }
    return this.findOne(lessonId);
  }

  async getCalendar(query: { from?: string; to?: string; teacherId?: string }) {
    const where: any = {};
    if (query.from || query.to) {
      where.dateTime = {};
      if (query.from) where.dateTime.gte = new Date(query.from);
      if (query.to) where.dateTime.lte = new Date(query.to);
    }
    if (query.teacherId) where.teacherId = query.teacherId;
    return this.prisma.lesson.findMany({ where, include: { teacher: true, group: true, branch: true }, orderBy: { dateTime: 'asc' } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }
}
