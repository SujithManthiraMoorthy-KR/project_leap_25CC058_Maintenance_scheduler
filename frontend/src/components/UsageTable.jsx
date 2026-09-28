import React from 'react';

export const UsageTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Log ID</th>
            <th className="py-3.5 px-4">Machine</th>
            <th className="py-3.5 px-4">Logged Hours</th>
            <th className="py-3.5 px-4 text-right">Logged Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {logs.map((log) => {
            const mName = log.machine ? log.machine.name : 'Unknown';
            const mCode = log.machine ? log.machine.code : '';

            return (
              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-400">
                  #{log.id}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-800">{mName}</span>
                  <span className="ml-2 font-mono text-xs text-blue-600">({mCode})</span>
                </td>
                <td className="py-3.5 px-4 font-bold text-blue-600 font-mono">
                  +{log.usageHours} hrs
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                  {new Date(log.loggedAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
