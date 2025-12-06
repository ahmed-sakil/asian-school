import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Lock, Save, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const Profile = () => {
  const { user } = useAuth();
  
  // State for form data
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  // State for visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      return toast.error("New passwords do not match!");
    }
    if (passwords.newPass.length < 6) {
      return toast.error("Password must be at least 6 chars");
    }

    const loadToast = toast.loading("Updating...");
    try {
      await api.put('/users/profile/update', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      toast.dismiss(loadToast);
      toast.success("Password Changed Successfully! 🔒");
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  // Shared Styles
  // Added 'pr-10' to make space for the eye icon
  const inputClass = "w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-700 placeholder-slate-400 bg-white";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="User Profile" 
        subtitle="Manage your account settings and security"
        backPath="/dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: INFO CARD */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          
          <div className="mb-6 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-slate-500 shadow-inner border border-slate-200">
              {user.fullName[0]}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{user.fullName}</h2>
            <div className="mt-2">
                <span className="inline-block px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                    {user.role}
                </span>
            </div>
          </div>

          <div className="w-full space-y-4 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">School ID</span>
              <span className="font-mono font-bold text-slate-700">{user.schoolId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">Email Address</span>
              <span className="font-semibold text-slate-700">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">Account Status</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: SECURITY FORM */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                <Shield size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Security Settings</h3>
                <p className="text-xs text-slate-500">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            
            {/* Current Password */}
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={passwords.current} 
                    onChange={e => setPasswords({...passwords, current: e.target.value})} 
                    className={inputClass}
                />
                {/* Toggle Button */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* New Password */}
            <div className="pt-2">
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={passwords.newPass} 
                    onChange={e => setPasswords({...passwords, newPass: e.target.value})} 
                    className={inputClass}
                    placeholder="Min 6 characters" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={passwords.confirm} 
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                    className={inputClass}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
                type="submit" 
                className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save size={18} /> Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;