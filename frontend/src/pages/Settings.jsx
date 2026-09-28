import React, { useState } from 'react';
import { IconSettings, IconServer, IconCheckCircle, IconRefresh, IconAlertTriangle } from '../components/Icons';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../components/Toast';

export const Settings = ({ isBackendLive, setIsBackendLive }) => {
  const { showToast } = useToast();
  const [testing, setTesting] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const testBackendConnection = async () => {
    setTesting(true);
    try {
      await maintenanceService.checkMaintenance();
      setIsBackendLive(true);
      showToast('Successfully connected to Spring Boot REST Backend at http://localhost:8080/api!', 'success');
    } catch (err) {
      setIsBackendLive(false);
      showToast('Could not connect to Spring Boot backend. Running in standalone Demo/Mock Mode.', 'warning');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">System & API Settings</h2>
        <p className="text-xs text-slate-500">Configure REST backend endpoint, view business rules & database integration state</p>
      </div>

      {/* Backend API Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <IconServer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Spring Boot REST Backend Integration</h3>
              <p className="text-xs text-slate-500">Service API URL configured via environment variable</p>
            </div>
          </div>

          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
            isBackendLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {isBackendLive ? '● Live Backend' : '● Standalone Demo'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Active API Base URL (VITE_API_BASE_URL)
            </label>
            <div className="font-mono bg-white px-3 py-2 rounded-lg border border-slate-200 text-blue-600 font-bold">
              {apiBaseUrl}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <p className="text-slate-600">
              {isBackendLive 
                ? 'Your website is making live HTTP requests to Spring Boot controllers.' 
                : 'Backend server not detected on port 8080. Fallback mock state is enabled.'}
            </p>

            <button
              onClick={testBackendConnection}
              disabled={testing}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <IconRefresh className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Checking Connection...' : 'Test Backend Connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Business Rules Reference Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">Enforced System Business Rules</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> 90% Threshold Auto-Trigger
            </h4>
            <p className="text-slate-600">
              When a machine reaches 90% of its usage hours or days interval (e.g., 90/100 hours or 27/30 days), an open maintenance task is automatically generated.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Single Open Task Constraint
            </h4>
            <p className="text-slate-600">
              The system prevents creation of duplicate open maintenance tasks if an open task already exists for the same equipment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cycle Reset on Completion
            </h4>
            <p className="text-slate-600">
              Marking a task completed resets the machine's usage hours counter to 0.0 and sets the last maintenance date to today.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Overdue Machinery Audit
            </h4>
            <p className="text-slate-600">
              Machinery exceeding 100% of their maintenance interval is flagged with red badges and listed in the dedicated Overdue audit tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
