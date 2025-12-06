import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react'; // Removed ArrowLeft (handled by Header now)
import toast from 'react-hot-toast'; 

// 1. IMPORT THE HEADER COMPONENT
import PageHeader from '../components/PageHeader';

const Admissions = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    schoolId: '',
    fullName: '',
    email: '',
    classLevel: '9',   
    sectionName: 'A'   
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Optional: Loading toast
    const loadingToast = toast.loading("Admitting Student...");

    try {
      const { data } = await api.post('/users/students', formData);
      
      toast.dismiss(loadingToast);
      toast.success(data.message || "Student Admitted! 🎓");
      
      // SMART RESET logic preserved
      setFormData(prev => ({
        ...prev, 
        fullName: '',
        email: '',
        schoolId: '' 
        // classLevel & sectionName remain unchanged!
      }));

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to admit student");
    }
  };

  // Shared Styles
  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-800 placeholder-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      
      {/* 2. REPLACED HARDCODED HEADER WITH COMPONENT */}
      <PageHeader 
        title="Admissions Office" 
        subtitle="Register new students into the system"
        backPath="/dashboard"
      />

      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6"
      >
        {/* Title inside card for mobile context */}
        <div className="flex items-center gap-3 mb-2 text-slate-800 border-b border-slate-100 pb-4 md:hidden">
          <UserPlus className="w-5 h-5 text-slate-500" />
          <span className="font-semibold">New Student Form</span>
        </div>
        
        {/* Row 1: Student ID */}
        <div>
          <label className={labelClass}>Student ID</label>
          <input 
            required 
            type="text" 
            placeholder="e.g. ST-2025-001" 
            value={formData.schoolId} 
            onChange={e => setFormData({...formData, schoolId: e.target.value})} 
            className={inputClass}
          />
        </div>

        {/* Row 2: Full Name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <input 
            required 
            type="text" 
            placeholder="John Doe" 
            value={formData.fullName} 
            onChange={e => setFormData({...formData, fullName: e.target.value})} 
            className={inputClass}
          />
        </div>

        {/* Row 3: Email */}
        <div>
          <label className={labelClass}>Email Address</label>
          <input 
            required 
            type="email" 
            placeholder="john@example.com" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            className={inputClass}
          />
        </div>

        {/* Row 4: Class & Section (Grid) */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Class Level</label>
            <div className="relative">
              <select 
                value={formData.classLevel} 
                onChange={e => setFormData({...formData, classLevel: e.target.value})} 
                className={`${inputClass} appearance-none bg-white cursor-pointer`}
              >
                {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Section</label>
            <div className="relative">
              <select 
                value={formData.sectionName} 
                onChange={e => setFormData({...formData, sectionName: e.target.value})} 
                className={`${inputClass} appearance-none bg-white cursor-pointer`}
              >
                {['A','B','C'].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <UserPlus size={20} /> 
          <span>Admit Student</span>
        </button>

      </form>
    </div>
  );
};

export default Admissions;