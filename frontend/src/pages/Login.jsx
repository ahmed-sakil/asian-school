import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'; 
import api from '../api'; 

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        schoolId: '',
        password: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid School ID or Password.');
        } finally {
            setLoading(false);
        }
    };

    // Shared styling for inputs
    const inputWrapperClass = "relative group";
    const inputIconClass = "absolute left-3 top-3.5 text-slate-400 group-focus-within:text-slate-800 transition-colors";
    const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 rounded-b-[3rem] -z-10"></div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-100">
                
                {/* Header Section */}
                <div className="bg-white p-8 pb-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-300 rotate-3 transition-transform hover:rotate-0 duration-300 border-4 border-white">
                        {/* ✅ UPDATED ICON */}
                        <GraduationCap size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Asian School</h2>
                    <p className="text-slate-500 text-sm mt-2">Welcome back! Please sign in to continue.</p>
                </div>

                {/* Form Section */}
                <div className="p-8 pt-2">
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-pulse">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* School ID Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">School ID / User ID</label>
                            <div className={inputWrapperClass}>
                                <div className={inputIconClass}>
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="schoolId"
                                    className={inputClass}
                                    placeholder="e.g. ST-2025-001"
                                    value={formData.schoolId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
                            <div className={inputWrapperClass}>
                                <div className={inputIconClass}>
                                    <Lock size={20} />
                                </div>
                                
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`${inputClass} pr-12`} // Extra padding for eye icon
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                {/* Toggle Eye Button */}
                                <button
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button (UPDATED COLOR) */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            Managed by Asian School Administration
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;