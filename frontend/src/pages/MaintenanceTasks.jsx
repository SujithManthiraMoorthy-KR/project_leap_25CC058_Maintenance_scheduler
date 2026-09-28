import React, { useState, useEffect } from 'react';
import { MaintenanceTable } from '../components/MaintenanceTable';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { IconWrench, IconPlus, IconSearch, IconFilter, IconCheckCircle } from '../components/Icons';
import { maintenanceService } from '../services/maintenanceService';
import { machineService } from '../services/machineService';
import { technicianService } from '../services/technicianService';
import { useToast } from '../components/Toast';

export const MaintenanceTasks = ({ searchQuery: globalSearch }) => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Tab state
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OPEN, COMPLETED
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  // Complete Modal State
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMachineId, setCreateMachineId] = useState('');
  const [createTechId, setCreateTechId] = useState('');
  const [createNotes, setCreateNotes] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tList, mList, techList] = await Promise.all([
        maintenanceService.getAllTasks(),
        machineService.getMachines(),
        technicianService.getTechnicians()
      ]);
      setTasks(tList || []);
      setMachines(mList || []);
      setTechnicians(techList || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!taskToComplete) return;

    setSubmitting(true);
    try {
      await maintenanceService.completeTask(taskToComplete.id, completeNotes);
      showToast('Task marked as COMPLETED! Machine maintenance cycle reset.', 'success');
      setTaskToComplete(null);
      setCompleteNotes('');
      loadTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createMachineId) {
      showToast('Please select a machine', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await maintenanceService.createTask({
        machineId: Number(createMachineId),
        technicianId: createTechId ? Number(createTechId) : null,
        notes: createNotes
      });
      showToast('Maintenance task created successfully', 'success');
      setIsCreateModalOpen(false);
      setCreateMachineId('');
      setCreateTechId('');
      setCreateNotes('');
      loadTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const search = globalSearch || localSearch;

  const filteredTasks = tasks.filter(t => {
    const matchesTab = activeTab === 'ALL' || t.status === activeTab;
    const matchesMachine = !selectedMachineFilter || (t.machine && t.machine.id === Number(selectedMachineFilter));
    const matchesSearch = !search || 
      (t.machine && (t.machine.name.toLowerCase().includes(search.toLowerCase()) || t.machine.code.toLowerCase().includes(search.toLowerCase()))) ||
      (t.technician && t.technician.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesMachine && matchesSearch;
  });

  const openCount = tasks.filter(t => t.status === 'OPEN').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Preventive Maintenance Tasks</h2>
          <p className="text-xs text-slate-500">Track open work orders, technician assignments, and completion logs</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <IconPlus className="w-5 h-5" />
          Create Maintenance Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-4 font-bold text-xs transition-all border-b-2 ${
            activeTab === 'ALL' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('OPEN')}
          className={`pb-3 px-4 font-bold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'OPEN' 
              ? 'border-amber-500 text-amber-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Open Tasks</span>
          <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-extrabold">{openCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-4 font-bold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'COMPLETED' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Completed Tasks</span>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-extrabold">{completedCount}</span>
        </button>
      </div>

      {/* Search & Machine Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, notes, equipment..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <IconFilter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMachineFilter}
            onChange={(e) => setSelectedMachineFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          >
            <option value="">All Equipment</option>
            {machines.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Loading / Empty */}
      {loading ? (
        <LoadingSpinner label="Loading maintenance tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={IconWrench}
          title="No maintenance tasks found"
          description="Tasks are automatically generated when equipment usage reaches 90% threshold, or created manually."
          actionLabel="Create Task"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <MaintenanceTable
          tasks={filteredTasks}
          onCompleteTask={(t) => setTaskToComplete(t)}
        />
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Preventive Maintenance Task"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Machine *
            </label>
            <select
              required
              value={createMachineId}
              onChange={(e) => setCreateMachineId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Choose Machine --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Technician
            </label>
            <select
              value={createTechId}
              onChange={(e) => setCreateTechId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Unassigned (Optional)</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Notes & Special Instructions
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Perform oil filter change, calibrate pressure sensors..."
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
            >
              {submitting ? 'Creating...' : 'Schedule Work Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        isOpen={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        title={`Complete Maintenance Work Order #${taskToComplete?.id}`}
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <p><strong className="text-slate-800">Machine:</strong> {taskToComplete?.machine?.name} ({taskToComplete?.machine?.code})</p>
            <p><strong className="text-slate-800">Assigned Tech:</strong> {taskToComplete?.technician?.name || 'Unassigned'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Technician Notes / Work Summary *
            </label>
            <textarea
              rows="3"
              required
              placeholder="Describe work performed, replaced parts, testing results..."
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
            ✅ Completing this task will reset the machine's usage hours counter to 0.0 and update the last maintenance date.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTaskToComplete(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Mark Completed'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
