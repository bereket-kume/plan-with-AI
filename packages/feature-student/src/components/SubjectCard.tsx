import React from 'react';

interface SubjectCardProps {
  icon: React.ReactNode;
  title: string;
  units: number;
  progress: number;
  color: string;
}

export const SubjectCard = ({ icon, title, units, progress, color }: SubjectCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-xl bg-slate-50 text-slate-700`}>
        {icon}
      </div>
      {/* Circular Progress Placeholder */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
            className={color}
            style={{ strokeDasharray: 125.6, strokeDashoffset: 125.6 - (125.6 * progress) / 100 }} 
          />
        </svg>
        <span className="absolute text-[10px] font-bold">{progress}%</span>
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-800 leading-tight">{title}</h3>
    <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')}`}></span>
      {units} Units Total
    </p>
  </div>
);