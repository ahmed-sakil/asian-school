import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, UserPlus, Filter, Trash2, Edit2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
// 1. IMPORT THE NEW HEADER
import PageHeader from '../components/PageHeader'; 

const SubjectManager = () => {
  // const navigate = useNavigate(); <--- No longer needed here, handled inside Header
  const [activeTab, setActiveTab] = useState('create');
  
  // Data
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [listFilter, setListFilter] = useState('ALL');

  // Forms
  const [courseForm, setCourseForm] = useState({ name: '', code: '', classLevel: '' });
  const [assignForm, setAssignForm] = useState({ courseId: '', classLevel: '', sectionName: '', teacherId: '' });

  // Edit Mode
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- Data Loading ---
  const loadData = async () => {
    try {
      const [cRes, tRes, aRes] = await Promise.all([
        api.get('/courses/all'),
        api.get('/users/teachers'),
        api.get('/courses/assignments')
      ]);
      setCourses(cRes.data);
      setTeachers(tRes.data);
      setAssignments(aRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- Handlers ---
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading(editMode ? "Updating..." : "Creating...");
    try {
      if (editMode) {
        await api.put(`/courses/${editId}`, { name: courseForm.name, code: courseForm.code });
        toast.success("Subject Updated! ✅");
        setEditMode(false); setEditId(null);
      } else {
        await api.post('/courses/create', courseForm);
        toast.success("Subject Added! 📚");
      }
      toast.dismiss(loadToast); loadData(); setCourseForm({ name: '', code: '', classLevel: '' });
    } catch (error) {
      toast.dismiss(loadToast); toast.error(error.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this subject?")) return;
    try { await api.delete(`/courses/${id}`); toast.success("Deleted"); loadData(); } 
    catch (error) { toast.error("Failed to delete"); }
  };

  const handleEdit = (course) => {
    setEditMode(true); setEditId(course.id);
    setCourseForm({ name: course.name, code: course.code, classLevel: course.classLevel });
  };

  const cancelEdit = () => {
    setEditMode(false); setEditId(null); setCourseForm({ name: '', code: '', classLevel: '' });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Assigning...");
    try {
      await api.post('/courses/assign', assignForm);
      toast.dismiss(loadToast); toast.success("Teacher Assigned! 🎓"); loadData();
      setAssignForm({ ...assignForm, teacherId: '' }); 
    } catch (error) { toast.dismiss(loadToast); toast.error("Assignment Failed"); }
  };

  const filteredCourses = listFilter === 'ALL' ? courses : courses.filter(c => c.classLevel === parseInt(listFilter));
  
  // Design Variables
  const inputClass = "w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition duration-200 text-slate-700 placeholder-slate-400 bg-white";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 2. USE THE NEW HEADER COMPONENT */}
      <PageHeader 
        title="Subject & Workload Manager" 
        subtitle="Define curriculum and assign faculty"
        backPath="/dashboard" 
      />

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('create')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'create' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <BookOpen size={18} /> 1. Define Subjects
        </button>
        <button onClick={() => setActiveTab('assign')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'assign' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <UserPlus size={18} /> 2. Assign Teachers
        </button>
      </div>

      {/* --- TAB 1: DEFINE COURSES --- */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form */}
          <div className={`lg:col-span-4 p-6 rounded-xl border shadow-sm sticky top-6 transition-colors duration-300 ${editMode ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-bold text-lg ${editMode ? 'text-amber-800' : 'text-slate-800'}`}>{editMode ? '✏️ Edit Subject' : '➕ Add New Subject'}</h3>
              {editMode && <button onClick={cancelEdit} className="p-1 rounded-full hover:bg-amber-100 text-amber-600 transition"><X size={18}/></button>}
            </div>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className={labelClass}>Class Level <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required disabled={editMode} value={courseForm.classLevel} onChange={e => setCourseForm({...courseForm, classLevel: e.target.value})} className={`${inputClass} appearance-none cursor-pointer ${editMode ? 'bg-slate-100 text-slate-500' : ''}`}>
                    <option value="">-- Select Class --</option>
                    {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelClass}>Subject Name <span className="text-red-500">*</span></label><input required placeholder="e.g. Physics" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className={inputClass}/></div>
              <div><label className={labelClass}>Unique Code <span className="text-red-500">*</span></label><input required placeholder="e.g. PHY-09" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} className={inputClass} /></div>
              <button type="submit" className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md text-white flex justify-center items-center gap-2 transition-all transform active:scale-95 ${editMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>{editMode ? <><Save size={18}/> Update</> : 'Create Course'}</button>
            </form>
          </div>

          {/* Right: List */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
              <h3 className="font-semibold text-slate-800">Available Courses</h3>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400"/>
                <select value={listFilter} onChange={(e) => setListFilter(e.target.value)} className="pl-2 pr-8 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-300 outline-none text-slate-600">
                  <option value="ALL">Show All Classes</option>
                  <option disabled>──────────</option>
                  {[6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400"><BookOpen size={48} className="mb-2 opacity-20"/><p>No subjects found.</p></div>
              ) : (
                <ul className="space-y-2">
                  {filteredCourses.map(c => (
                    <li key={c.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all group">
                      <div>
                        <div className="flex items-center gap-3"><strong className="text-slate-800 text-lg">{c.name}</strong><span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded text-xs font-bold uppercase">Class {c.classLevel}</span></div>
                        <div className="text-slate-500 text-sm mt-1">Code: <span className="font-mono text-slate-600">{c.code}</span></div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={18}/></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ASSIGN TEACHERS --- */}
      {activeTab === 'assign' && (
        <div>
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-200 pb-2"><UserPlus size={18}/> <h3>Assign Workload</h3></div>
            <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3"><label className={labelClass}>Subject <span className="text-red-500">*</span></label><select required value={assignForm.courseId} onChange={e => setAssignForm({...assignForm, courseId: e.target.value})} className={inputClass}><option value="">-- Select Subject --</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name} (Class {c.classLevel})</option>)}</select></div>
              <div className="md:col-span-2"><label className={labelClass}>Class</label><select required value={assignForm.classLevel} onChange={e => setAssignForm({...assignForm, classLevel: e.target.value})} className={inputClass}><option value="">-</option>{[6,7,8,9,10].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="md:col-span-2"><label className={labelClass}>Section</label><select required value={assignForm.sectionName} onChange={e => setAssignForm({...assignForm, sectionName: e.target.value})} className={inputClass}><option value="">-</option>{['A','B','C'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="md:col-span-3"><label className={labelClass}>Assign Teacher <span className="text-red-500">*</span></label><select required value={assignForm.teacherId} onChange={e => setAssignForm({...assignForm, teacherId: e.target.value})} className={inputClass}><option value="">-- Select Teacher --</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select></div>
              <div className="md:col-span-2"><button type="submit" className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition-colors flex justify-center items-center gap-2"><Save size={18} /> Assign</button></div>
            </form>
           </div>
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead><tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider"><th className="p-4 font-semibold">Class / Section</th><th className="p-4 font-semibold">Subject</th><th className="p-4 font-semibold">Assigned Teacher</th></tr></thead>
               <tbody className="divide-y divide-slate-100">
                 {assignments.map(a => (<tr key={a.id} className="hover:bg-slate-50 transition-colors"><td className="p-4 text-slate-700">Class {a.section.classLevel} - {a.section.sectionName}</td><td className="p-4 font-semibold text-slate-800">{a.course.name}</td><td className="p-4"><span className={`px-2.5 py-1 rounded text-sm font-medium ${a.teacher ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-red-50 text-red-600'}`}>{a.teacher ? a.teacher.fullName : 'No Teacher'}</span></td></tr>))}
                 {assignments.length === 0 && (<tr><td colSpan="3" className="p-8 text-center text-slate-400">No teachers assigned yet.</td></tr>)}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;