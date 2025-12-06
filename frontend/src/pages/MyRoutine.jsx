import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Loader2, Calendar } from 'lucide-react';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const MyRoutine = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data } = await api.get(`/routines/teacher/${user.id}`);
        setSlots(data);
      } catch (error) {
        console.error("Error fetching routine");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRoutine();
  }, [user]);

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Helper to find class at specific time
  const getSlot = (day, period) => {
    return slots.find(s => s.day === day && s.period === period);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 size={40} className="text-slate-800 animate-spin" />
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="My Weekly Schedule" 
        subtitle={`Timetable for ${user.fullName}`}
        backPath="/dashboard"
      />

      {/* 3. TIMETABLE GRID */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
            
            {/* Header Row */}
            <thead className="bg-slate-900 text-white">
                <tr>
                <th className="p-4 w-32 text-left font-semibold border-r border-slate-700">Day \ Period</th>
                {periods.map(p => (
                    <th key={p} className="p-4 border-l border-slate-700 text-center w-40">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold tracking-wide">Period {p}</span>
                            {p === 4 && <span className="text-[10px] text-amber-300 font-bold mt-1 bg-white/10 px-2 py-0.5 rounded">BREAK</span>}
                        </div>
                    </th>
                ))}
                </tr>
            </thead>

            {/* Body Rows */}
            <tbody className="divide-y divide-slate-200">
                {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Day Column */}
                    <td className="p-4 font-bold text-slate-700 bg-slate-50 border-r border-slate-200 text-sm">
                        {day}
                    </td>
                    
                    {periods.map(period => {
                    
                    // LUNCH BREAK LOGIC
                    if (period === 4) {
                        return (
                        <td key={period} className="bg-amber-50/60 border-r border-slate-200 text-center align-middle">
                            <div className="flex flex-col items-center justify-center h-24 text-amber-600/60 font-bold text-xs tracking-widest uppercase rotate-90 sm:rotate-0">
                                Lunch
                            </div>
                        </td>
                        );
                    }

                    const activeSlot = getSlot(day, period);

                    return (
                        <td key={period} className="p-2 border-r border-slate-200 align-top h-32 relative">
                        
                        {activeSlot ? (
                            // 🟢 CLASS CARD
                            <div className="bg-white border-l-4 border-l-blue-500 shadow-sm border border-slate-200 rounded p-3 h-full flex flex-col justify-between hover:shadow-md transition-shadow group">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">
                                        {activeSlot.subjectClass.course.name}
                                    </div>
                                    <div className="text-xs text-blue-600 font-semibold bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">
                                        Class {activeSlot.section.classLevel}-{activeSlot.section.sectionName}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                    <Clock size={10} /> 45 Mins
                                </div>
                            </div>
                        ) : (
                            // ⚪ FREE PERIOD
                            <div className="h-full rounded border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                <span className="text-xs font-medium">Free Period</span>
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

export default MyRoutine;