import React from 'react';
import { IconTrash, IconEye } from './Icons';

export const TechnicianTable = ({ technicians, tasks = [], onView, onDelete }) => {
  if (!technicians || technicians.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Tech ID</th>
            <th className="py-3.5 px-4">Technician Name</th>
            <th className="py-3.5 px-4">Specialization</th>
            <th className="py-3.5 px-4">Contact Phone</th>
            <th className="py-3.5 px-4">Assigned Tasks</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {technicians.map((tech) => {
            const assignedCount = tasks.filter(t => t.technician && t.technician.id === tech.id && t.status === 'OPEN').length;

            return (
              <tr key={tech.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">
                  #{tech.id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {tech.name}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {tech.specialization}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                  {tech.phone}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                    assignedCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {assignedCount} Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(tech)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Profile & Tasks"
                    >
                      <IconEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tech)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Technician"
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
