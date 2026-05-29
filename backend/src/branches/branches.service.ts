import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.branch.findMany({ skip, take: limit, include: { manager: true, _count: { select: { users: true, leads: true, groups: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.branch.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id }, include: { manager: true, users: true, groups: true } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return this.prisma.branch.create({ data: dto, include: { manager: true } });
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: dto, include: { manager: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.branch.delete({ where: { id } });
    return { message: 'Branch deleted' };
  }
}
