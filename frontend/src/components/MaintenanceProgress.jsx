import React from 'react';

export const MaintenanceProgress = ({ machine, showDetails = true }) => {
  if (!machine) return null;

  const type = machine.maintenanceType;
  const interval = machine.intervalValue || 1;
  let current = 0;
  let percentage = 0;
  let isOverdue = false;
  let isNear = false;
  let labelText = '';

  if (type === 'HOURS') {
    current = machine.currentUsageHours || 0;
    percentage = Math.min(Math.round((current / interval) * 100), 100);
    isOverdue = current >= interval;
    isNear = !isOverdue && current >= (interval * 0.90);
    labelText = `${current.toFixed(1)} / ${interval} Hours`;
  } else {
    // DAYS
    if (machine.lastMaintenanceDate) {
      const lastDate = new Date(machine.lastMaintenanceDate);
      const today = new Date();
      const diffTime = Math.max(0, today - lastDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      current = diffDays;
      percentage = Math.min(Math.round((current / interval) * 100), 100);
      isOverdue = current > interval;
      isNear = !isOverdue && current >= Math.ceil(interval * 0.90);
      labelText = `${current} / ${interval} Days`;
    } else {
      labelText = `0 / ${interval} Days`;
    }
  }

  // Bar Colors
  let barColor = 'bg-blue-600';
  let textColor = 'text-slate-600';
  let badgeBg = 'bg-slate-100 text-slate-700';

  if (isOverdue) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-600 font-semibold';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (isNear) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 font-semibold';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-slate-600">{labelText}</span>
          <span className={textColor}>{percentage}%</span>
        </div>
      )}
      
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60 relative">
        {/* 90% Threshold line */}
        <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-amber-400 z-10 opacity-70" title="90% Maintenance Threshold"></div>
        
        <div 
          className={`h-full transition-all duration-500 rounded-full ${barColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {showDetails && (isNear || isOverdue) && (
        <div className="mt-1.5">
          {isOverdue ? (
            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              ⚠️ Maintenance Overdue! Action required.
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              ⚡ Maintenance Due Soon (90% threshold reached)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
