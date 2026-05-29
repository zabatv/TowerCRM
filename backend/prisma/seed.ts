import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const branch1 = await prisma.branch.create({
    data: { name: 'Main Branch', address: '123 Main St, New York, NY', phone: '+1-212-555-0100' },
  });
  const branch2 = await prisma.branch.create({
    data: { name: 'Downtown Branch', address: '456 Broadway, New York, NY', phone: '+1-212-555-0200' },
  });

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@towercrm.com', passwordHash, role: 'admin', branchId: branch1.id },
  });
  const manager = await prisma.user.create({
    data: { name: 'Jane Manager', email: 'manager@towercrm.com', passwordHash, role: 'manager', branchId: branch1.id },
  });
  const teacher1 = await prisma.user.create({
    data: { name: 'John Teacher', email: 'teacher@towercrm.com', passwordHash, role: 'teacher', branchId: branch1.id },
  });
  const teacher2 = await prisma.user.create({
    data: { name: 'Sarah Sales', email: 'sales@towercrm.com', passwordHash, role: 'sales', branchId: branch2.id },
  });

  await prisma.branch.update({ where: { id: branch1.id }, data: { managerId: manager.id } });

  const leadData = [
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-212-555-1001', source: 'website', status: 'new', assignedTo: teacher2.id, branchId: branch1.id },
    { name: 'Bob Williams', email: 'bob@example.com', phone: '+1-212-555-1002', source: 'referral', status: 'contacted', assignedTo: teacher2.id, branchId: branch1.id },
    { name: 'Carol Davis', email: 'carol@example.com', phone: '+1-212-555-1003', source: 'social', status: 'new', branchId: branch2.id },
    { name: 'David Brown', email: 'david@example.com', phone: '+1-212-555-1004', source: 'call', status: 'converted', assignedTo: teacher2.id, branchId: branch2.id },
    { name: 'Eve Wilson', email: 'eve@example.com', phone: '+1-212-555-1005', source: 'website', status: 'lost', assignedTo: teacher2.id, branchId: branch1.id },
    { name: 'Frank Miller', email: 'frank@example.com', phone: '+1-212-555-1006', source: 'other', status: 'new', branchId: branch2.id },
  ];
  for (const ld of leadData) {
    await prisma.lead.create({ data: ld });
  }

  const group1 = await prisma.group.create({
    data: { name: 'English Beginner A1', course: 'English', level: 'A1', branchId: branch1.id, teacherId: teacher1.id, schedule: '{"days":["Mon","Wed","Fri"],"time":"10:00","duration":60}', capacity: 12, enrolledCount: 0 },
  });
  const group2 = await prisma.group.create({
    data: { name: 'Spanish Intermediate B1', course: 'Spanish', level: 'B1', branchId: branch2.id, teacherId: teacher2.id, schedule: '{"days":["Tue","Thu"],"time":"14:00","duration":90}', capacity: 10, enrolledCount: 0 },
  });

  const now = new Date();
  const lessonDates = [
    new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
  ];

  await prisma.lesson.create({
    data: { title: 'English A1 - Lesson 1', description: 'Introduction and alphabet', dateTime: lessonDates[0], duration: 60, teacherId: teacher1.id, groupId: group1.id, branchId: branch1.id, status: 'scheduled' },
  });
  await prisma.lesson.create({
    data: { title: 'English A1 - Lesson 2', description: 'Basic greetings', dateTime: lessonDates[1], duration: 60, teacherId: teacher1.id, groupId: group1.id, branchId: branch1.id, status: 'scheduled' },
  });
  await prisma.lesson.create({
    data: { title: 'Spanish B1 - Lesson 1', description: 'Present tense review', dateTime: lessonDates[2], duration: 90, teacherId: teacher2.id, groupId: group2.id, branchId: branch2.id, status: 'scheduled' },
  });
  await prisma.lesson.create({
    data: { title: 'Spanish B1 - Lesson 2', description: 'Past tense introduction', dateTime: lessonDates[3], duration: 90, teacherId: teacher2.id, groupId: group2.id, branchId: branch2.id, status: 'scheduled' },
  });

  console.log('Seed data created successfully!');
  console.log('Login credentials:');
  console.log('  admin@towercrm.com / password123 (admin)');
  console.log('  manager@towercrm.com / password123 (manager)');
  console.log('  teacher@towercrm.com / password123 (teacher)');
  console.log('  sales@towercrm.com / password123 (sales)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
