import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private wsGateway: WebsocketGateway,
  ) {}

  async findAll(userId: string, query: { page?: number; limit?: number; unread?: boolean }) {
    const page = Math.max(1, parseInt(query.page as any) || 1);
    const limit = Math.min(50, parseInt(query.limit as any) || 20);
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (query.unread) where.read = false;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), unreadCount };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }

  async create(data: { userId?: string; title: string; message?: string; type?: string; link?: string; branchId?: string }) {
    const notification = await this.prisma.notification.create({
      data: { userId: data.userId, title: data.title, message: data.message, type: data.type || 'info', link: data.link },
    });

    if (data.userId) {
      this.wsGateway.emitToUser(data.userId, 'notification', notification);
    } else if (data.branchId) {
      this.wsGateway.emitToBranch(data.branchId, 'notification', notification);
    } else {
      this.wsGateway.broadcast('notification', notification);
    }

    return notification;
  }

  async sendToRole(role: string, title: string, message?: string, link?: string) {
    const users = await this.prisma.user.findMany({ where: { role, isActive: true }, select: { id: true } });
    const notifications = await this.prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title, message, type: 'info', link })),
    });

    for (const user of users) {
      this.wsGateway.emitToUser(user.id, 'notification', { title, message, link, type: 'info' });
    }

    return { count: notifications.count };
  }
}
