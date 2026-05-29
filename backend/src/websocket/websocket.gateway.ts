import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  branchId?: string | null;
}

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(WebsocketGateway.name);
  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.userRole = user.role;
      client.branchId = user.branchId;

      client.join(`user:${user.id}`);
      if (user.branchId) client.join(`branch:${user.branchId}`);
      if (user.role === 'admin') client.join('admin');

      this.addOnlineUser(user.id);
      this.server.emit('users:online', this.getOnlineUserIds());

      this.logger.log(`WS connected: ${user.email} (${user.role})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.removeOnlineUser(client.userId);
      this.server.emit('users:online', this.getOnlineUserIds());
      this.logger.log(`WS disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('subscribe:entity')
  handleSubscribeEntity(client: AuthenticatedSocket, entityId: string) {
    client.join(`entity:${entityId}`);
  }

  @SubscribeMessage('unsubscribe:entity')
  handleUnsubscribeEntity(client: AuthenticatedSocket, entityId: string) {
    client.leave(`entity:${entityId}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToBranch(branchId: string, event: string, data: any) {
    this.server.to(`branch:${branchId}`).emit(event, data);
  }

  emitToAdmins(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }

  emitToEntity(entityId: string, event: string, data: any) {
    this.server.to(`entity:${entityId}`).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  private addOnlineUser(userId: string) {
    if (!this.onlineUsers.has('all')) this.onlineUsers.set('all', new Set());
    this.onlineUsers.get('all')!.add(userId);
  }

  private removeOnlineUser(userId: string) {
    this.onlineUsers.get('all')?.delete(userId);
  }

  private getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsers.get('all') || []);
  }
}
