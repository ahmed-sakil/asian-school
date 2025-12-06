# 🏫 Asian School ERP

**A Comprehensive Full-Stack School Management System**

Asian School ERP is a robust, role-based web application designed to digitize and streamline the daily operations of an educational institution. It provides a unified ecosystem for Administrators, Teachers, and Students to manage academic, financial, and administrative tasks efficiently.

Built with the **PERN Stack** (PostgreSQL, Express, React, Node.js).

---

## 🔗 Live Demo
**[Click here to view the Live Project](INSERT_YOUR_LINK_HERE)**

---

## 🚀 Key Features

### 🛡️ Security & Authentication
* **Role-Based Access Control (RBAC):** Strict separation of duties between Admin, Teacher, and Student.
* **Secure Auth:** Implementation of JSON Web Tokens (JWT) stored in HttpOnly cookies to prevent XSS attacks.
* **Password Security:** Industry-standard BCrypt hashing for user passwords.

### 💰 Finance & Ledger Module
* **Fee Structure Management:** Admins can define dynamic fee heads (e.g., Monthly Tuition, Exam Fees).
* **Billing Engine:** Automatically generates pending bills for specific classes or sections.
* **Cash Collection:** "Collect Fees" interface for Admins to receive payments and update status instantly.
* **Student Ledger:** Students and Admins can view a complete history of Paid vs. Pending dues.

### 📅 Smart Routine (Timetable) Matrix
* **Conflict Detection:** Intelligent logic that prevents assigning a teacher to two classes simultaneously.
* **Matrix UI:** Excel-style grid for Admins to manage the weekly schedule (Periods 1-6).
* **Auto-Views:** Teachers see their personal schedule; Students see their class routine.

### 🎓 Academic Management
* **Admissions:** Streamlined student enrollment with automatic Class & Section mapping.
* **Examination System:** Teachers create exams, input marks, and the system calculates GPA and Letter Grades automatically.
* **Attendance:** Daily attendance tracking with visual master-sheet reporting.
* **Subject Allocation:** Dynamic mapping of Courses to Teachers and Sections.

### 📱 Student Portal
* **Live Dashboard:** Students can view their latest results, attendance stats, and fee status.
* **Notice Board:** Real-time school announcements.

---

## 🛠️ Tech Stack

### Frontend
* **React.js (Vite):** For a fast, reactive user interface.
* **Lucide React:** For modern, clean iconography.
* **React Router DOM:** For seamless client-side navigation.
* **React Hot Toast:** For user feedback notifications.
* **Axios:** For API communication.

### Backend
* **Node.js & Express.js:** RESTful API architecture.
* **Prisma ORM:** For type-safe database interactions and schema management.
* **PostgreSQL:** Relational database for structured data integrity.
* **JWT & Cookie-Parser:** For secure session management.
* **BCryptJS:** For password encryption.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Node.js installed
* PostgreSQL installed and running

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/asian-school-erp.git](https://github.com/your-username/asian-school-erp.git)
cd asian-school-erp
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file and add your variables
# DATABASE_URL="postgresql://user:password@localhost:5432/asian_school_db"
# JWT_SECRET="your_secret_key"
# PORT=5000

# Run Database Migrations
npx prisma migrate dev --name init

# Start Server
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install

# Start React App
npm run dev
```

