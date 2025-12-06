const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Create a Notice (Admin Only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        postedBy: "Administration"
      }
    });

    res.json({ message: "Notice posted successfully! 📢", notice });
  } catch (error) {
    res.status(500).json({ message: "Failed to post notice" });
  }
};

// 2. Get Recent Notices (For Dashboards)
exports.getNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5 // Only show last 5
    });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices" });
  }
};

// 3. Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};