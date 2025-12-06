const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- 1. TEACHER: Get Attendance Sheet (List of students) ---
exports.getAttendanceSheet = async (req, res) => {
  try {
    const { date, classLevel, sectionName } = req.query;

    // A. Find the Section ID
    const section = await prisma.section.findUnique({
      where: {
        academicYearId_classLevel_sectionName: {
          academicYearId: 'YEAR-2025',
          classLevel: parseInt(classLevel),
          sectionName: sectionName
        }
      }
    });

    if (!section) return res.status(404).json({ message: "Section not found" });

    // B. Get all students in this section
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: { some: { sectionId: section.id } }
      },
      select: { id: true, fullName: true, schoolId: true },
      orderBy: { schoolId: 'asc' }
    });

    // C. Get existing attendance for this specific date (if any)
    const targetDate = new Date(date);
    const existingRecords = await prisma.dailyAttendance.findMany({
      where: {
        sectionId: section.id,
        date: targetDate
      }
    });

    // D. Merge Data: Combine Student List with their Attendance Status
    const sheet = students.map(student => {
      const record = existingRecords.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        name: student.fullName,
        schoolId: student.schoolId,
        // If record exists, use that. If not, default to FALSE (Absent) or TRUE depending on policy.
        isPresent: record ? record.isPresent : false, 
        status: record ? 'Saved' : 'Not Taken'
      };
    });

    res.json({ sectionId: section.id, sheet });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching attendance" });
  }
};

// --- 2. TEACHER: Submit Attendance ---
exports.submitAttendance = async (req, res) => {
  try {
    const { sectionId, date, records } = req.body; 
    // records = [{ studentId: "...", isPresent: true }, ...]

    const targetDate = new Date(date);

    // Use a Transaction to save all at once (Fast & Safe)
    await prisma.$transaction(
      records.map(record => 
        prisma.dailyAttendance.upsert({
          where: {
            studentId_sectionId_date: {
              studentId: record.studentId,
              sectionId: sectionId,
              date: targetDate
            }
          },
          update: { isPresent: record.isPresent },
          create: {
            studentId: record.studentId,
            sectionId: sectionId,
            date: targetDate,
            isPresent: record.isPresent
          }
        })
      )
    );

    res.json({ message: "Attendance saved successfully! ✅" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save attendance" });
  }
};

// --- 3. STUDENT: Get My Stats ---
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all records for this student
    const records = await prisma.dailyAttendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });

    const totalDays = records.length;
    const presentDays = records.filter(r => r.isPresent).length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    res.json({
      totalDays,
      presentDays,
      absentDays,
      percentage,
      history: records
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// --- 4. TEACHER: Get Monthly Report 📊 ---
exports.getMonthlyReport = async (req, res) => {
  try {
    const { classLevel, sectionName, month, year } = req.query; // month is 0-indexed (0=Jan, 11=Dec) OR 1-indexed. Let's use 1-12.

    // 1. Find Section
    const section = await prisma.section.findUnique({
      where: {
        academicYearId_classLevel_sectionName: {
          academicYearId: 'YEAR-2025',
          classLevel: parseInt(classLevel),
          sectionName: sectionName
        }
      }
    });

    if (!section) return res.status(404).json({ message: "Section not found" });

    // 2. Get Students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', enrollments: { some: { sectionId: section.id } } },
      select: { id: true, fullName: true, schoolId: true },
      orderBy: { schoolId: 'asc' }
    });

    // 3. Calculate Date Range
    // Javascript months are 0-11 in Date constructor, but let's assume frontend sends 1-12
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0); // Last day of month

    // 4. Get Records
    const records = await prisma.dailyAttendance.findMany({
      where: {
        sectionId: section.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    res.json({ students, records });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating report" });
  }
};