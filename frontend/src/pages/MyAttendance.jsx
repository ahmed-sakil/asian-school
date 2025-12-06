import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    XCircle, CheckCircle, Calendar, 
    TrendingUp, Loader2, History, Clock 
} from 'lucide-react';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const MyAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtt = async () => {
      try {
        const { data } = await api.get(`/attendance/student/${user.id}`);
        setStats(data);
      } catch (error) {
        console.error("Error loading attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchAtt();
  }, [user.id]);

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 size={40} className="text-slate-800 animate-spin" />
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="My Attendance" 
        subtitle="Track your daily presence and consistency"
        backPath="/dashboard"
      />

      {!stats ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <Calendar className="mx-auto mb-3 opacity-20" size={48} />
              No attendance data found.
          </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 3. STATS CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Rate Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
                            <h3 className="text-4xl font-bold text-slate-800 mt-2">{stats.percentage}%</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                {/* Present Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days Present</p>
                            <h3 className="text-4xl font-bold text-slate-800 mt-2">{stats.presentDays}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* Absent Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days Absent</p>
                            <h3 className="text-4xl font-bold text-slate-800 mt-2">{stats.absentDays}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. HISTORY LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm">
                        <History size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800">Attendance Log</h3>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {stats.history.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No attendance records found yet.</div>
                    ) : (
                        stats.history.map(record => (
                        <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                {/* Status Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${record.isPresent ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                    {record.isPresent ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </div>
                                
                                {/* Date Info */}
                                <div>
                                    <p className="font-bold text-slate-700">
                                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                        <Clock size={12} />
                                        {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${record.isPresent ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {record.isPresent ? 'Present' : 'Absent'}
                            </span>
                        </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default MyAttendance;