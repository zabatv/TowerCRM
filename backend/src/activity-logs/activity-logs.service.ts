import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; entityType?: string; userId?: string }) {
    const page = Math.max(1, parseInt(query.page as any) || 1);
    const limit = Math.min(100, parseInt(query.limit as any) || 20);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.userId) where.userId = query.userId;

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({ where, skip, take: limit, include: { user: true }, orderBy: { timestamp: 'desc' } }),
      this.prisma.activityLog.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
