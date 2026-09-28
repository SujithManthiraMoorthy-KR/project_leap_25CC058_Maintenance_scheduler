import React from 'react';
import { StatusBadge } from './StatusBadge';
import { IconCheckCircle } from './Icons';

export const MaintenanceTable = ({ tasks, onCompleteTask }) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Task ID</th>
            <th className="py-3.5 px-4">Machine</th>
            <th className="py-3.5 px-4">Assigned Technician</th>
            <th className="py-3.5 px-4">Due Target</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Notes</th>
            <th className="py-3.5 px-4">Completed At</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {tasks.map((task) => {
            const isOpen = task.status === 'OPEN';
            const machineName = task.machine ? task.machine.name : 'Unknown Machine';
            const machineCode = task.machine ? task.machine.code : '';
            const techName = task.technician ? task.technician.name : 'Unassigned';

            let dueTarget = '—';
            if (task.dueUsageHours != null) {
              dueTarget = `${task.dueUsageHours} Hours`;
            } else if (task.dueDate) {
              dueTarget = task.dueDate;
            }

            return (
              <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">
                  #{task.id}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-800">{machineName}</div>
                  <div className="text-xs font-mono text-blue-600">{machineCode}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    task.technician ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {techName}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                  {dueTarget}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge type="task" status={task.status} />
                </td>
                <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 text-xs" title={task.notes || ''}>
                  {task.notes || 'No notes'}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap font-mono">
                  {task.completedAt ? new Date(task.completedAt).toLocaleString() : '—'}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {isOpen ? (
                    <button
                      onClick={() => onCompleteTask(task)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      <IconCheckCircle className="w-3.5 h-3.5" />
                      Complete
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                      <IconCheckCircle className="w-4 h-4 text-emerald-500" /> Done
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
