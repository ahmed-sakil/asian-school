import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, Calendar, Tag, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices/all');
      setNotices(data);
    } catch (error) {
      console.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted");
      fetchNotices();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Helper for dynamic styling based on category
  const getCategoryStyles = (category) => {
    switch (category) {
        case 'HOLIDAY': return { border: 'border-l-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' };
        case 'EVENT':   return { border: 'border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' };
        case 'ACADEMIC':return { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' };
        default:        return { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' }; // GENERAL
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
    );
  }

  if (notices.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <BellOff size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">No recent announcements.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map(notice => {
        const styles = getCategoryStyles(notice.category);
        
        return (
            <div 
                key={notice.id} 
                className={`relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${styles.border}`}
            >
                {/* Header: Title & Date */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-slate-800 text-base leading-tight">
                            {notice.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                            {/* Category Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}>
                                <Tag size={10} /> {notice.category}
                            </span>
                            {/* Date */}
                            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                <Calendar size={12} />
                                {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Admin Delete Action */}
                    {user.role === 'ADMIN' && (
                        <button 
                            onClick={() => handleDelete(notice.id)} 
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors absolute top-3 right-3"
                            title="Delete Notice"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <p className="text-sm text-slate-600 leading-relaxed">
                    {notice.content}
                </p>
            </div>
        );
      })}
    </div>
  );
};

export default NoticeBoard;