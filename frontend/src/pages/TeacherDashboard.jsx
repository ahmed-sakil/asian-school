import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
    BookOpen, Users, ArrowRight, Calendar, 
    FileText, Loader2, ClipboardCheck, Bell, GraduationCap 
} from 'lucide-react';
import toast from 'react-hot-toast';
import NoticeBoard from '../components/NoticeBoard';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const { data } = await api.get(`/courses/teacher/${user.id}`);
        setClasses(data);
      } catch (error) {
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyClasses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 size={40} className="text-slate-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* 1. WELCOME BANNER */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">Teacher's Desk</h1>
                <p className="text-slate-300 mt-2 text-lg">
                    Good day, {user.fullName} 👋
                </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-sm font-medium">
                Academic Term: 2024-2025
            </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN (Span 2): MY CLASSES */}
        <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-slate-500" size={20} />
                <h2 className="text-xl font-bold text-slate-800">My Assigned Classes</h2>
            </div>

            {classes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="text-slate-700 font-bold text-lg">No Classes Assigned</h3>
                    <p className="text-slate-500 mt-2">Contact the administrator to get assigned to a course.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {classes.map((assignment) => (
                        <div 
                            key={assignment.id} 
                            onClick={() => navigate(`/teacher/exams/${assignment.id}`)}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                            Class {assignment.section.classLevel}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                                            Sec {assignment.section.sectionName}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">
                                        {assignment.course.name}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-all">
                                    <GraduationCap size={20} />
                                </div>
                            </div>
                            
                            {/* Card Footer */}
                            <div className="p-4 bg-white mt-auto flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                    <Users size={14} /> Manage Exams & Marks
                                </span>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT COLUMN (Span 1): TOOLS & NOTICES */}
        <div className="space-y-8">
            
            {/* DAILY TOOLS SECTION */}
            <DashboardSection title="Daily Tools" icon={ClipboardCheck} accentColor="border-emerald-500">
                <NavButton 
                    title="Take Attendance" 
                    desc="Mark daily register" 
                    icon={Calendar} 
                    onClick={() => navigate('/attendance')}
                />
                <NavButton 
                    title="Master Sheet" 
                    desc="View monthly reports" 
                    icon={FileText} 
                    onClick={() => navigate('/attendance/report')}
                />
            </DashboardSection>

            {/* NOTICE BOARD SECTION */}
            {/* We wrap the existing component in our new container style */}
            <DashboardSection title="Notice Board" icon={Bell} accentColor="border-orange-500">
                 <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    <NoticeBoard />
                 </div>
            </DashboardSection>

        </div>

      </div>
    </div>
  );
};

/* --- REUSABLE COMPONENTS (Matched with Admin Dashboard) --- */

const DashboardSection = ({ title, icon: Icon, children, accentColor }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Header matching Admin Dashboard */}
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

export default TeacherDashboard;