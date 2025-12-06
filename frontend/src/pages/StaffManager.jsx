import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
    UserPlus, Shield, Trash2, Mail, Lock, 
    User, Briefcase, Loader2, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

const StaffManager = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    schoolId: '',
    fullName: '',
    email: '',
    password: '',
    role: 'TEACHER' // Default
  });

  // 1. Fetch Existing Staff
  const fetchStaff = async () => {
    try {
      // Assuming your backend has a route to get non-students
      // If not, you might need to create router.get('/users/staff')
      const { data } = await api.get('/users/staff'); 
      setStaff(data);
    } catch (error) {
      console.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 2. Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadToast = toast.loading("Registering staff...");

    try {
      // Assuming your backend uses a generic register or specific staff endpoint
      // You might need to check your backend route for this.
      await api.post('/auth/register-staff', formData); 
      
      toast.dismiss(loadToast);
      toast.success(`${formData.role} Added Successfully! 🎉`);
      
      // Reset Form & Reload List
      setFormData({ schoolId: '', fullName: '', email: '', password: '', role: 'TEACHER' });
      fetchStaff();

    } catch (error) {
      toast.dismiss(loadToast);
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This will remove their access.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User removed");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Styles
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition text-slate-700 bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <PageHeader 
        title="Staff Registry" 
        subtitle="Manage Teachers and Administrators"
        backPath="/dashboard"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: CREATE FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-900 rounded-lg text-white">
                    <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Add New Staff</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role Selector */}
                <div>
                    <label className={labelClass}>Role Access</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'TEACHER'})}
                            className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${formData.role === 'TEACHER' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Briefcase size={16}/> Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, role: 'ADMIN'})}
                            className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all ${formData.role === 'ADMIN' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Shield size={16}/> Admin
                        </button>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Staff ID</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input required placeholder="e.g. TCH-001" value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input required placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input required type="email" placeholder="staff@school.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input required type="password" placeholder="••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <UserPlus size={18} />}
                    Create Account
                </button>
            </form>
        </div>

        {/* RIGHT: LIST VIEW */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Current Staff List</h3>
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                    {staff.length} Active
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID & Name</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400"/></td></tr>
                        ) : staff.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400">No staff found.</td></tr>
                        ) : (
                            staff.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {user.role === 'ADMIN' ? <Shield size={12}/> : <Briefcase size={12}/>}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700">{user.fullName}</div>
                                        <div className="text-xs text-slate-400 font-mono">{user.schoolId}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(user.id)} className="text-slate-300 hover:text-red-500 transition-colors">
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

      </div>
    </div>
  );
};

export default StaffManager;