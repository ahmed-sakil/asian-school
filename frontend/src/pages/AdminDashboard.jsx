import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    Users, UserPlus, DollarSign, BookOpen,
    Calendar, BarChart3, TrendingUp, AlertCircle,
    ArrowRight, Loader2, Bell, CheckSquare, GraduationCap
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ students: 0, teachers: 0, revenue: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 size={40} className="text-slate-800 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* 1. WELCOME BANNER (bg-slate-900) */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-slate-300 mt-2 text-lg">
                            Welcome back, {user.fullName} 👋
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-sm font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* 2. STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Students" 
                    value={stats.students} 
                    icon={Users} 
                    color="text-blue-600" 
                    bg="bg-blue-50" 
                />
                <StatCard 
                    title="Total Teachers" 
                    value={stats.teachers} 
                    icon={GraduationCap} 
                    color="text-violet-600" 
                    bg="bg-violet-50" 
                />
                <StatCard 
                    title="Revenue Collected" 
                    value={`$${stats.revenue.toLocaleString()}`} 
                    icon={TrendingUp} 
                    color="text-emerald-600" 
                    bg="bg-emerald-50" 
                />
                <StatCard 
                    title="Pending Dues" 
                    value={`$${stats.pending.toLocaleString()}`} 
                    icon={AlertCircle} 
                    color="text-rose-600" 
                    bg="bg-rose-50" 
                />
            </div>

            {/* 3. MAIN DASHBOARD GRID (3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: ADMINISTRATION */}
                <DashboardSection title="Administration" icon={Users} accentColor="border-blue-500">
                    <NavButton 
                        title="Admissions Office" 
                        desc="Register new students" 
                        icon={UserPlus} 
                        onClick={() => navigate('/admissions')}
                    />
                    <NavButton 
                        title="Student Directory" 
                        desc="Manage student profiles" 
                        icon={BookOpen} 
                        onClick={() => navigate('/students')}
                    />
                    <NavButton 
                        title="Subject Manager" 
                        desc="Courses & Teacher Assignments" 
                        icon={GraduationCap} 
                        onClick={() => navigate('/subjects')}
                    />
                </DashboardSection>

                {/* COLUMN 2: FINANCE */}
                <DashboardSection title="Finance Office" icon={DollarSign} accentColor="border-emerald-500">
                    <NavButton 
                        title="Fee Structures" 
                        desc="Set up tuition & fees" 
                        icon={DollarSign} 
                        onClick={() => navigate('/fees')}
                    />
                    <NavButton 
                        title="Collect Fees" 
                        desc="Record student payments" 
                        icon={CheckSquare} 
                        onClick={() => navigate('/fees/collect')}
                    />
                </DashboardSection>

                {/* COLUMN 3: DAILY OPS */}
                <div className="space-y-8">
                    <DashboardSection title="Attendance" icon={Calendar} accentColor="border-purple-500">
                        <NavButton 
                            title="Daily Register" 
                            desc="Mark today's attendance" 
                            icon={Calendar} 
                            onClick={() => navigate('/attendance')}
                        />
                        <NavButton 
                            title="Master Sheet" 
                            desc="View monthly reports" 
                            icon={BarChart3} 
                            onClick={() => navigate('/attendance/report')}
                        />
                    </DashboardSection>

                    <DashboardSection title="Communication" icon={Bell} accentColor="border-orange-500">
                         <NavButton 
                            title="Notice Board" 
                            desc="Announcements & Circulars" 
                            icon={Bell} 
                            onClick={() => navigate('/notices')}
                        />
                    </DashboardSection>
                </div>

            </div>
        </div>
    );
};

/* --- REUSABLE COMPONENTS --- */

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-all duration-200">
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bg} ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

// UPDATED SECTION COMPONENT
const DashboardSection = ({ title, icon: Icon, children, accentColor }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        
        {/* HEADER: Matches Banner Color (bg-slate-900) */}
        {/* Border Bottom: Used accentColor to show a distinct HR line */}
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

export default AdminDashboard;