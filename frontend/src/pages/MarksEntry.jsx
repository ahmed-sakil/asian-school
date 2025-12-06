import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, FileText, Loader2, CheckCircle } from 'lucide-react'; // Removed ArrowLeft (Header handles it)
import toast from 'react-hot-toast';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const MarksEntry = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const [examInfo, setExamInfo] = useState(null);
  const [sheet, setSheet] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Load the Sheet
  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const { data } = await api.get(`/exams/sheet/${assessmentId}`);
        setExamInfo(data.exam);
        
        const formattedSheet = data.sheet.map(s => ({
          ...s,
          obtainedMark: s.obtainedMark !== null ? s.obtainedMark : '' 
        }));
        setSheet(formattedSheet);
      } catch (error) {
        toast.error("Failed to load marks sheet");
      } finally {
        setLoading(false);
      }
    };
    fetchSheet();
  }, [assessmentId]);

  // Handle Typing Marks
  const handleMarkChange = (studentId, value) => {
    if (examInfo && Number(value) > examInfo.totalMarks) {
      toast.error(`Max mark is ${examInfo.totalMarks}`);
      return;
    }

    setSheet(prev => prev.map(row => 
      row.studentId === studentId ? { ...row, obtainedMark: value } : row
    ));
  };

  // Save to Database
  const handleSave = async () => {
    const loadToast = toast.loading("Saving Marks...");
    try {
      const payload = sheet.map(row => ({
        studentId: row.studentId,
        obtainedMark: row.obtainedMark === '' ? 0 : Number(row.obtainedMark) 
      }));

      await api.post('/exams/marks', {
        assessmentId,
        marks: payload
      });

      toast.dismiss(loadToast);
      toast.success("Marks Saved Successfully! ✅");
      navigate(-1); 
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Failed to save marks");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="text-slate-800 animate-spin" />
      </div>
    );
  }

  if (!examInfo) return <div className="p-8 text-center text-slate-500">Exam not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* 2. PAGE HEADER with Exam Details */}
      <PageHeader 
        title={examInfo.title}
        subtitle={`${examInfo.subjectClass.course.name} • Class ${examInfo.subjectClass.section.classLevel}-${examInfo.subjectClass.section.sectionName}`}
        backPath={`/teacher/exams/${examInfo.subjectClassId}`} // Intelligently go back to the specific class list
        rightElement={
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</p>
                    <p className="font-semibold text-slate-700">{examInfo.category.replace('_', ' ')}</p>
                </div>
                <div className="text-right border-l border-slate-200 pl-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Max Marks</p>
                    <p className="font-bold text-slate-900 text-xl">{examInfo.totalMarks}</p>
                </div>
            </div>
        }
      />

      {/* MARKS GRID */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-24">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">ID / Roll No</div>
            <div className="col-span-6">Student Name</div>
            <div className="col-span-3 text-center">Marks Obtained</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
            {sheet.map((row) => (
              <div 
                key={row.studentId} 
                className={`grid grid-cols-12 items-center p-4 transition-colors ${row.obtainedMark !== '' ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'}`}
              >
                {/* ID Column */}
                <div className="col-span-3">
                   <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded text-sm">
                     {row.schoolId}
                   </span>
                </div>
                
                {/* Name Column */}
                <div className="col-span-6 font-semibold text-slate-700">
                    {row.name}
                </div>
                
                {/* Input Column */}
                <div className="col-span-3 flex justify-center items-center gap-2">
                  <input 
                    type="number" 
                    value={row.obtainedMark}
                    onChange={(e) => handleMarkChange(row.studentId, e.target.value)}
                    placeholder="-"
                    className={`
                        w-20 text-center font-bold text-lg py-1.5 rounded-lg border focus:ring-2 focus:outline-none transition-all
                        ${row.obtainedMark !== '' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-200' 
                            : 'bg-white text-slate-700 border-slate-300 focus:ring-blue-200 focus:border-blue-400'}
                    `}
                  />
                  <span className="text-slate-400 font-medium text-sm w-12">
                    / {examInfo.totalMarks}
                  </span>
                  {/* Visual Checkmark if filled */}
                  <div className="w-5">
                    {row.obtainedMark !== '' && <CheckCircle size={16} className="text-emerald-500 animate-in fade-in zoom-in duration-200"/>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Sticky Floating Save Button */}
      <div className="fixed bottom-6 right-6 md:right-10 z-20">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
        >
          <Save size={20} /> Save All Marks
        </button>
      </div>

    </div>
  );
};

export default MarksEntry;