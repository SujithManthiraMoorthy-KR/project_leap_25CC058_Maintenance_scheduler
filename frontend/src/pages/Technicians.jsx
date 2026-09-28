import React, { useState, useEffect } from 'react';
import { TechnicianTable } from '../components/TechnicianTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { IconUsers, IconPlus, IconWrench, IconCheckCircle } from '../components/Icons';
import { technicianService } from '../services/technicianService';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../components/Toast';

export const Technicians = () => {
  const { showToast } = useToast();

  const [technicians, setTechnicians] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal state
  const [selectedTech, setSelectedTech] = useState(null);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [techList, tList] = await Promise.all([
        technicianService.getTechnicians(),
        maintenanceService.getAllTasks()
      ]);
      setTechnicians(techList || []);
      setTasks(tList || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialization.trim() || !formData.phone.trim()) {
      showToast('All technician fields are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await technicianService.createTechnician(formData);
      showToast('Technician created successfully', 'success');
      setIsAddOpen(false);
      setFormData({ name: '', specialization: '', phone: '' });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await technicianService.deleteTechnician(deleteTarget.id);
      showToast('Technician deleted successfully', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const assignedTasksForSelected = selectedTech 
    ? tasks.filter(t => t.technician && t.technician.id === selectedTech.id)
    : [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Certified Technicians Directory</h2>
          <p className="text-xs text-slate-500">Manage plant maintenance engineers, specializations, and work allocations</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <IconPlus className="w-5 h-5" />
          Add Technician
        </button>
      </div>

      {/* Table / Loading / Empty */}
      {loading ? (
        <LoadingSpinner label="Loading technician crew..." />
      ) : technicians.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No technicians registered"
          description="Add skilled technicians to assign them to equipment maintenance tasks."
          actionLabel="Add Technician"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <TechnicianTable
          technicians={technicians}
          tasks={tasks}
          onView={(tech) => setSelectedTech(tech)}
          onDelete={(tech) => setDeleteTarget(tech)}
        />
      )}

      {/* Add Technician Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Certified Technician"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Technician Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specialization / Certification *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hydraulics & Heavy Motors"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
            >
              {submitting ? 'Adding...' : 'Add Technician'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Technician Detail View Modal */}
      <Modal
        isOpen={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        title={`Technician Profile: ${selectedTech?.name}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase">Specialization</p>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedTech?.specialization}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase">Contact Phone</p>
              <p className="font-mono text-slate-800 text-sm mt-0.5">{selectedTech?.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Assigned Maintenance Work Orders ({assignedTasksForSelected.length})
            </h4>
            
            {assignedTasksForSelected.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {assignedTasksForSelected.map(t => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-blue-600">Task #{t.id}</span>
                      <span className="ml-2 font-bold text-slate-800">{t.machine?.name} ({t.machine?.code})</span>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs">{t.notes || 'Routine check'}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">No tasks assigned to this technician.</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedTech(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Technician"
        message={`Are you sure you want to remove technician "${deleteTarget?.name}"?`}
        confirmText="Delete"
      />
    </div>
  );
};
