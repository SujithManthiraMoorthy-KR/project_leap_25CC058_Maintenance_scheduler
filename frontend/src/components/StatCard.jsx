import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, colorScheme = 'blue', onClick }) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    }
  };

  const currentScheme = colorStyles[colorScheme] || colorStyles.blue;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
          {trend && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${currentScheme.bg} ${currentScheme.text} ${currentScheme.border} border`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
