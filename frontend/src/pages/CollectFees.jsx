import React, { useState } from 'react';
import api from '../api';
import { Search, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. IMPORT HEADER COMPONENT
import PageHeader from '../components/PageHeader';

const CollectFees = () => {
  const [searchId, setSearchId] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setStudent(null);
    try {
      // 1. Get User Details
      const userRes = await api.get(`/users/lookup/${searchId}`);
      // 2. Get Fee Details
      const feeRes = await api.get(`/finance/ledger/${userRes.data.id}`);
      
      // 3. Merge them for display
      setStudent({ ...userRes.data, studentFees: feeRes.data });
    } catch (error) {
      toast.error("Student not found");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (feeId) => {
    if(!window.confirm("Confirm cash collection?")) return;
    
    const loadToast = toast.loading("Processing...");
    try {
      await api.post('/finance/collect', { feeId });
      toast.dismiss(loadToast);
      toast.success("Payment Successful! ✅");
      handleSearch(null); // Refresh the list
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error("Payment Failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="Collect Fees" 
        subtitle="Search for a student and record payments" 
        backPath="/dashboard" 
      />

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Enter Student ID (e.g. ST-2025-001)" 
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition text-slate-700 placeholder-slate-400"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading} 
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
        </form>
      </div>

      {/* RESULT */}
      {student && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STUDENT HEADER CARD */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-600 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800">{student.fullName}</h2>
                <p className="text-slate-500 font-medium mt-1">
                   {student.enrollments?.[0] 
                     ? `Class ${student.enrollments[0].section.classLevel} - Section ${student.enrollments[0].section.sectionName}` 
                     : "No Active Class Assignment"}
                </p>
             </div>
             <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Student ID</div>
                <div className="text-lg font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    {student.schoolId}
                </div>
             </div>
          </div>

          {/* FEES TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Description</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Due Date</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!student.studentFees || student.studentFees.length === 0) ? (
                  <tr>
                      <td colSpan="4" className="p-12 text-center text-slate-400">
                          <CheckCircle className="mx-auto mb-2 opacity-20" size={40} />
                          No pending fees found for this student.
                      </td>
                  </tr>
                ) : (
                  student.studentFees.map(fee => (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-700 font-medium">
                         {fee.feeStructure.name}
                      </td>
                      <td className="p-4 text-slate-900 font-bold font-mono">
                          ${fee.feeStructure.amount}
                      </td>
                      <td className="p-4 text-center text-slate-500 text-sm">
                          {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        
                        {fee.status === 'PENDING' ? (
                          <button 
                            onClick={() => handlePay(fee.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
                          >
                            <DollarSign size={16}/> Collect Cash
                          </button>
                        ) : (
                          // Paid Badge
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold border border-sky-200">
                            <CheckCircle size={14} /> PAID
                          </span>
                        )}

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectFees;