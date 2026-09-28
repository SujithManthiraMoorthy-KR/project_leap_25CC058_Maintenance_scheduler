import React from 'react';
import { StatusBadge } from './StatusBadge';
import { MaintenanceProgress } from './MaintenanceProgress';
import { IconEye, IconTrash } from './Icons';

export const MachineTable = ({ machines, onView, onDelete, getMachineStatus }) => {
  if (!machines || machines.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Code</th>
            <th className="py-3.5 px-4">Machine Name</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4 min-w-[180px]">Usage / Interval</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {machines.map((machine) => {
            const statusKey = getMachineStatus ? getMachineStatus(machine) : 'normal';
            return (
              <tr key={machine.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-600">
                  {machine.code}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {machine.name}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600">
                    {machine.maintenanceType}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <MaintenanceProgress machine={machine} showDetails={true} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge type="machine" status={statusKey} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(machine)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <IconEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(machine)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Machine"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
