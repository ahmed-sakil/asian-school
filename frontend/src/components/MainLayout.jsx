import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, UserPlus, Users, BookOpen, 
  DollarSign, Calendar, BarChart3, LogOut, 
  Menu, FileText, Activity, Award, Clock, X, GraduationCap 
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Safety check
  if (!user) return null;

  // Define Menu Items per Role
  const menus = {
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Staff Registry', path: '/staff', icon: Users },
      { label: 'Timetable Manager', path: '/routine/manage', icon: Clock },
      { label: 'Admissions', path: '/admissions', icon: UserPlus },
      { label: 'Students', path: '/students', icon: Users },
      { label: 'Academics', path: '/subjects', icon: BookOpen },
      { label: 'Fee Structure', path: '/fees', icon: DollarSign },
      { label: 'Collect Fees', path: '/fees/collect', icon: DollarSign },
      { label: 'Take Attendance', path: '/attendance', icon: Calendar },
      { label: 'Master Sheet', path: '/attendance/report', icon: BarChart3 },
    ],
    TEACHER: [
      { label: 'My Desk', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Schedule', path: '/my-routine', icon: Clock },
      { label: 'Take Attendance', path: '/attendance', icon: Calendar },
      { label: 'Master Sheet', path: '/attendance/report', icon: FileText },
      { label: 'Student Directory', path: '/students', icon: Users },
    ],
    STUDENT: [
      { label: 'Portal Home', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Timetable', path: '/student-routine', icon: Clock },
      { label: 'Live Results', path: '/live-result', icon: Activity },
      { label: 'Final Report', path: '/final-result', icon: Award },
      { label: 'My Fees', path: '/my-fees', icon: DollarSign },
      { label: 'My Attendance', path: '/my-attendance', icon: Calendar },
    ]
  };

  const currentMenu = menus[user.role] || [];

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-600">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-900 text-white z-50 flex items-center justify-between p-4 shadow-md shadow-slate-900/20">
        <div className="flex items-center gap-3">
          {/* ✅ FIXED: Using GraduationCap here with consistent styling */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-blue-900/50">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-wide">Asian School</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 rounded hover:bg-white/10">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-900/20
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand */}
        <div 
          onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
          className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 cursor-pointer hover:bg-white/5 transition-colors"
        >
          {/* ✅ FIXED: Replaced 'A' text with GraduationCap Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-lg font-bold tracking-wide text-slate-100">Asian School</h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon || LayoutDashboard; 
            
            return (
              <button
                key={index}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-sm translate-x-1 border border-white/5' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}
                `}
              >
                <IconComponent 
                  size={20} 
                  className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'} 
                /> 
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/30">
          
          <div 
            onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 mb-4 cursor-pointer group hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center font-bold shadow-sm text-white">
              {(user.fullName && user.fullName[0]) ? user.fullName[0] : '?'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                {user.fullName || 'User'}
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-400">
                {user.role} • Settings
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* OVERLAY (Mobile Only) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 min-h-screen pt-20 lg:pt-10 transition-all relative">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none -z-10" />
        <Outlet /> 
      </main>

    </div>
  );
};

export default MainLayout;