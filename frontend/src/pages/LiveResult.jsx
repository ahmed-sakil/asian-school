import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Calendar, Trophy, FileText, Loader2, Search } from 'lucide-react'; // Updated icons
import toast from 'react-hot-toast'; // Swapped alert for toast for better UI

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const LiveResult = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Load Subjects for Dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get(`/exams/student-subjects/${user.id}`);
        setSubjects(data);
      } catch (error) {
        console.error("Error loading subjects");
      }
    };
    fetchSubjects();
  }, [user.id]);

  // 2. Fetch Marks when Subject is Selected
  const handleSubjectChange = async (e) => {
    const subjectClassId = e.target.value;
    setSelectedSubject(subjectClassId);
    
    if (!subjectClassId) {
      setMarks([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/exams/live-result', {
        params: { studentId: user.id, subjectClassId }
      });
      setMarks(data);
    } catch (error) {
      toast.error("Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const selectClass = "w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-700 bg-white cursor-pointer appearance-none";
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="Live Results" 
        subtitle="Track your academic performance and progress"
        backPath="/dashboard"
      />

      {/* DROPDOWN CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500"/>
            Select Subject to View Progress
        </label>
        <div className="relative">
            <select 
                value={selectedSubject} 
                onChange={handleSubjectChange} 
                className={selectClass}
            >
                <option value="">-- Choose a Subject --</option>
                {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.course.name} ({sub.course.code})</option>
                ))}
            </select>
             {/* Custom Arrow */}
             <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      {/* RESULT LIST AREA */}
      {selectedSubject ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12">
                <Loader2 size={40} className="text-slate-800 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Fetching your marks...</p>
            </div>
          ) : (
            marks.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-500">
                    <Activity size={48} className="text-slate-200 mb-4" />
                    <p>No marks recorded for this subject yet.</p>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Name</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {marks.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            {/* Exam Title */}
                            <td className="p-4 text-slate-800 font-bold text-sm">
                                {m.assessment.title}
                            </td>
                            
                            {/* Category Badge */}
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${m.assessment.category === 'CLASS_TEST' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {m.assessment.category.replace('_', ' ')}
                                </span>
                            </td>

                            {/* Date */}
                            <td className="p-4 text-slate-500 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400"/>
                                    {new Date(m.assessment.examDate).toLocaleDateString()}
                                </div>
                            </td>

                            {/* Marks */}
                            <td className="p-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-slate-900">{m.obtainedMark}</span>
                                    <span className="text-xs text-slate-400 font-medium">/ {m.assessment.totalMarks}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            )
          )}
        </div>
      ) : (
          /* Empty State (No Subject Selected) */
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 text-center">
              <Search size={48} className="mb-4 text-slate-200" />
              <h3 className="text-lg font-bold text-slate-600">No Subject Selected</h3>
              <p className="max-w-xs mx-auto mt-2">Please select a subject from the dropdown above to view your exam results.</p>
          </div>
      )}

    </div>
  );
};

export default LiveResult;