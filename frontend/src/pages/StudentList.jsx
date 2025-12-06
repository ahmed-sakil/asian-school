import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Filter, RefreshCw, 
    ChevronRight, Loader2, Users 
} from 'lucide-react';

// 1. IMPORT HEADER
import PageHeader from '../components/PageHeader';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        classLevel: '9', 
        sectionName: 'A' 
    });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users/students`, {
                params: {
                    classLevel: filters.classLevel,
                    sectionName: filters.sectionName
                }
            });
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* 2. PAGE HEADER */}
            <PageHeader 
                title="Student Directory" 
                subtitle="Manage and view student enrollments"
                backPath="/dashboard"
                rightElement={
                    <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        {students.length} Students Found
                    </span>
                }
            />

            <div className="space-y-6">
                
                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                    
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* Class Filter */}
                        <div className="w-full md:w-48">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">
                                Class Level
                            </label>
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <select 
                                    name="classLevel" 
                                    value={filters.classLevel} 
                                    onChange={handleFilterChange} 
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                                >
                                    {[6, 7, 8, 9, 10].map(c => <option key={c} value={c}>Class {c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Section Filter */}
                        <div className="w-full md:w-48">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">
                                Section
                            </label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <select 
                                    name="sectionName" 
                                    value={filters.sectionName} 
                                    onChange={handleFilterChange} 
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                                >
                                    {['A', 'B', 'C'].map(s => <option key={s} value={s}>Section {s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button 
                        onClick={fetchStudents} 
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-lg shadow-md hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium w-full md:w-auto justify-center"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Refresh Data
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Enrollment Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={32} className="animate-spin text-slate-400" />
                                                <span className="text-sm">Fetching students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={32} className="text-slate-300" />
                                                <span className="font-medium">No students found</span>
                                                <span className="text-sm text-slate-400">Try changing the class or section filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => {
                                        const enrollment = student.enrollments[0];
                                        const sectionText = enrollment 
                                            ? `${enrollment.section.classLevel} - ${enrollment.section.sectionName}` 
                                            : 'Not Enrolled';

                                        return (
                                            <tr 
                                                key={student.id} 
                                                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                                onClick={() => navigate(`/students/${student.id}`)}
                                            >
                                                {/* ID Column */}
                                                <td className="p-4">
                                                    <span className="font-mono text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {student.schoolId}
                                                    </span>
                                                </td>

                                                {/* Name Column */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">
                                                            {student.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-700 text-sm">{student.fullName}</p>
                                                            <p className="text-xs text-slate-400">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Column */}
                                                <td className="p-4">
                                                    {enrollment ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Class {sectionText}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                                            Not Active
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action Column */}
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            navigate(`/students/${student.id}`);
                                                        }} 
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        View Profile <ChevronRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;