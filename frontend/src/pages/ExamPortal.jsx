import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, FileText, Calendar, Users, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const ExamPortal = () => {
  const { subjectClassId } = useParams();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [headerInfo, setHeaderInfo] = useState(null); 
  const [showCreate, setShowCreate] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', category: 'CLASS_TEST', totalMarks: 100, date: '' });
  const [loading, setLoading] = useState(true);

  // Load Exams & Header Info
  const fetchExams = async () => {
    try {
      const { data } = await api.get(`/exams/subject/${subjectClassId}`);
      setExams(data.exams);
      setHeaderInfo(data.subjectDetails);
    } catch (error) {
      toast.error("Could not load exams");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, [subjectClassId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Scheduling Exam...");
    try {
      await api.post('/exams/create-direct', { ...newExam, subjectClassId });
      toast.dismiss(loadToast);
      toast.success("Exam Created!");
      setShowCreate(false);
      fetchExams();
      setNewExam({ title: '', category: 'CLASS_TEST', totalMarks: 100, date: '' });
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Failed to create exam");
    }
  };

  const getStatusBadge = (gradedCount, totalStudents) => {
    if (gradedCount === 0) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">Pending</span>;
    }
    if (gradedCount >= totalStudents) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">Completed ✅</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">{gradedCount}/{totalStudents} Graded</span>;
  };

  const inputClass = "w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-700 placeholder-slate-400 bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="text-slate-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. FIXED HEADER PATH */}
      <PageHeader 
        title={headerInfo ? headerInfo.course.name : "Exam Portal"} 
        subtitle={headerInfo ? `Class ${headerInfo.section.classLevel} - Section ${headerInfo.section.sectionName}` : "Manage Exams"}
        
        // ✅ FIX: Changed from '/teacher/dashboard' to '/dashboard'
        backPath="/dashboard" 
        
        rightElement={
            headerInfo && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span className="font-bold text-slate-700">{headerInfo.section._count.enrollments}</span>
                    <span className="text-slate-400">Students</span>
                </div>
            )
        }
      />

      {/* CREATE TOGGLE & FORM */}
      <div className="mb-8">
        {!showCreate ? (
             <button 
                onClick={() => setShowCreate(true)} 
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow transition-all flex items-center gap-2"
            >
                <Plus size={18} /> Schedule New Exam
            </button>
        ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-800">Schedule New Exam</h3>
                    <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Exam Title</label>
                        <input required placeholder="e.g. Chapter 1 Test" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Category</label>
                        <div className="relative">
                            <select value={newExam.category} onChange={e => setNewExam({...newExam, category: e.target.value})} className={inputClass}>
                                <option value="CLASS_TEST">Class Test</option>
                                <option value="FIRST_TERM">First Term</option>
                                <option value="SECOND_TERM">Second Term</option>
                                <option value="FINAL_EXAM">Final Exam</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Total Marks</label>
                        <input type="number" required value={newExam.totalMarks} onChange={e => setNewExam({...newExam, totalMarks: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Date</label>
                        <input type="date" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className={inputClass} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                         <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"><Save size={18} /> Confirm Schedule</button>
                    </div>
                </form>
            </div>
        )}
      </div>

      {/* EXAM LIST TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Title</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Marks Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exams.length === 0 ? (
              <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400">
                      <FileText className="mx-auto mb-2 opacity-20" size={40} />
                      No exams scheduled yet.
                  </td>
              </tr>
            ) : (
              exams.map(exam => (
                <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-700 font-bold text-sm">{exam.title}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${exam.category === 'CLASS_TEST' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {exam.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm font-medium">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> {new Date(exam.examDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    {headerInfo && getStatusBadge(exam._count.marks, headerInfo.section._count.enrollments)}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => navigate(`/teacher/marks/${exam.id}`)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-lg text-sm font-bold shadow-sm transition-all">
                      <FileText size={16}/> Enter Marks
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ExamPortal;