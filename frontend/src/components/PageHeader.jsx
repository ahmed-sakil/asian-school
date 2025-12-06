import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title, subtitle, backPath = '/dashboard', rightElement }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
      <div className="flex items-center">
        {/* Back Button */}
        <button 
          onClick={() => navigate(backPath)} 
          className="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition duration-200"
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Optional: Right side button (like "Save" or "Export") */}
      {rightElement && (
        <div>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default PageHeader;