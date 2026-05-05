import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  color: string;
}

export const StatCard = ({ icon, label, value, subValue, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>{icon}</div>
      <span className="text-xs font-semibold text-emerald-500">{subValue}</span>
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    <p className="text-sm text-slate-400 font-medium">{label}</p>
  </div>
);