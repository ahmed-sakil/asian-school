import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import NoticeBoard from '../components/NoticeBoard'; 
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const NoticeManager = () => {
  const navigate = useNavigate();
  
  // State for Form and Refresh Logic
  const [form, setForm] = useState({ title: '', content: '', category: 'GENERAL' });
  const [refreshKey, setRefreshKey] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.post('/notices/create', form);
      toast.success("Notice Posted! 📢");
      
      setForm({ title: '', content: '', category: 'GENERAL' });
      // Triggers the NoticeBoard to re-fetch without reloading page
      setRefreshKey(prev => prev + 1); 

    } catch (error) {
      toast.error("Failed to post notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common Input Styles for consistency
  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-700 placeholder-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="flex items-center mb-8 border-b border-slate-200 pb-6">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Manage notices for students and faculty</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: CREATE FORM (Span 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xl">✍️</div>
            <h3 className="font-semibold text-slate-800">Compose Notice</h3>
          </div>
          
          <form onSubmit={handlePost} className="space-y-5">
            <div>
              <label className={labelClass}>Title</label>
              <input 
                required 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className={inputClass}
                placeholder="e.g. Winter Break Schedule" 
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})} 
                  className={`${inputClass} appearance-none bg-white cursor-pointer`}
                >
                  <option value="GENERAL">General Info</option>
                  <option value="ACADEMIC">Academic / Exam</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EVENT">Event / Sports</option>
                </select>
                {/* Custom arrow for select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Message</label>
              <textarea 
                required 
                rows="6" 
                value={form.content} 
                onChange={e => setForm({...form, content: e.target.value})} 
                className={`${inputClass} resize-none`}
                placeholder="Write the full details here..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isSubmitting ? 'Posting...' : 'Post Notice'}
            </button>
          </form>
        </div>

        {/* RIGHT: PREVIEW BOARD (Span 8 cols) */}
        <div className="lg:col-span-8">
           {/* The key prop ensures this component refreshes when we update refreshKey */}
          <NoticeBoard key={refreshKey} />
        </div>

      </div>
    </div>
  );
};

export default NoticeManager;