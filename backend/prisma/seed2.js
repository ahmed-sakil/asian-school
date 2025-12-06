




  const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seeding Process...');

  // 1. Clean the database (Optional: helps during development)
  // await prisma.user.deleteMany(); 
  
  // 2. Create the Password Hash
  // We are setting the password to: "password123"
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 3. Create the Super Admin User
  const admin = await prisma.user.upsert({
    where: { schoolId: 'ADMIN-001' },
    update: {}, // If exists, do nothing
    create: {
      schoolId: 'ADMIN-001',
      email: 'admin@asianschool.com',
      passwordHash: hashedPassword,
      fullName: 'Super Admin',
      role: 'ADMIN',
      isActive: true
    },
  });

  console.log(`✅ Created Admin User: ${admin.fullName} (${admin.schoolId})`);
  console.log(`🔑 Password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });