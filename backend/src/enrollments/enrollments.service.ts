import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.groupId) where.groupId = query.groupId;
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({ where, skip, take: limit, include: { user: true, group: true }, orderBy: { enrolledAt: 'desc' } }),
      this.prisma.enrollment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id }, include: { user: true, group: true } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async create(dto: CreateEnrollmentDto) {
    const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.enrolledCount >= group.capacity) throw new BadRequestException('Group is full');

    const existing = await this.prisma.enrollment.findFirst({ where: { userId: dto.userId, groupId: dto.groupId } });
    if (existing) throw new ConflictException('User already enrolled in this group');

    const enrollment = await this.prisma.enrollment.create({
      data: { userId: dto.userId, groupId: dto.groupId, status: dto.status || 'active' },
      include: { user: true, group: true },
    });

    await this.prisma.group.update({ where: { id: dto.groupId }, data: { enrolledCount: { increment: 1 } } });
    return enrollment;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.enrollment.update({ where: { id }, data: { status }, include: { user: true, group: true } });
  }

  async remove(id: string) {
    const enrollment = await this.findOne(id);
    await this.prisma.enrollment.delete({ where: { id } });
    if (enrollment.groupId) {
      await this.prisma.group.update({ where: { id: enrollment.groupId }, data: { enrolledCount: { decrement: 1 } } });
    }
    return { message: 'Enrollment removed' };
  }
}
