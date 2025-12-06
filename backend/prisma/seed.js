const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seeding Process...');

  // 1. Create Academic Year
  const year2025 = await prisma.academicYear.upsert({
    where: { id: 'YEAR-2025' },
    update: {},
    create: {
      id: 'YEAR-2025',
      yearName: '2025',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true
    }
  });
  console.log('📅 Academic Year 2025 Created');

  // 2. Create Classes (6-10) and Sections (A, B, C)
  const classes = [6, 7, 8, 9, 10];
  const sections = ['A', 'B', 'C'];

  for (const classLevel of classes) {
    for (const sectionName of sections) {
      await prisma.section.upsert({
        where: {
          academicYearId_classLevel_sectionName: {
            academicYearId: year2025.id,
            classLevel: classLevel,
            sectionName: sectionName
          }
        },
        update: {},
        create: {
          academicYearId: year2025.id,
          classLevel: classLevel,
          sectionName: sectionName,
          roomNumber: `Room-${classLevel}${sectionName}`
        }
      });
    }
  }
  console.log('🏫 Classes 6-10 (Sections A, B, C) Created');

  // 3. Create Super Admin ONLY
  const salt = await bcrypt.genSalt(10);
  // Default password: 123456
  const hashedPassword = await bcrypt.hash('123456', salt);

  await prisma.user.upsert({
    where: { schoolId: 'ADMIN-001' },
    update: {},
    create: {
      schoolId: 'ADMIN-001',
      email: 'admin@asianschool.com',
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      role: 'ADMIN',
      isActive: true
    },
  });
  console.log('👤 Admin User Ready (ID: ADMIN-001 / Pass: password123)');
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });