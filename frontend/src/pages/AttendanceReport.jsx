import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react'; // Removed manual Header icons
import toast from 'react-hot-toast';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const AttendanceReport = () => {
  const navigate = useNavigate();

  // Filters
  const [classLevel, setClassLevel] = useState('9');
  const [sectionName, setSectionName] = useState('A');
  const [month, setMonth] = useState(new Date().getMonth() + 1); 
  const [year, setYear] = useState(new Date().getFullYear());

  // Data
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(false);

  const fetchReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading("Generating Matrix...");
    try {
      const { data } = await api.get('/attendance/report', {
        params: { classLevel, sectionName, month, year }
      });
      setData(data);
      toast.dismiss(loadToast);
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get array of days in month (1..31)
  const getDaysInMonth = () => {
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  // Helper: Check status for a student on a specific day
  const getStatus = (studentId, day) => {
    if (!data) return null;
    
    const record = data.records.find(r => {
      const rDate = new Date(r.date);
      return r.studentId === studentId && rDate.getDate() === day;
    });

    if (!record) return 'NA'; 
    return record.isPresent ? 'P' : 'A';
  };

  // Styles
  const selectClass = "px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none bg-white text-slate-700 font-medium";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="Attendance Master Sheet" 
        subtitle="Monthly overview of student presence"
        backPath="/dashboard"
      />

      {/* FILTERS CARD */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <form onSubmit={fetchReport} className="flex flex-col md:flex-row items-end gap-5">
          
          <div>
            <label className={labelClass}>Class</label>
            <div className="relative">
                <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className={selectClass}>
                {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Section</label>
            <div className="relative">
                <select value={sectionName} onChange={e => setSectionName(e.target.value)} className={selectClass}>
                {['A','B','C'].map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Month</label>
            <div className="relative">
                <select value={month} onChange={e => setMonth(e.target.value)} className={selectClass}>
                {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            Generate Sheet
          </button>
        </form>
      </div>

      {/* THE MATRIX */}
      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          
          {/* Scrollable Container */}
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <table className="w-full border-collapse min-w-max">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        {/* Sticky Name Header */}
                        <th className="p-3 text-left font-bold text-slate-700 text-sm sticky left-0 z-20 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">
                            Student Name
                        </th>
                        {/* Date Headers */}
                        {getDaysInMonth().map(day => (
                            <th key={day} className="p-1 w-10 text-center text-xs font-semibold text-slate-500 border-r border-slate-100 last:border-0">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.students.map((student, index) => (
                        <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                            
                            {/* Sticky Name Column */}
                            <td className="p-3 text-sm font-medium text-slate-800 sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">
                                {student.fullName}
                            </td>
                            
                            {/* Attendance Cells */}
                            {getDaysInMonth().map(day => {
                                const status = getStatus(student.id, day);
                                
                                // Logic for cell background based on status
                                let cellContent;
                                let cellClass = "p-1 text-center border-r border-slate-100 h-10 w-10 text-xs";

                                if (status === 'P') {
                                    cellContent = <span className="text-emerald-600 font-bold">P</span>;
                                    // cellClass += " bg-emerald-50/30"; // Optional: faint green bg
                                } else if (status === 'A') {
                                    cellContent = <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold shadow-sm">A</span>;
                                    cellClass += " bg-red-50/30"; 
                                } else {
                                    // NA
                                    cellContent = <span className="text-slate-300">-</span>;
                                    cellClass += " bg-slate-50"; // Gray out weekends/no data
                                }

                                return (
                                    <td key={day} className={cellClass}>
                                        {cellContent}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Empty State */}
            {data.students.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    No students found for this class configuration.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;