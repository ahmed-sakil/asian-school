import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Info, Receipt } from 'lucide-react'; // Updated icons
import FeeLedger from '../components/FeeLedger'; 

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const MyFees = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. PAGE HEADER */}
      <PageHeader 
        title="My Financial Status" 
        subtitle="Track your tuition fees, payments, and dues"
        backPath="/dashboard"
      />

      {/* 3. INFO BANNER */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 mb-8 text-indigo-900 shadow-sm">
        <div className="p-2 bg-indigo-100 rounded-full shrink-0">
            <Info size={20} className="text-indigo-600" />
        </div>
        <div>
            <h4 className="font-bold text-sm">Payment Information</h4>
            <p className="text-sm mt-1 opacity-90">
                Online payments are currently disabled. Please visit the <strong>Accounts Office</strong> (Room 102) to clear any pending dues via Cash or Check.
            </p>
        </div>
      </div>

      {/* 4. FEE LEDGER CONTAINER */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm">
                <Receipt size={18} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Fee Ledger</h3>
                <p className="text-xs text-slate-500">Transaction history for {user.schoolId}</p>
            </div>
        </div>

        {/* The Reused Component */}
        <div className="p-6">
            <FeeLedger studentId={user.id} />
        </div>
      </div>

    </div>
  );
};

export default MyFees;