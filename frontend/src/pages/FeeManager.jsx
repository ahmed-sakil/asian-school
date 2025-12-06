import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
    Plus, Trash2, Loader2, // Removed DollarSign (Header handles title)
} from 'lucide-react';
import toast from 'react-hot-toast';

// 1. IMPORT THE HEADER COMPONENT
import PageHeader from '../components/PageHeader';

const FeeManager = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    classLevel: '9',
    sectionName: 'ALL', 
    dueDate: ''
  });

  const fetchFees = async () => {
    try {
      const { data } = await api.get('/finance/list');
      setFees(data);
    } catch (error) {
      toast.error("Could not load fee structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/create', formData);
      toast.success("Fee Structure Created!");
      setShowModal(false);
      fetchFees();
      setFormData({ name: '', amount: '', classLevel: '9', sectionName: 'ALL', dueDate: '' });
    } catch (error) {
      toast.error("Failed to create fee");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/finance/${id}`);
      toast.success("Fee deleted");
      fetchFees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. REPLACED MANUAL HEADER WITH COMPONENT */}
      <PageHeader 
        title="Fee Manager" 
        subtitle="Create and manage tuition fees"
        backPath="/dashboard"
        // We pass the Create Button to the right side of the header
        rightElement={
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> Create New Fee
          </button>
        }
      />

      {/* Fee List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Fee Title</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Target Class</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
                ) : fees.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No fee structures found. Create one above.</td></tr>
                ) : (
                    fees.map(fee => (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-700">{fee.name}</td>
                        <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                Class {fee.classLevel}
                                {fee.targetSection && fee.targetSection !== 'ALL' && ` - ${fee.targetSection}`}
                            </span>
                        </td>
                        <td className="p-4 text-slate-700 font-mono font-bold">${fee.amount}</td>
                        <td className="p-4">
                             <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Active</span>
                        </td>
                        <td className="p-4 text-right">
                        <button 
                            onClick={() => handleDelete(fee.id)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Fee"
                        >
                            <Trash2 size={18} />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Assign New Fee</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Fee Title</label>
                    <input name="name" required placeholder="e.g. Monthly Tuition - March" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} value={formData.name} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Amount ($)</label>
                        <input name="amount" type="number" required placeholder="0.00" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} value={formData.amount} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                        <input name="dueDate" type="date" required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} value={formData.dueDate} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Class Level</label>
                        <select name="classLevel" className="w-full p-2.5 border border-slate-300 rounded-lg" onChange={handleChange} value={formData.classLevel}>
                            {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Section</label>
                        <select name="sectionName" className="w-full p-2.5 border border-slate-300 rounded-lg" onChange={handleChange} value={formData.sectionName}>
                            <option value="ALL">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200">Assign Fee</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManager;