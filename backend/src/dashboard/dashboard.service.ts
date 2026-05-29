import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalLeads, newLeads, contactedLeads, convertedLeads, lostLeads, totalUsers, totalGroups, totalLessons, totalBranches, upcomingLessons] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'new' } }),
      this.prisma.lead.count({ where: { status: 'contacted' } }),
      this.prisma.lead.count({ where: { status: 'converted' } }),
      this.prisma.lead.count({ where: { status: 'lost' } }),
      this.prisma.user.count(),
      this.prisma.group.count(),
      this.prisma.lesson.count(),
      this.prisma.branch.count(),
      this.prisma.lesson.findMany({ where: { dateTime: { gte: new Date() }, status: 'scheduled' }, take: 5, include: { teacher: true, group: true, branch: true }, orderBy: { dateTime: 'asc' } }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      leads: { total: totalLeads, new: newLeads, contacted: contactedLeads, converted: convertedLeads, lost: lostLeads, conversionRate },
      users: totalUsers,
      groups: totalGroups,
      lessons: totalLessons,
      branches: totalBranches,
      upcomingLessons,
    };
  }
}
