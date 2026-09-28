import React, { useState, useEffect } from 'react';
import { UsageTable } from '../components/UsageTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { IconActivity, IconAlertTriangle, IconCheckCircle } from '../components/Icons';
import { usageService } from '../services/usageService';
import { machineService } from '../services/machineService';
import { useToast } from '../components/Toast';

export const UsageLogs = () => {
  const { showToast } = useToast();
  
  const [machines, setMachines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [usageHours, setUsageHours] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, uLogs] = await Promise.all([
        machineService.getMachines(),
        usageService.getAllUsageLogs()
      ]);
      setMachines(mList || []);
      setLogs(uLogs || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setWarningMessage(null);

    if (!selectedMachineId) {
      showToast('Please select a machine', 'error');
      return;
    }

    const hours = Number(usageHours);
    if (!hours || hours <= 0) {
      showToast('Usage hours must be greater than 0', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const savedLog = await usageService.logUsage(Number(selectedMachineId), hours);
      showToast(`Logged ${hours} hours successfully!`, 'success');

      // Check if this log triggered 90% threshold
      const targetMachine = machines.find(m => m.id === Number(selectedMachineId));
      if (targetMachine) {
        const newUsage = (targetMachine.currentUsageHours || 0) + hours;
        const threshold = targetMachine.intervalValue * 0.90;
        
        if (newUsage >= threshold) {
          setWarningMessage(`⚠️ Warning: ${targetMachine.name} has reached ${newUsage.toFixed(1)} / ${targetMachine.intervalValue} hours (≥ 90% threshold). An auto-maintenance task has been triggered!`);
        }
      }

      setUsageHours('');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalLoggedHours = logs.reduce((sum, log) => sum + (log.usageHours || 0), 0);
  const selectedMachineObj = machines.find(m => m.id === Number(selectedMachineId));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Machine Usage Hours Logger</h2>
        <p className="text-xs text-slate-500">Record runtime hours for equipment. Automatically monitors 90% maintenance trigger thresholds.</p>
      </div>

      {/* Warning banner if threshold reached */}
      {warningMessage && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg flex items-center justify-between gap-4 animate-scale-up">
          <div className="flex items-center gap-3">
            <IconAlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-xs font-bold leading-snug">{warningMessage}</p>
          </div>
          <button 
            onClick={() => setWarningMessage(null)}
            className="text-white hover:text-amber-200 text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <IconActivity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Record Operational Hours</h3>
              <p className="text-xs text-slate-500">Select equipment unit</p>
            </div>
          </div>

          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Equipment *
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option value="">-- Choose Machine --</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code}) - Current: {m.currentUsageHours || 0} hrs
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Additional Operating Hours *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                placeholder="e.g. 8.5"
                value={usageHours}
                onChange={(e) => setUsageHours(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            {/* Threshold Preview Widget */}
            {selectedMachineObj && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Current Usage:</span>
                  <span className="font-mono text-blue-600">{selectedMachineObj.currentUsageHours || 0} / {selectedMachineObj.intervalValue} hrs</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>90% Maintenance Trigger:</span>
                  <span className="font-mono text-amber-600">{(selectedMachineObj.intervalValue * 0.90).toFixed(1)} hrs</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <IconActivity className="w-4 h-4" />
              {submitting ? 'Recording...' : 'Log Usage'}
            </button>
          </form>
        </div>

        {/* Stats & History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Logged Records</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{logs.length}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cumulative Usage</p>
              <p className="text-2xl font-bold text-blue-600 font-mono mt-1">{totalLoggedHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Operational Log History</h3>
            {loading ? (
              <LoadingSpinner label="Loading usage logs..." />
            ) : logs.length === 0 ? (
              <EmptyState
                icon={IconActivity}
                title="No usage logged yet"
                description="Use the form to record runtime hours for any machine."
              />
            ) : (
              <UsageTable logs={logs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
