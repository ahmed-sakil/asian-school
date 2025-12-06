const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. CREATE FEE (With Target Section Logic)
exports.createFee = async (req, res) => {
  try {
    const { name, amount, classLevel, sectionName, dueDate } = req.body;

    // Create the definition
    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        amount,
        classLevel: parseInt(classLevel),
        targetSection: sectionName, // Stores "A" or "ALL"
        academicYearId: 'YEAR-2025'
      }
    });

    // Find Target Students
    let enrollmentFilter = {
      section: { 
        classLevel: parseInt(classLevel),
        academicYearId: 'YEAR-2025'
      }
    };

    if (sectionName && sectionName !== 'ALL') {
      enrollmentFilter.section.sectionName = sectionName;
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true, enrollments: { some: enrollmentFilter } }
    });

    if (students.length === 0) {
      return res.json({ message: "Fee created, but NO students found to bill.", feeStructure });
    }

    // Generate Bills
    const bills = students.map(student => ({
      studentId: student.id,
      feeStructureId: feeStructure.id,
      dueDate: new Date(dueDate),
      status: 'PENDING'
    }));

    await prisma.studentFee.createMany({ data: bills });

    res.json({ 
      message: `Success! Assigned "${name}" to ${students.length} students.`,
      target: sectionName === 'ALL' ? `All Class ${classLevel}` : `Class ${classLevel}-${sectionName}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating fee" });
  }
};

// 2. GET STUDENT LEDGER (For Profile & Cashier)
exports.getStudentLedger = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await prisma.studentFee.findMany({
      where: { studentId },
      include: { feeStructure: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ledger" });
  }
};

// 3. PAY FEE (Collect Money)
exports.payFee = async (req, res) => { // <--- MAKE SURE THIS EXPORT NAME MATCHES ROUTE
  // Note: In previous steps I might have called this 'markAsPaid'. 
  // We will standardize on 'payFee' now.
  try {
    const { feeId } = req.body;
    await prisma.studentFee.update({
      where: { id: feeId },
      data: { status: 'PAID', paidDate: new Date() }
    });
    res.json({ message: "Payment Recorded!" });
  } catch (error) {
    res.status(500).json({ message: "Payment failed" });
  }
};

// --- NEW FUNCTIONS FOR MANAGER LIST ---

// 4. GET ALL FEES (List)
exports.getAllFeeStructures = async (req, res) => {
  try {
    const fees = await prisma.feeStructure.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { studentFees: true } }
      }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching list" });
  }
};

// 5. DELETE FEE
exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for paid bills first
    const hasPaid = await prisma.studentFee.findFirst({
      where: { feeStructureId: id, status: 'PAID' }
    });

    if (hasPaid) {
      return res.status(400).json({ message: "Cannot delete: Some students have already paid!" });
    }

    await prisma.feeStructure.delete({ where: { id } });
    res.json({ message: "Fee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// 6. UPDATE FEE (With Safety Lock 🔒)
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;

    // 1. Get the current version of the fee from DB
    const currentFee = await prisma.feeStructure.findUnique({
      where: { id }
    });

    if (!currentFee) return res.status(404).json({ message: "Fee not found" });

    // 2. Check if the Amount is changing
    // (We convert to Number/String to compare, because Decimal types can be tricky)
    const isAmountChanging = Number(currentFee.amount) !== Number(amount);

    if (isAmountChanging) {
      // 3. If Amount is changing, check if ANYONE has paid yet
      const hasPaid = await prisma.studentFee.findFirst({
        where: { feeStructureId: id, status: 'PAID' }
      });

      if (hasPaid) {
        return res.status(400).json({ 
          message: "⛔ Cannot change Amount: Some students have already paid this fee. You must create a new fee for the difference." 
        });
      }
    }

    // 4. If safe, proceed with update
    await prisma.feeStructure.update({
      where: { id },
      data: { name, amount } // Name change is always allowed
    });

    res.json({ message: "Fee updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};