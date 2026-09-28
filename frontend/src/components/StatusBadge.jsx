import React from 'react';

export const StatusBadge = ({ type, status, text }) => {
  // If machine status check
  if (type === 'machine') {
    let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let label = text || 'Normal';

    if (status === 'overdue') {
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse-subtle';
      label = text || 'Overdue';
    } else if (status === 'near') {
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      label = text || 'Near Maintenance';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'overdue' ? 'bg-rose-500' : status === 'near' ? 'bg-amber-500' : 'bg-emerald-500'
        }`}></span>
        {label}
      </span>
    );
  }

  // Task status
  if (type === 'task') {
    const isOpen = status === 'OPEN';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
        isOpen ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        {isOpen ? 'OPEN' : 'COMPLETED'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};
