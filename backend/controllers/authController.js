const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_prod';

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { schoolId, password } = req.body;
    const user = await prisma.user.findUnique({ where: { schoolId } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 86400000 }); // 1 Day
    res.json({ message: "Success", user: { id: user.id, fullName: user.fullName, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- LOGOUT ---
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out" });
};

// --- GET ME (Session Check) ---
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ isAuthenticated: false });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, fullName: true, role: true, schoolId: true }
    });

    if (!user) return res.status(401).json({ isAuthenticated: false });
    res.json({ isAuthenticated: true, user });

  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
  }
};

// --- REGISTER STAFF (TEACHER/ADMIN) ---
// 👇 NEW: Creates user without Section Enrollment
exports.registerStaff = async (req, res) => {
  try {
    const { schoolId, fullName, email, password, role } = req.body;

    // 1. Validation
    if (!['ADMIN', 'TEACHER'].includes(role)) {
      return res.status(400).json({ message: "Invalid Role. Must be ADMIN or TEACHER." });
    }

    // 2. Check Duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ schoolId }, { email }] }
    });
    if (existing) return res.status(400).json({ message: "ID or Email already taken." });

    // 3. Hash & Create
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        schoolId,
        fullName,
        email,
        passwordHash: hashedPassword,
        role: role,
        isActive: true
      }
    });

    res.status(201).json({ message: "Staff Registered Successfully", user: { id: newUser.id, role: newUser.role } });

  } catch (error) {
    console.error("Staff Reg Error:", error);
    res.status(500).json({ message: "Registration Failed" });
  }
};