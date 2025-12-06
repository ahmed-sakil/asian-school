const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Create a Generic Course (e.g. "Math for Class 9")
exports.createCourse = async (req, res) => {
  try {
    const { name, code, classLevel } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        name,      // "Mathematics"
        code,      // "MATH-09"
        classLevel: parseInt(classLevel)
      }
    });

    res.json({ message: "Course Created Successfully", course: newCourse });
  } catch (error) {
    // Unique constraint error (Code already exists)
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Course Code already exists!" });
    }
    res.status(500).json({ message: "Failed to create course" });
  }
};

// 2. Fetch All Courses (For the list)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { classLevel: 'asc' }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// 3. Assign Course to a Section & Teacher
exports.assignSubjectToSection = async (req, res) => {
  try {
    const { courseId, classLevel, sectionName, teacherId } = req.body;

    // A. Find the Section ID first
    const section = await prisma.section.findUnique({
      where: {
        academicYearId_classLevel_sectionName: {
          academicYearId: 'YEAR-2025',
          classLevel: parseInt(classLevel),
          sectionName: sectionName
        }
      }
    });

    if (!section) return res.status(404).json({ message: "Section not found." });

    // B. Create or Update the Link (SubjectClass)
    // "Upsert" means: If this section already has this subject, just update the teacher.
    // If not, create the link.
    const assignment = await prisma.subjectClass.upsert({
      where: {
        sectionId_courseId: {
          sectionId: section.id,
          courseId: courseId
        }
      },
      update: { teacherId: teacherId }, // Just change teacher if exists
      create: {
        sectionId: section.id,
        courseId: courseId,
        teacherId: teacherId
      }
    });

    res.json({ message: "Subject Assigned Successfully! ✅", assignment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Assignment failed." });
  }
};

// 4. Get Assignments (Who teaches what?)
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.subjectClass.findMany({
      include: {
        course: true,
        section: true,
        teacher: { select: { fullName: true } }
      },
      orderBy: { section: { classLevel: 'asc' } }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments" });
  }
};

// --- NEW: UPDATE COURSE ---
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body; // We typically don't change classLevel of existing course to avoid confusion

    await prisma.course.update({
      where: { id },
      data: { name, code }
    });
    res.json({ message: "Course Updated! ✅" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// --- NEW: DELETE COURSE ---
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety Check: Is this course currently assigned to a section?
    const isAssigned = await prisma.subjectClass.findFirst({
      where: { courseId: id }
    });

    if (isAssigned) {
      return res.status(400).json({ message: "Cannot delete: This subject is currently assigned to a class." });
    }

    await prisma.course.delete({ where: { id } });
    res.json({ message: "Course Deleted! 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- GET TEACHER'S ASSIGNMENTS (My Classes) ---
exports.getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const assignments = await prisma.subjectClass.findMany({
      where: { teacherId: teacherId },
      include: {
        course: true,
        section: true
      },
      orderBy: { section: { classLevel: 'asc' } }
    });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments" });
  }
};