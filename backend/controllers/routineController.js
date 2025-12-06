const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Assign a Subject to a Slot (Upsert: Create or Update)
exports.updateSlot = async (req, res) => {
  try {
    const { sectionId, subjectClassId, day, period } = req.body;

    // A. Validation: Is this the Break Period?
    if (period === 4) {
      return res.status(400).json({ message: "Period 4 is reserved for Break." });
    }

    // B. CONFLICT CHECK: Is the Teacher busy elsewhere? 🕵️‍♂️
    // 1. Get the teacher ID from the SubjectClass
    const assignment = await prisma.subjectClass.findUnique({
      where: { id: subjectClassId }
    });
    
    if (!assignment || !assignment.teacherId) {
      return res.status(400).json({ message: "No teacher assigned to this subject yet." });
    }

    // 2. Check if this teacher is booked in ANY other section at this Day/Period
    const conflict = await prisma.routineSlot.findFirst({
      where: {
        day: day,
        period: period,
        subjectClass: { teacherId: assignment.teacherId },
        NOT: { sectionId: sectionId } // Ignore if it's the same section (updating self)
      },
      include: { section: true }
    });

    if (conflict) {
      return res.status(409).json({ 
        message: `Teacher is busy! Assigned to Class ${conflict.section.classLevel}-${conflict.section.sectionName} at this time.` 
      });
    }

    // C. Save the Slot
    const slot = await prisma.routineSlot.upsert({
      where: {
        sectionId_day_period: { sectionId, day, period }
      },
      update: { subjectClassId },
      create: {
        sectionId,
        day,
        period,
        subjectClassId
      }
    });

    res.json({ message: "Saved", slot });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update routine" });
  }
};

// 2. Get Grid for a Section (For Admin & Student)
exports.getSectionRoutine = async (req, res) => {
  try {
    const { classLevel, sectionName } = req.query;

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

    // Fetch slots
    const slots = await prisma.routineSlot.findMany({
      where: { sectionId: section.id },
      include: {
        subjectClass: { include: { course: true, teacher: true } }
      }
    });

    // Also fetch available subjects for the dropdown
    const subjects = await prisma.subjectClass.findMany({
      where: { sectionId: section.id },
      include: { course: true, teacher: true }
    });

    res.json({ sectionId: section.id, slots, subjects });

  } catch (error) {
    res.status(500).json({ message: "Error loading routine" });
  }
};

// 3. Get Teacher's Personal Routine 👩‍🏫
exports.getTeacherRoutine = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const slots = await prisma.routineSlot.findMany({
      where: {
        subjectClass: { teacherId: teacherId }
      },
      include: {
        section: true,
        subjectClass: { include: { course: true } }
      }
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Error loading teacher routine" });
  }
};

// 4. Delete a Slot (Clear cell)
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.routineSlot.delete({ where: { id } });
    res.json({ message: "Cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// 4. Get Student's Own Routine 🎓
exports.getStudentRoutine = async (req, res) => {
  try {
    const { studentId } = req.params;

    // A. Find which section the student is in
    const enrollment = await prisma.sectionEnrollment.findFirst({
      where: { studentId: studentId },
      include: { section: true }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "You are not enrolled in any section." });
    }

    // B. Fetch the routine for that section
    const slots = await prisma.routineSlot.findMany({
      where: { sectionId: enrollment.sectionId },
      include: {
        subjectClass: { include: { course: true, teacher: true } },
        section: true
      }
    });

    res.json(slots);

  } catch (error) {
    res.status(500).json({ message: "Error loading routine" });
  }
};