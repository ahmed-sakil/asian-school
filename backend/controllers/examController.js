const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- 1. ADMIN: Create Exam (Using text inputs like "Class 9", "Section A") ---
exports.createExam = async (req, res) => {
  try {
    const { title, date, totalMarks, classLevel, sectionName, subjectCode } = req.body;

    // Find the link between Section and Subject
    const subjectClass = await prisma.subjectClass.findFirst({
      where: {
        course: { code: subjectCode },
        section: { 
          classLevel: parseInt(classLevel), 
          sectionName: sectionName,
          academicYearId: 'YEAR-2025' 
        }
      }
    });

    if (!subjectClass) {
      return res.status(404).json({ message: "Subject not assigned to this section yet." });
    }

    const exam = await prisma.assessment.create({
      data: {
        title,
        category: 'FIRST_TERM', // Default for Admin creation
        totalMarks: parseInt(totalMarks),
        examDate: new Date(date),
        subjectClassId: subjectClass.id
      }
    });

    res.json({ message: "Exam Scheduled!", exam });
  } catch (error) {
    res.status(500).json({ message: "Failed to create exam" });
  }
};

// --- 2. TEACHER: Get List of Exams (For a specific Subject Class) ---
exports.getExamsBySubjectClass = async (req, res) => {
  try {
    const { subjectClassId } = req.params;
    
    // 1. Get the Exams with a Count of how many marks are entered
    const exams = await prisma.assessment.findMany({
      where: { subjectClassId: subjectClassId },
      include: {
        _count: { select: { marks: true } } // <--- This counts the marks
      },
      orderBy: { examDate: 'desc' }
    });
    
    // 2. Get the Header Info (Subject Name, Class, Total Students)
    const subjectDetails = await prisma.subjectClass.findUnique({
      where: { id: subjectClassId },
      include: {
        course: true,
        section: {
          include: {
            _count: { select: { enrollments: true } } // <--- This counts total students
          }
        }
      }
    });
    
    res.json({ exams, subjectDetails }); // Send both back
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams" });
  }
};

// --- 3. TEACHER: Create Exam Direct (Simpler, using ID) ---
exports.createExamDirect = async (req, res) => {
  try {
    const { title, category, totalMarks, date, subjectClassId } = req.body;

    const exam = await prisma.assessment.create({
      data: {
        title,
        category,
        totalMarks: parseInt(totalMarks),
        examDate: new Date(date),
        subjectClassId: subjectClassId
      }
    });
    
    res.json({ message: "Exam Created Successfully!", exam });
  } catch (error) {
    res.status(500).json({ message: "Create failed" });
  }
};

// --- 4. MARKS SHEET: Get Students + Existing Marks ---
exports.getMarksSheet = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Get Exam details
    const exam = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { subjectClass: { include: { section: true, course: true } } }
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // Get Students in that Section
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: { some: { sectionId: exam.subjectClass.sectionId } }
      },
      select: { id: true, fullName: true, schoolId: true },
      orderBy: { schoolId: 'asc' }
    });

    // Get Existing Marks
    const existingMarks = await prisma.mark.findMany({
      where: { assessmentId }
    });

    // Combine them
    const sheet = students.map(student => {
      const markEntry = existingMarks.find(m => m.studentId === student.id);
      return {
        studentId: student.id,
        name: student.fullName,
        schoolId: student.schoolId,
        obtainedMark: markEntry ? markEntry.obtainedMark : '', 
      };
    });

    res.json({ exam, sheet });

  } catch (error) {
    res.status(500).json({ message: "Error loading sheet" });
  }
};

// --- 5. SUBMIT MARKS ---
exports.submitMarks = async (req, res) => {
  try {
    const { assessmentId, marks } = req.body; 

    await prisma.$transaction(
      marks.map(entry => 
        prisma.mark.upsert({
          where: {
            assessmentId_studentId: {
              assessmentId,
              studentId: entry.studentId
            }
          },
          update: { obtainedMark: entry.obtainedMark },
          create: {
            assessmentId,
            studentId: entry.studentId,
            obtainedMark: entry.obtainedMark
          }
        })
      )
    );

    res.json({ message: "Marks Saved! ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save marks" });
  }
};


// --- 7. STUDENT: Get My Subjects (For Dropdown) ---
exports.getStudentSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Find Student's Section
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { section: true },
          take: 1
        }
      }
    });

    if (!student || !student.enrollments[0]) {
      return res.status(404).json({ message: "Student not enrolled in any section" });
    }

    const sectionId = student.enrollments[0].sectionId;

    // 2. Find Subjects assigned to this Section
    const subjects = await prisma.subjectClass.findMany({
      where: { sectionId },
      include: { course: true }
    });

    res.json(subjects); // Returns [{ id: 'subjectClassId', course: { name: 'Math' } }]

  } catch (error) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

// --- 8. STUDENT: Get Live Marks (Specific Subject) ---
exports.getLiveMarks = async (req, res) => {
  try {
    const { studentId, subjectClassId } = req.query;

    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        assessment: { subjectClassId } // Filter by specific subject
      },
      include: { assessment: true },
      orderBy: { assessment: { examDate: 'desc' } }
    });

    res.json(marks);

  } catch (error) {
    res.status(500).json({ message: "Error fetching marks" });
  }
};

// --- 9. STUDENT: Final Result & Rank (Consolidated) ---
exports.getFinalResult = async (req, res) => {
  try {
    const { studentId } = req.query;

    // A. Get Final Exam Marks for this student
    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        assessment: { category: 'FINAL_EXAM' }
      },
      include: {
        assessment: {
          include: { subjectClass: { include: { course: true } } }
        }
      }
    });

    if (marks.length === 0) return res.json({ found: false });

    // B. Calculate My Total
    const myTotal = marks.reduce((sum, m) => sum + Number(m.obtainedMark), 0);

    // C. Calculate Rank (Serial) 🏆
    // We need to sum final marks for ALL students in this section to find my position
    // 1. Get the section ID
    const sectionId = marks[0].assessment.subjectClass.sectionId;

    // 2. Get all marks for this section's final exams
    const allClassMarks = await prisma.mark.findMany({
      where: {
        assessment: { 
          category: 'FINAL_EXAM',
          subjectClass: { sectionId: sectionId }
        }
      }
    });

    // 3. Group by student and sum totals
    const studentTotals = {};
    allClassMarks.forEach(m => {
      if (!studentTotals[m.studentId]) studentTotals[m.studentId] = 0;
      studentTotals[m.studentId] += Number(m.obtainedMark);
    });

    // 4. Sort scores descending
    const sortedScores = Object.values(studentTotals).sort((a, b) => b - a);
    
    // 5. Find my rank (Index + 1)
    const myRank = sortedScores.indexOf(myTotal) + 1;

    // D. Format Report
    const report = marks.map(m => ({
      subject: m.assessment.subjectClass.course.name,
      total: m.assessment.totalMarks,
      obtained: Number(m.obtainedMark),
      grade: calculateGrade(Number(m.obtainedMark), m.assessment.totalMarks)
    }));

    // Calculate Average GPA (Simple version)
    const percentage = (myTotal / marks.reduce((s, m) => s + m.assessment.totalMarks, 0)) * 100;

    res.json({
      found: true,
      report,
      summary: {
        grandTotal: myTotal,
        percentage: percentage.toFixed(2),
        rank: myRank
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating final result" });
  }
};

// Reuse the helper function from before
function calculateGrade(obtained, total) {
  const percentage = (obtained / total) * 100;
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'A-';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}