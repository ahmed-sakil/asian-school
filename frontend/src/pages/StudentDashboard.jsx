import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Award, Activity, Calendar, DollarSign, Clock, 
    User, Megaphone, ArrowRight, BookOpen, FileText 
} from 'lucide-react'; 
import NoticeBoard from '../components/NoticeBoard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* 1. WELCOME BANNER */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">Student Portal</h1>
                <p className="text-slate-300 mt-2 text-lg">
                    Welcome back, {user.fullName} 👋
                </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Current Term: Finals 2025
            </div>
        </div>
        {/* Decorative Blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* 2. MAIN DASHBOARD GRID (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMN 1: ACADEMICS */}
        <DashboardSection title="Academics" icon={BookOpen} accentColor="border-blue-500">
            <NavButton 
                title="Live Results" 
                desc="View recent test marks" 
                icon={Activity} 
                onClick={() => navigate('/live-result')} 
            />
            <NavButton 
                title="Final Result" 
                desc="Term rank & GPA report" 
                icon={Award} 
                onClick={() => navigate('/final-result')} 
            />
            <NavButton 
                title="My Timetable" 
                desc="Weekly class routine" 
                icon={Clock} 
                onClick={() => navigate('/student-routine')} 
            />
        </DashboardSection>

        {/* COLUMN 2: RECORDS & PROFILE */}
        <DashboardSection title="My Records" icon={FileText} accentColor="border-emerald-500">
            <NavButton 
                title="My Fees" 
                desc="Check dues & payment history" 
                icon={DollarSign} 
                onClick={() => navigate('/my-fees')} 
            />
            <NavButton 
                title="Attendance History" 
                desc="View presence report" 
                icon={Calendar} 
                onClick={() => navigate('/my-attendance')} 
            />
            <NavButton 
                title="My Profile" 
                desc="Personal details & settings" 
                icon={User} 
                onClick={() => navigate('/profile')} 
            />
        </DashboardSection>

        {/* COLUMN 3: NOTICE BOARD */}
        <DashboardSection title="Announcements" icon={Megaphone} accentColor="border-orange-500">
             <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <NoticeBoard />
             </div>
        </DashboardSection>

      </div>
    </div>
  );
};

/* --- REUSABLE COMPONENTS (Consistent with Admin/Teacher) --- */

const DashboardSection = ({ title, icon: Icon, children, accentColor }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Header: Slate 900 Background + Colored Bottom Border */}
        <div className={`p-5 bg-slate-900 flex items-center gap-3 border-b-4 ${accentColor}`}>
            <div className="p-2 bg-white/10 rounded-lg text-white">
                <Icon size={18} />
            </div>
            <h3 className="font-bold text-white tracking-wide">{title}</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
            {children}
        </div>
    </div>
);

const NavButton = ({ title, desc, icon: Icon, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 flex items-center group"
    >
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200 shrink-0">
            <Icon size={18} />
        </div>
        <div className="ml-4 flex-1">
            <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </button>
);

export default StudentDashboard;