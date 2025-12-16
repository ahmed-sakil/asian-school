const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

exports.createStudent = async (req, res) => {
  try {
    const { schoolId, fullName, email, classLevel, sectionName } = req.body;

    // 🔍 Debug Log
    console.log("Received Data:", { schoolId, fullName, classLevel, sectionName });

    // 1. Validation
    if (!classLevel || isNaN(parseInt(classLevel))) {
      return res.status(400).json({ message: "Invalid Class Level (6-10)." });
    }
    if (!sectionName) {
      return res.status(400).json({ message: "Section Name is required." });
    }

    // 2. Check duplicates
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ schoolId }, { email }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: "School ID or Email already exists!" });
    }

    // 3. Find Section
    const section = await prisma.section.findUnique({
      where: {
        academicYearId_classLevel_sectionName: {
          academicYearId: 'YEAR-2025',
          classLevel: parseInt(classLevel),
          sectionName: sectionName
        }
      }
    });

    if (!section) {
      return res.status(400).json({ message: `Class ${classLevel}-${sectionName} not found.` });
    }

    // 4. Hash & Create
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const result = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          schoolId,
          email,
          fullName,
          passwordHash: hashedPassword,
          role: "STUDENT",
          isActive: true
        }
      });

      await prisma.sectionEnrollment.create({
        data: {
          studentId: newUser.id,
          sectionId: section.id,
          rollNumber: null 
        }
      });

      return newUser;
    });

    res.status(201).json({
      message: "Student admitted successfully! 🎓",
      student: { id: result.id, fullName: result.fullName }
    });

  } catch (error) {
    console.error("Admissions Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- GET STUDENTS (With Filters) ---
exports.getStudents = async (req, res) => {
  try {
    const { classLevel, sectionName } = req.query;

    let query = {
      role: 'STUDENT',
      isActive: true
    };

    if (classLevel && sectionName) {
      query.enrollments = {
        some: { 
          section: {
            classLevel: parseInt(classLevel),
            sectionName: sectionName,
            academicYearId: 'YEAR-2025' 
          }
        }
      };
    }

    const students = await prisma.user.findMany({
      where: query,
      select: {
        id: true,
        schoolId: true,
        fullName: true,
        email: true,
        enrollments: {
          where: { section: { academicYearId: 'YEAR-2025' } },
          include: { section: true }
        }
      },
      orderBy: { schoolId: 'asc' }
    });

    res.json(students);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// --- GET SINGLE STUDENT PROFILE ---
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id: id },
      include: {
        enrollments: { include: { section: true } },
        studentFees: { 
            where: { status: 'PENDING' }, 
            include: { feeStructure: true } 
        },
        // 👇 TEMPORARY: Fetch ALL results to see what exists
        finalResults: { include: { academicYear: true } } 
      }
    });

    // 👇 ADD THIS DEBUG LOG
    console.log("DEBUG: Final Results found:", student?.finalResults);

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- FIND STUDENT BY SCHOOL ID ---
exports.getStudentBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const student = await prisma.user.findUnique({
      where: { schoolId: schoolId }, 
      select: {
        id: true, 
        fullName: true,
        schoolId: true,
        role: true,
        enrollments: {
          include: { section: true },
          orderBy: { section: { academicYearId: 'desc' } },
          take: 1
        }
      }
    });

    if (!student) return res.status(404).json({ message: "Student ID not found" });
    res.json(student);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- GET ALL TEACHERS (For Dropdowns) ---
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER', isActive: true },
      select: { id: true, fullName: true, schoolId: true },
      orderBy: { fullName: 'asc' }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
};

// --- UPDATE PROFILE (Change Password) ---
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, currentPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    res.json({ message: "Password updated successfully! 🔒" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// --- 👇 NEW: GET STAFF LIST (Admin & Teachers) ---
exports.getStaffList = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'TEACHER'] }
      },
      select: {
        id: true,
        schoolId: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to load staff list" });
  }
};

// --- 👇 NEW: DELETE USER ---
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: id } }); // Note: Ensure ID type matches your DB (Int vs String/UUID)
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};