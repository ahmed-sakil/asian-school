const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAdminStats = async (req, res) => {
  try {
    // 1. Count Active Students & Teachers
    const studentCount = await prisma.user.count({ 
      where: { role: 'STUDENT', isActive: true } 
    });
    
    const teacherCount = await prisma.user.count({ 
      where: { role: 'TEACHER', isActive: true } 
    });

    // 2. Calculate Financials
    // Revenue = Sum of all PAID bills
    const paidFees = await prisma.studentFee.findMany({
      where: { status: 'PAID' },
      include: { feeStructure: true }
    });
    
    // Pending = Sum of all PENDING bills
    const pendingFees = await prisma.studentFee.findMany({
      where: { status: 'PENDING' },
      include: { feeStructure: true }
    });

    // Math: Sum up the amounts
    const totalRevenue = paidFees.reduce((sum, fee) => {
      return sum + Number(fee.feeStructure.amount);
    }, 0);

    const pendingDues = pendingFees.reduce((sum, fee) => {
      return sum + Number(fee.feeStructure.amount);
    }, 0);

    // 3. Send back the results
    res.json({
      students: studentCount,
      teachers: teacherCount,
      revenue: totalRevenue,
      pending: pendingDues
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};