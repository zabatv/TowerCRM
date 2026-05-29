import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

async function seedIfEmpty(prisma: PrismaService) {
  const count = await prisma.user.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('password123', 10);

  const branch1 = await prisma.branch.create({
    data: { name: 'Main Branch', address: '123 Main St, New York, NY', phone: '+1-212-555-0100' },
  });
  const branch2 = await prisma.branch.create({
    data: { name: 'Downtown Branch', address: '456 Broadway, New York, NY', phone: '+1-212-555-0200' },
  });

  const manager = await prisma.user.create({
    data: { name: 'Jane Manager', email: 'manager@towercrm.com', passwordHash, role: 'manager', branchId: branch1.id },
  });
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@towercrm.com', passwordHash, role: 'admin', branchId: branch1.id },
  });
  await prisma.user.create({
    data: { name: 'John Teacher', email: 'teacher@towercrm.com', passwordHash, role: 'teacher', branchId: branch1.id },
  });
  await prisma.user.create({
    data: { name: 'Sarah Sales', email: 'sales@towercrm.com', passwordHash, role: 'sales', branchId: branch2.id },
  });

  await prisma.branch.update({ where: { id: branch1.id }, data: { managerId: manager.id } });

  const salesUser = await prisma.user.findFirst({ where: { role: 'sales' } });
  const leadData = [
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-212-555-1001', source: 'website', status: 'new', assignedTo: salesUser!.id, branchId: branch1.id },
    { name: 'Bob Williams', email: 'bob@example.com', phone: '+1-212-555-1002', source: 'referral', status: 'contacted', assignedTo: salesUser!.id, branchId: branch1.id },
    { name: 'Carol Davis', email: 'carol@example.com', phone: '+1-212-555-1003', source: 'social', status: 'new', branchId: branch2.id },
    { name: 'David Brown', email: 'david@example.com', phone: '+1-212-555-1004', source: 'call', status: 'converted', assignedTo: salesUser!.id, branchId: branch2.id },
    { name: 'Eve Wilson', email: 'eve@example.com', phone: '+1-212-555-1005', source: 'website', status: 'lost', assignedTo: salesUser!.id, branchId: branch1.id },
    { name: 'Frank Miller', email: 'frank@example.com', phone: '+1-212-555-1006', source: 'other', status: 'new', branchId: branch2.id },
  ];
  for (const ld of leadData) {
    await prisma.lead.create({ data: ld });
  }

  const teacher1 = await prisma.user.findFirst({ where: { role: 'teacher' } });
  const group1 = await prisma.group.create({
    data: { name: 'English Beginner A1', course: 'English', level: 'A1', branchId: branch1.id, teacherId: teacher1!.id, schedule: JSON.stringify({ days: ['Mon', 'Wed', 'Fri'], time: '10:00', duration: 60 }), capacity: 12 },
  });
  const group2 = await prisma.group.create({
    data: { name: 'Spanish Intermediate B1', course: 'Spanish', level: 'B1', branchId: branch2.id, teacherId: salesUser!.id, schedule: JSON.stringify({ days: ['Tue', 'Thu'], time: '14:00', duration: 90 }), capacity: 10 },
  });

  const now = new Date();
  await prisma.lesson.create({ data: { title: 'English A1 - Lesson 1', description: 'Introduction and alphabet', dateTime: new Date(now.getTime() + 86400000), duration: 60, teacherId: teacher1!.id, groupId: group1.id, branchId: branch1.id } });
  await prisma.lesson.create({ data: { title: 'English A1 - Lesson 2', description: 'Basic greetings', dateTime: new Date(now.getTime() + 172800000), duration: 60, teacherId: teacher1!.id, groupId: group1.id, branchId: branch1.id } });
  await prisma.lesson.create({ data: { title: 'Spanish B1 - Lesson 1', description: 'Present tense review', dateTime: new Date(now.getTime() + 259200000), duration: 90, teacherId: salesUser!.id, groupId: group2.id, branchId: branch2.id } });
  await prisma.lesson.create({ data: { title: 'Spanish B1 - Lesson 2', description: 'Past tense introduction', dateTime: new Date(now.getTime() + 345600000), duration: 90, teacherId: salesUser!.id, groupId: group2.id, branchId: branch2.id } });

  console.log('Database seeded with initial data');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', { exclude: ['health'] });

  const allowedOrigins = [
    'http://localhost:5173',
    'https://towercrm-frontend.onrender.com',
  ];
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) cb(null, true);
      else cb(new Error('CORS not allowed'));
    },
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('TowerCRM API')
    .setDescription('API documentation for TowerCRM - Course management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`TowerCRM API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);

  const prisma = app.get(PrismaService);
  await seedIfEmpty(prisma);
}
bootstrap();
