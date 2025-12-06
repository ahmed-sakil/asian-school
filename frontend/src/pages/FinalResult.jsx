import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Award, Printer, Loader2, Trophy, Calculator, Percent, AlertCircle } from 'lucide-react'; // Added icons

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const FinalResult = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinal = async () => {
      try {
        const { data } = await api.get('/exams/final-result', {
          params: { studentId: user.id }
        });
        setData(data);
      } catch (error) {
        console.error("Error fetching result");
      } finally {
        setLoading(false);
      }
    };
    fetchFinal();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="text-slate-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="Final Result" 
        subtitle="End of term assessment report"
        backPath="/dashboard"
        rightElement={
            data && data.found && (
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Printer size={16}/> Print Result
                </button>
            )
        }
      />

      {!data || !data.found ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-red-800">Result Not Published</h3>
          <p className="text-red-600 mt-2">The Final Term results are not available for viewing yet.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 3. SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Rank Card - Gradient */}
             <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 opacity-90 mb-2">
                        <Trophy size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">Class Rank</span>
                    </div>
                    <div className="text-5xl font-extrabold tracking-tight">#{data.summary.rank}</div>
                </div>
                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
             </div>
             
             {/* Total Score */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calculator size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Score</span>
                </div>
                <div className="text-4xl font-bold text-slate-800">{data.summary.grandTotal}</div>
             </div>
             
             {/* Percentage */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Percent size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Overall</span>
                </div>
                <div className={`text-4xl font-bold ${Number(data.summary.percentage) >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {data.summary.percentage}%
                </div>
             </div>
          </div>

          {/* 4. REPORT TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Table Header / Student Info */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Award size={20} className="text-blue-600" />
                        Final Term Mark Sheet
                   </h3>
                   <p className="text-slate-500 text-sm mt-1">Official Transcript</p>
               </div>
               <div className="text-right">
                   <div className="font-bold text-slate-800">{user.fullName}</div>
                   <div className="font-mono text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 inline-block mt-1">
                       ID: {user.schoolId}
                   </div>
               </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white border-b border-slate-200">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Marks</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Obtained</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Grade</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.report.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{row.subject}</td>
                        <td className="p-4 text-slate-500 text-center font-medium">{row.total}</td>
                        <td className="p-4 text-indigo-700 font-bold text-center text-lg">{row.obtained}</td>
                        <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold ${
                            row.grade === 'F' 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                            {row.grade}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalResult;