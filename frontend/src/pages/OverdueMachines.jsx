import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { IconAlertTriangle, IconWrench, IconCheckCircle, IconPlus } from '../components/Icons';
import { maintenanceService } from '../services/maintenanceService';
import { technicianService } from '../services/technicianService';
import { useToast } from '../components/Toast';

export const OverdueMachines = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [overdueList, setOverdueList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Creation modal for overdue item
  const [targetMachine, setTargetMachine] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOverdueData();
  }, []);

  const loadOverdueData = async () => {
    setLoading(true);
    try {
      const [ovList, techList] = await Promise.all([
        maintenanceService.getOverdueMachines(),
        technicianService.getTechnicians()
      ]);
      setOverdueList(ovList || []);
      setTechnicians(techList || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!targetMachine) return;

    setSubmitting(true);
    try {
      await maintenanceService.createTask({
        machineId: targetMachine.id,
        technicianId: selectedTechId ? Number(selectedTechId) : null,
        notes: notes || `URGENT OVERDUE MAINTENANCE for ${targetMachine.code}`
      });
      showToast('Urgent maintenance task scheduled successfully!', 'success');
      setTargetMachine(null);
      setNotes('');
      setSelectedTechId('');
      loadOverdueData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Auditing overdue machinery..." />;
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Prominent Warning Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white rounded-2xl p-6 shadow-xl border border-rose-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 animate-pulse-subtle">
            <IconAlertTriangle className="w-8 h-8 text-rose-100" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Critical Overdue Machinery Audit</h2>
            <p className="text-xs text-rose-100 mt-1 max-w-xl">
              Equipment listed below has exceeded maximum preventive maintenance limits based on usage hours or calendar intervals. Immediate maintenance intervention required to prevent component failure.
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-rose-950/60 rounded-xl border border-rose-400/30 text-right self-end md:self-auto">
          <span className="text-[10px] uppercase font-bold text-rose-200 block">Total Overdue Units</span>
          <span className="text-2xl font-black text-white">{overdueList.length}</span>
        </div>
      </div>

      {overdueList.length === 0 ? (
        <EmptyState
          icon={IconCheckCircle}
          title="All Equipment Operating within Normal Limits!"
          description="Great job! There are currently zero machinery units past their preventive maintenance limits."
          actionLabel="View All Machines"
          onAction={() => navigate('/machines')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-rose-50/30 flex items-center justify-between">
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              Overdue Machinery Action List
            </h3>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              High Priority
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Machine Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Usage / Interval</th>
                  <th className="py-3.5 px-4">Amount Overdue</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {overdueList.map((m) => {
                  let overdueAmountStr = '';
                  if (m.maintenanceType === 'HOURS') {
                    const diff = (m.currentUsageHours || 0) - m.intervalValue;
                    overdueAmountStr = `+${diff.toFixed(1)} Hours Overdue`;
                  } else {
                    if (m.lastMaintenanceDate) {
                      const last = new Date(m.lastMaintenanceDate);
                      const today = new Date();
                      const days = Math.floor((today - last) / (1000 * 60 * 60 * 24));
                      const diffDays = days - m.intervalValue;
                      overdueAmountStr = `+${diffDays} Days Overdue`;
                    }
                  }

                  return (
                    <tr key={m.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs font-bold text-rose-600">
                        {m.code}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {m.name}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                          {m.maintenanceType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        {m.maintenanceType === 'HOURS' 
                          ? `${m.currentUsageHours} / ${m.intervalValue} hrs`
                          : `Last: ${m.lastMaintenanceDate || 'N/A'}`
                        }
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-100 rounded-full border border-rose-200">
                          <IconAlertTriangle className="w-3.5 h-3.5" />
                          {overdueAmountStr}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setTargetMachine(m)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm transition-all"
                        >
                          <IconPlus className="w-4 h-4" />
                          Generate Maintenance Task
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      <Modal
        isOpen={!!targetMachine}
        onClose={() => setTargetMachine(null)}
        title={`Schedule Urgent Task for ${targetMachine?.code}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium">
            ⚠️ <strong>Overdue Equipment:</strong> {targetMachine?.name} ({targetMachine?.code}) requires immediate inspection.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Certified Technician
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">Select Technician (Recommended)</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Urgent Work Notes & Instructions
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Overdue maintenance: Inspect spindle bearings, check hydraulic seal leakages..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTargetMachine(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm"
            >
              {submitting ? 'Scheduling...' : 'Confirm Urgent Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
