import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Lock, Calendar } from 'lucide-react'; // Added Calendar icon
import toast from 'react-hot-toast';

// 1. IMPORT HEADER COMPONENT
import PageHeader from '../components/PageHeader';

const RoutineManager = () => {
  const navigate = useNavigate();
  
  // Selectors
  const [classLevel, setClassLevel] = useState('9');
  const [sectionName, setSectionName] = useState('A');
  
  // Data
  const [sectionId, setSectionId] = useState(null);
  const [slots, setSlots] = useState([]); // The active routine
  const [subjects, setSubjects] = useState([]); // Dropdown options
  const [loading, setLoading] = useState(false);

  // Constants
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Load Matrix
  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/routines/section', {
        params: { classLevel, sectionName }
      });
      setSectionId(data.sectionId);
      setSlots(data.slots);
      setSubjects(data.subjects);
    } catch (error) {
      toast.error("Failed to load routine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutine(); }, [classLevel, sectionName]);

  // Handle Cell Update
  const handleAssign = async (day, period, subjectClassId) => {
    if (!subjectClassId) return; // Don't submit empty

    const loadToast = toast.loading("Assigning...");
    try {
      await api.post('/routines/update', {
        sectionId,
        day,
        period,
        subjectClassId
      });
      toast.dismiss(loadToast);
      toast.success("Saved! ✅");
      fetchRoutine(); // Refresh grid
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || "Conflict Detected!");
    }
  };

  // Handle Clear Cell
  const handleClear = async (slotId) => {
    if(!window.confirm("Clear this period?")) return;
    try {
      await api.delete(`/routines/${slotId}`);
      toast.success("Cleared");
      fetchRoutine();
    } catch (error) {
      toast.error("Failed");
    }
  };

  // Helper: Find slot data for specific cell
  const getSlot = (day, period) => {
    return slots.find(s => s.day === day && s.period === period);
  };

  // Common Styles
  const selectClass = "w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none bg-white";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. REPLACED HEADER */}
      <PageHeader 
        title="Routine Manager" 
        subtitle="Schedule classes and assign time slots"
        backPath="/dashboard"
      />

      {/* FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 mb-8 items-end">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Class Level</label>
          <div className="relative">
            <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className={selectClass}>
                {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Section</label>
          <div className="relative">
            <select value={sectionName} onChange={e => setSectionName(e.target.value)} className={selectClass}>
                {['A','B','C'].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>
        
        {/* Loading Indicator */}
        {loading && (
             <div className="flex items-center gap-2 text-slate-400 pb-2 ml-auto">
                 <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                 <span className="text-sm">Loading Grid...</span>
             </div>
        )}
      </div>

      {/* THE MASTERPIECE GRID */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
            
            <thead className="bg-slate-900 text-white">
                <tr>
                <th className="p-4 w-32 text-left font-semibold border-r border-slate-700">Day \ Period</th>
                {periods.map(p => (
                    <th key={p} className="p-4 border-l border-slate-700">
                    <div className="flex flex-col items-center">
                        <span className="font-semibold">Period {p}</span>
                        {p === 4 && <span className="text-xs text-amber-300 font-bold mt-1 bg-slate-800 px-2 py-0.5 rounded">BREAK</span>}
                    </div>
                    </th>
                ))}
                </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
                {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    {/* Day Column */}
                    <td className="p-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 text-sm">
                        {day}
                    </td>
                    
                    {periods.map(period => {
                    
                    // PERIOD 4 IS BREAK 🍔
                    if (period === 4) {
                        return (
                        <td key={period} className="bg-amber-50 border-r border-slate-200 text-center align-middle">
                            <div className="flex flex-col items-center justify-center h-full text-amber-600 font-bold text-xs tracking-wider opacity-70">
                                <span>LUNCH</span>
                                <span>BREAK</span>
                            </div>
                        </td>
                        );
                    }

                    const activeSlot = getSlot(day, period);

                    return (
                        <td key={period} className="p-2 border-r border-slate-200 align-top h-28 w-40 relative group">
                        
                        {activeSlot ? (
                            // 🟢 VIEW MODE (Slot Exists)
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 h-full flex flex-col justify-between hover:shadow-sm transition-shadow">
                                <div>
                                    <div className="font-bold text-blue-900 text-sm leading-tight mb-1">
                                        {activeSlot.subjectClass.course.name}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium truncate">
                                        {activeSlot.subjectClass.teacher?.fullName || 'No Teacher'}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClear(activeSlot.id)} 
                                    className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1 self-start bg-white px-2 py-1 rounded border border-red-100 hover:bg-red-50 transition-colors"
                                >
                                    <X size={10} strokeWidth={3}/> Remove
                                </button>
                            </div>
                        ) : (
                            // ⚪ ASSIGN MODE (Empty Slot)
                            <div className="h-full flex items-center justify-center">
                                <select 
                                    onChange={(e) => handleAssign(day, period, e.target.value)}
                                    className="w-full text-xs text-slate-500 border border-dashed border-slate-300 rounded p-1.5 cursor-pointer hover:border-slate-400 hover:text-slate-700 focus:ring-0 focus:border-slate-500 bg-transparent transition-colors text-center"
                                    defaultValue=""
                                >
                                    <option value="" disabled>+ Add Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>
                                        {sub.course.name} ({sub.teacher?.fullName?.split(' ')[0] || 'TBA'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        </td>
                    );
                    })}
                </tr>
                ))}
            </tbody>

            </table>
        </div>
      </div>

    </div>
  );
};

export default RoutineManager;