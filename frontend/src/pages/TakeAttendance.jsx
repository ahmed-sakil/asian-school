import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { Users, Save, Lock, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

const TakeAttendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  // Selection State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState(''); 
  const [classLevel, setClassLevel] = useState('9');
  const [sectionName, setSectionName] = useState('A');

  // Data State
  const [allowedClasses, setAllowedClasses] = useState([]); 
  const [sheet, setSheet] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 1. On Load: Determine Dropdown Options
  useEffect(() => {
    const fetchDropdowns = async () => {
      if (user.role === 'ADMIN') return; 

      try {
        const { data } = await api.get(`/courses/teacher/${user.id}`);
        const uniqueClasses = [];
        const map = new Map();
        for (const item of data) {
          const key = `${item.section.classLevel}-${item.section.sectionName}`;
          if(!map.has(key)){
            map.set(key, true);
            uniqueClasses.push({
              label: `Class ${item.section.classLevel} - Section ${item.section.sectionName}`,
              classLevel: item.section.classLevel,
              sectionName: item.section.sectionName
            });
          }
        }
        setAllowedClasses(uniqueClasses);
        
        if (uniqueClasses.length > 0) {
            setClassLevel(uniqueClasses[0].classLevel);
            setSectionName(uniqueClasses[0].sectionName);
        }

      } catch (error) {
        toast.error("Could not load your assigned classes.");
      }
    };
    fetchDropdowns();
  }, [user]);

  const handleTeacherClassChange = (e) => {
    const index = e.target.value;
    const selected = allowedClasses[index];
    setClassLevel(selected.classLevel);
    setSectionName(selected.sectionName);
    setSelectedClassId(index);
  };

  const fetchSheet = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading("Loading Register...");
    
    try {
      const { data } = await api.get('/attendance/sheet', {
        params: { classLevel, sectionName, date }
      });
      
      setSheet(data.sheet);
      setSectionId(data.sectionId);
      const isSaved = data.sheet.some(s => s.status === 'Saved');
      setStatus(isSaved ? 'Saved' : 'Not Taken');
      toast.dismiss(loadToast);
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Failed to load list.");
      setSheet([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (index) => {
    const newSheet = [...sheet];
    newSheet[index].isPresent = !newSheet[index].isPresent;
    setSheet(newSheet);
  };

  const handleSubmit = async () => {
    const loadToast = toast.loading("Saving...");
    try {
      const records = sheet.map(s => ({
        studentId: s.studentId,
        isPresent: s.isPresent
      }));
      await api.post('/attendance/submit', { sectionId, date, records });
      toast.dismiss(loadToast);
      toast.success("Attendance Saved! ✅");
      setStatus('Saved');
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Failed to save");
    }
  };

  const markAll = (status) => {
    setSheet(sheet.map(s => ({ ...s, isPresent: status })));
  };

  const inputClass = "w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none text-slate-700 bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <PageHeader 
        title="Daily Attendance" 
        subtitle={`Taking attendance for ${new Date(date).toLocaleDateString()}`}
        backPath="/dashboard"
      />

      {/* CONTROL BAR */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={fetchSheet} className="flex flex-col md:flex-row items-end gap-6">
            
            <div className="w-full md:w-1/3">
                <label className={labelClass}>Date</label>
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className={inputClass} 
                />
            </div>

            {user.role === 'ADMIN' ? (
            <>
                <div className="w-full md:w-1/4">
                    <label className={labelClass}>Class</label>
                    <div className="relative">
                        <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className={inputClass}>
                            {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="w-full md:w-1/4">
                    <label className={labelClass}>Section</label>
                    <div className="relative">
                        <select value={sectionName} onChange={e => setSectionName(e.target.value)} className={inputClass}>
                            {['A','B','C'].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                </div>
            </>
            ) : (
            <div className="w-full md:flex-1">
                <label className={labelClass}>Select Your Class</label>
                {allowedClasses.length > 0 ? (
                    <div className="relative">
                        <select 
                            value={selectedClassId} 
                            onChange={handleTeacherClassChange} 
                            className={inputClass}
                        >
                            {allowedClasses.map((cls, index) => (
                            <option key={index} value={index}>{cls.label}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <Lock size={14} /> No classes assigned.
                </div>
                )}
            </div>
            )}

            <button 
                type="submit" 
                disabled={user.role === 'TEACHER' && allowedClasses.length === 0} 
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />}
                Load Sheet
            </button>
        </form>
      </div>

      {/* REGISTER SHEET */}
      {sheet.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
               <h3 className="text-lg font-bold text-slate-800">Class {classLevel}-{sectionName}</h3>
               <div className={`text-sm font-semibold flex items-center gap-1.5 mt-1 ${status === 'Saved' ? 'text-green-600' : 'text-amber-600'}`}>
                 {status === 'Saved' ? <Check size={16}/> : <Loader2 size={16} />} 
                 Status: {status === 'Saved' ? 'Submitted' : 'Not Taken'}
               </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => markAll(true)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition whitespace-nowrap">All Present</button>
              <button type="button" onClick={() => markAll(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition whitespace-nowrap">All Absent</button>
            </div>
          </div>

          {/* Table Wrapper with Overflow */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
                <tbody className="divide-y divide-slate-100">
                {sheet.map((student, index) => (
                    <tr 
                        key={student.studentId} 
                        className={`transition-colors duration-200 ${student.isPresent ? 'bg-white' : 'bg-red-50 hover:bg-red-100'}`}
                    >
                    {/* --- FIX APPLIED HERE: whitespace-nowrap --- */}
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                        {student.schoolId}
                    </td>
                    
                    {/* Also added to name to stay safe */}
                    <td className={`px-6 py-4 font-semibold whitespace-nowrap ${student.isPresent ? 'text-slate-700' : 'text-red-700'}`}>
                        {student.name}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={() => toggleAttendance(index)}
                        className={`
                            relative inline-flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-bold transition-all transform active:scale-95 whitespace-nowrap min-w-[110px]
                            ${student.isPresent 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-1 ring-emerald-200' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200 ring-1 ring-red-200 shadow-inner'}
                        `}
                        >
                        {student.isPresent ? (
                            <><Check size={14} strokeWidth={3} /> Present</>
                        ) : (
                            <><X size={14} strokeWidth={3} /> Absent</>
                        )}
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 text-right">
            <button 
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] whitespace-nowrap"
            >
              <Save size={18} /> Save Attendance
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default TakeAttendance;