import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Loader2, CreditCard, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const FeeLedger = ({ studentId }) => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch Bills
  const fetchLedger = async () => {
    try {
      // ✅ FIXED URL: Matches router.get('/ledger/:studentId')
      const { data } = await api.get(`/finance/ledger/${studentId}`);
      setFees(data);
    } catch (error) {
      console.error("Error loading ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [studentId]);

  const handlePayment = async (feeId) => {
    if (!window.confirm("Confirm cash payment received?")) return;
    
    setProcessingId(feeId);
    try {
      // ✅ FIXED URL: Matches router.post('/collect')
      await api.post('/finance/collect', { feeId });
      toast.success("Payment Recorded Successfully! 💰");
      fetchLedger();
    } catch (error) {
      toast.error("Payment Failed");
    } finally {
      setProcessingId(null);
    }
  };

  // 📊 CALCULATION LOGIC
  const totalPayable = fees.reduce((sum, fee) => sum + Number(fee.feeStructure.amount), 0);
  const totalPaid = fees.reduce((sum, fee) => fee.status === 'PAID' ? sum + Number(fee.feeStructure.amount) : sum, 0);
  const totalDue = totalPayable - totalPaid;

  if (loading) {
    return (
        <div className="flex justify-center items-center py-8 text-slate-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading Ledger...
        </div>
    );
  }

  return (
    <div className="w-full">
      
      {fees.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <Receipt className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500">No fee records found for this student.</p>
        </div>
      ) : (
        <>
          {/* TABLE SECTION */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {fees.map(fee => (
                  <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                        {fee.feeStructure.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                        ${fee.feeStructure.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fee.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle size={12} /> PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={12} /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role === 'ADMIN' && fee.status === 'PENDING' && (
                        <button 
                          onClick={() => handlePayment(fee.id)}
                          disabled={processingId === fee.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {processingId === fee.id ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
                          Collect
                        </button>
                      )}
                      {fee.status === 'PAID' && (
                         <span className="text-xs text-slate-400 italic">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🧾 SUMMARY SECTION */}
          <div className="mt-6 flex flex-col md:flex-row justify-end">
            <div className="w-full md:w-80 bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 border-b border-slate-200 pb-2">
                Summary
              </h4>
              
              <div className="flex justify-between items-center mb-2 text-slate-500 text-sm">
                <span>Total Payable</span>
                <span className="font-semibold text-slate-700">${totalPayable.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4 text-emerald-600 text-sm">
                <span>Total Paid</span>
                <span className="font-semibold">+ ${totalPaid.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Due</span>
                <span className={`text-xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${totalDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeeLedger;