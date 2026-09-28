import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MaintenanceProgress } from '../components/MaintenanceProgress';
import { StatusBadge } from '../components/StatusBadge';
import { MaintenanceTable } from '../components/MaintenanceTable';
import { UsageTable } from '../components/UsageTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { 
  IconCog, 
  IconClock, 
  IconActivity, 
  IconWrench, 
  IconPlus, 
  IconCheckCircle, 
  IconAlertTriangle,
  IconUsers
} from '../components/Icons';
import { machineService } from '../services/machineService';
import { maintenanceService } from '../services/maintenanceService';
import { usageService } from '../services/usageService';
import { technicianService } from '../services/technicianService';
import { useToast } from '../components/Toast';

export const MachineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [machine, setMachine] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complete Task Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Create Task Modal
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [m, tList, uLogs, techList] = await Promise.all([
        machineService.getMachineById(id),
        maintenanceService.getTasksByMachine(id),
        usageService.getUsageLogsByMachine(id),
        technicianService.getTechnicians()
      ]);
      setMachine(m);
      setTasks(tList || []);
      setUsageLogs(uLogs || []);
      setTechnicians(techList || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMachineStatus = () => {
    if (!machine) return 'normal';
    if (machine.maintenanceType === 'HOURS') {
      if (machine.currentUsageHours >= machine.intervalValue) return 'overdue';
      if (machine.currentUsageHours >= (machine.intervalValue * 0.90)) return 'near';
    } else {
      if (machine.lastMaintenanceDate) {
        const last = new Date(machine.lastMaintenanceDate);
        const today = new Date();
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays > machine.intervalValue) return 'overdue';
        if (diffDays >= Math.ceil(machine.intervalValue * 0.90)) return 'near';
      }
    }
    return 'normal';
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await maintenanceService.createTask({
        machineId: machine.id,
        technicianId: selectedTechId ? Number(selectedTechId) : null,
        notes: taskNotes
      });
      showToast('Maintenance task created successfully', 'success');
      setIsCreateTaskOpen(false);
      setTaskNotes('');
      setSelectedTechId('');
      loadDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await maintenanceService.completeTask(selectedTask.id, completeNotes);
      showToast('Maintenance task marked as completed! Machine cycle reset.', 'success');
      setSelectedTask(null);
      setCompleteNotes('');
      loadDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading equipment details..." />;
  }

  if (!machine) {
    return (
      <div className="text-center p-12">
        <h3 className="text-lg font-bold text-slate-800">Machine Not Found</h3>
        <button onClick={() => navigate('/machines')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Machines
        </button>
      </div>
    );
  }

  const currentStatus = getMachineStatus();
  const openTask = tasks.find(t => t.status === 'OPEN');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <IconCog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">{machine.name}</h2>
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {machine.code}
              </span>
              <StatusBadge type="machine" status={currentStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered preventive equipment • Maintenance interval monitored per 90% threshold rule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/usage-logs')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <IconActivity className="w-4 h-4 text-blue-600" />
            Log Usage
          </button>
          
          {!openTask && (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <IconWrench className="w-4 h-4" />
              Schedule Task
            </button>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Maintenance Type</p>
          <p className="text-lg font-bold text-slate-800">{machine.maintenanceType}</p>
          <p className="text-xs text-slate-500 mt-1">Scheduled by {machine.maintenanceType === 'HOURS' ? 'Usage Hours' : 'Calendar Days'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Interval Value</p>
          <p className="text-lg font-bold text-slate-800">{machine.intervalValue} {machine.maintenanceType}</p>
          <p className="text-xs text-slate-500 mt-1">Trigger at 90% ({Math.ceil(machine.intervalValue * 0.90)})</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Usage</p>
          <p className="text-lg font-bold text-blue-600 font-mono">
            {machine.currentUsageHours != null ? `${machine.currentUsageHours} Hours` : '0 Hours'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Updated via usage logs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Last Maintenance</p>
          <p className="text-lg font-bold text-slate-800 font-mono">
            {machine.lastMaintenanceDate || 'Not Recorded'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Resets upon completion</p>
        </div>
      </div>

      {/* Progress & Open Task Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Preventive Maintenance Cycle Progress</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <MaintenanceProgress machine={machine} showDetails={true} />
          </div>
        </div>

        {/* Current Open Task Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-3">Active Maintenance Task</h3>
          {openTask ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-900">Task #{openTask.id}</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded-full">OPEN</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">{openTask.notes || 'Routine maintenance check.'}</p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Technician: <strong className="text-slate-800">{openTask.technician?.name || 'Unassigned'}</strong></p>
              </div>
              <button
                onClick={() => setSelectedTask(openTask)}
                className="w-full mt-2 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Mark Task Completed
              </button>
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
              <IconCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Open Tasks</p>
              <p className="text-xs text-slate-400 mt-1">Equipment operating normally within limits.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">Maintenance History</h3>
        {tasks.length > 0 ? (
          <MaintenanceTable tasks={tasks} onCompleteTask={(t) => setSelectedTask(t)} />
        ) : (
          <p className="text-xs text-slate-400 italic">No maintenance history recorded for this unit.</p>
        )}
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">Usage Hour Logs</h3>
        {usageLogs.length > 0 ? (
          <UsageTable logs={usageLogs} />
        ) : (
          <p className="text-xs text-slate-400 italic">No usage logs recorded for this unit.</p>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title={`Schedule Maintenance Task - ${machine.code}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Technician
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Technician (Optional)</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Notes / Instructions
            </label>
            <textarea
              rows="3"
              placeholder="Enter work details, required tool checks..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateTaskOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={`Complete Maintenance Task #${selectedTask?.id}`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <p><strong className="text-slate-800">Machine:</strong> {selectedTask?.machine?.name} ({selectedTask?.machine?.code})</p>
            <p><strong className="text-slate-800">Assigned Tech:</strong> {selectedTask?.technician?.name || 'Unassigned'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Technician Notes / Completion Remarks
            </label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Replaced oil filters, checked bearing tension. All tests passed cleanly."
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
            ℹ️ Submitting completion will mark task as COMPLETED and automatically reset machine usage hours & last maintenance date.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Confirm Completion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
