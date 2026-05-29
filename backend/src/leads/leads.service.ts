import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway,
    private notifications: NotificationsService,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.branchId) where.branchId = query.branchId;
    if (query.search) where.OR = [{ name: { contains: query.search } }, { email: { contains: query.search } }, { phone: { contains: query.search } }];
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const orderBy: any = {};
    if (query.sortBy) orderBy[query.sortBy] = query.sortOrder || 'desc';
    else orderBy.createdAt = 'desc';

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take: limit, include: { assigned: true, branch: true }, orderBy }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: { assigned: true, branch: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: dto as any,
      include: { assigned: true, branch: true },
    });
    await this.logActivity('Lead', lead.id, lead.assignedTo || '', 'created', `Lead ${lead.name} created`);

    this.wsGateway.broadcast('lead:created', lead);
    if (lead.assignedTo) {
      this.wsGateway.emitToUser(lead.assignedTo, 'lead:created', lead);
      this.notifications.create({ userId: lead.assignedTo, title: 'New lead assigned', message: `Lead "${lead.name}" has been assigned to you`, type: 'lead', link: `/leads/${lead.id}` });
    }
    if (lead.branchId) this.wsGateway.emitToBranch(lead.branchId, 'lead:created', lead);

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const old = await this.findOne(id);
    const lead = await this.prisma.lead.update({
      where: { id },
      data: dto as any,
      include: { assigned: true, branch: true },
    });
    await this.logActivity('Lead', id, lead.assignedTo || '', 'updated', `Lead ${lead.name} updated`);

    this.wsGateway.broadcast('lead:updated', lead);
    if (lead.assignedTo) this.wsGateway.emitToUser(lead.assignedTo, 'lead:updated', lead);
    if (lead.branchId) this.wsGateway.emitToBranch(lead.branchId, 'lead:updated', lead);

    if (dto.assignedTo && dto.assignedTo !== old.assignedTo) {
      this.notifications.create({ userId: dto.assignedTo, title: 'Lead assigned', message: `Lead "${lead.name}" has been assigned to you`, type: 'lead', link: `/leads/${lead.id}` });
    }
    if (dto.status && dto.status !== old.status) {
      this.notifications.create({ userId: lead.assignedTo || '', title: `Lead status changed to ${dto.status}`, message: `Lead "${lead.name}" status: ${dto.status}`, type: 'lead', link: `/leads/${lead.id}` });
    }

    return lead;
  }

  async convertToStudent(id: string, userId?: string) {
    const lead = await this.findOne(id);
    if (lead.status === 'converted') throw new BadRequestException('Lead already converted');

    const studentUser = userId
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : lead.email ? await this.prisma.user.findUnique({ where: { email: lead.email } }) : null;

    if (!studentUser && lead.email) {
      const newStudent = await this.prisma.user.create({
        data: { name: lead.name, email: lead.email, passwordHash: '$2a$10$placeholder', role: 'teacher', branchId: lead.branchId },
      });
      const updatedLead = await this.prisma.lead.update({
        where: { id }, data: { status: 'converted' }, include: { assigned: true, branch: true },
      });
      await this.logActivity('Lead', id, lead.assignedTo || '', 'converted', `Lead ${lead.name} converted to student`);
      this.wsGateway.broadcast('lead:updated', updatedLead);
      this.wsGateway.broadcast('lead:converted', { lead: updatedLead, student: newStudent });
      return { lead: updatedLead, student: newStudent };
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id }, data: { status: 'converted' }, include: { assigned: true, branch: true },
    });
    await this.logActivity('Lead', id, lead.assignedTo || '', 'converted', `Lead ${lead.name} converted to student`);
    this.wsGateway.broadcast('lead:updated', updatedLead);
    this.wsGateway.broadcast('lead:converted', { lead: updatedLead, student: studentUser });

    return { lead: updatedLead, student: studentUser || null };
  }

  async bulkAssign(ids: string[], assignedTo: string) {
    await this.prisma.lead.updateMany({ where: { id: { in: ids } }, data: { assignedTo } });
    await this.logActivity('Lead', ids.join(','), assignedTo, 'bulk-assigned', `Leads [${ids.join(',')}] assigned to user ${assignedTo}`);

    this.wsGateway.emitToUser(assignedTo, 'leads:bulk-assigned', { ids, count: ids.length });
    this.notifications.create({ userId: assignedTo, title: `${ids.length} leads assigned`, message: `${ids.length} leads have been assigned to you`, type: 'lead' });
    this.wsGateway.broadcast('leads:bulk-assigned', { ids, assignedTo });

    return { message: `${ids.length} leads assigned`, count: ids.length };
  }

  async bulkDelete(ids: string[]) {
    await this.prisma.lead.deleteMany({ where: { id: { in: ids } } });
    this.wsGateway.broadcast('leads:bulk-deleted', { ids, count: ids.length });
    return { message: `${ids.length} leads deleted`, count: ids.length };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lead.delete({ where: { id } });
    this.wsGateway.broadcast('lead:deleted', { id });
    return { message: 'Lead deleted' };
  }

  private async logActivity(entityType: string, entityId: string, userId: string, action: string, details?: string) {
    await this.prisma.activityLog.create({ data: { entityType, entityId, userId, action, details } }).catch(() => {});
  }
}
