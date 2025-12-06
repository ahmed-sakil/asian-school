import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    User, Mail, Hash, School, 
    Loader2, DollarSign, Award, CalendarCheck, Wallet 
} from 'lucide-react'; // Removed ArrowLeft (handled by Header)
import FeeLedger from '../components/FeeLedger'; 
import toast from 'react-hot-toast';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, presentDays: 0, absentDays: 0 }); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Basic Profile
        const profileRes = await api.get(`/users/students/${id}`);
        setStudent(profileRes.data);

        // 2. Fetch Attendance Stats
        try {
            const attRes = await api.get(`/attendance/student/${id}`);
            setAttendanceStats(attRes.data);
        } catch (attError) {
            console.log("Attendance data not found (might be new student)");
        }

      } catch (error) {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 size={40} className="text-slate-800 animate-spin" />
          </div>
      );
  }

  if (!student) return <div className="p-8 text-center text-slate-500">Student not found</div>;

  // Helpers
  const currentEnrollment = student.enrollments?.[0];
  const sectionInfo = currentEnrollment 
    ? `Class ${currentEnrollment.section.classLevel} - ${currentEnrollment.section.sectionName}`
    : 'Not Enrolled';

  // Finance Calc
  const totalDue = student.studentFees?.reduce((sum, fee) => {
    return fee.status === 'PENDING' ? sum + Number(fee.feeStructure.amount) : sum;
  }, 0) || 0;

  // GPA Calc
  const latestResult = student.finalResults?.[0]; 
  const gpa = latestResult?.gpa || "N/A";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="Student Profile" 
        subtitle="View detailed academic and financial records"
        backPath="/students"
      />

      {/* 3. PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
        
        {/* Avatar */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-inner border-4 border-white">
          <User size={48} />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3 z-10">
          <div className="flex flex-col md:flex-row items-center gap-3">
             <h1 className="text-3xl font-bold text-slate-800">{student.fullName}</h1>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${student.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {student.isActive ? 'Active Student' : 'Inactive'}
             </span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <InfoBadge icon={Hash} text={student.schoolId} label="ID" />
            <InfoBadge icon={Mail} text={student.email} label="Email" />
            <InfoBadge icon={School} text={sectionInfo} label="Class" color="text-blue-700 bg-blue-50 border-blue-100" />
          </div>
        </div>
      </div>

      {/* 4. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Finance Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${totalDue > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <Wallet size={20} />
                </div>
                <h3 className="font-bold text-slate-700">Financial Status</h3>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${totalDue.toFixed(2)}
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
                {totalDue > 0 ? 'Outstanding Dues' : 'All fees settled'}
            </p>
        </div>

        {/* GPA Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-500">
                    <Award size={20} />
                </div>
                <h3 className="font-bold text-slate-700">Academic GPA</h3>
            </div>
            <span className="text-3xl font-bold text-slate-800">{gpa}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">Latest Final Result</p>
        </div>

        {/* Attendance Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                    <CalendarCheck size={20} />
                </div>
                <h3 className="font-bold text-slate-700">Attendance</h3>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{attendanceStats.percentage}%</span>
                <span className="text-sm text-slate-400 font-medium">Attendance</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
                Present: <span className="text-emerald-600">{attendanceStats.presentDays}</span> • Absent: <span className="text-red-500">{attendanceStats.absentDays}</span>
            </p>
        </div>
      </div>

      {/* 5. FEE LEDGER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm">
                <DollarSign size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Fee History & Ledger</h3>
        </div>
        <div className="p-6">
            <FeeLedger studentId={id} />
        </div>
      </div>

    </div>
  );
};

// Reusable Badge Component
const InfoBadge = ({ icon: Icon, text, color = "text-slate-600 bg-slate-50 border-slate-200" }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${color}`}>
        <Icon size={14} />
        <span className="font-medium">{text}</span>
    </div>
);

export default StudentProfile;