import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MachineTable } from '../components/MachineTable';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { IconPlus, IconSearch, IconFilter, IconCog } from '../components/Icons';
import { machineService } from '../services/machineService';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../components/Toast';

export const Machines = ({ searchQuery: globalSearch }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [machines, setMachines] = useState([]);
  const [overdueMachines, setOverdueMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, HOURS, DAYS
  const [localSearch, setLocalSearch] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    maintenanceType: 'HOURS',
    intervalValue: 100,
    currentUsageHours: 0,
    lastMaintenanceDate: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    setLoading(true);
    try {
      const [mList, ovList] = await Promise.all([
        machineService.getMachines(),
        maintenanceService.getOverdueMachines()
      ]);
      setMachines(mList || []);
      setOverdueMachines(ovList || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMachineStatus = (machine) => {
    const isOverdue = overdueMachines.some(om => om.id === machine.id);
    if (isOverdue) return 'overdue';
    
    if (machine.maintenanceType === 'HOURS') {
      const threshold = (machine.intervalValue || 1) * 0.90;
      if ((machine.currentUsageHours || 0) >= threshold) return 'near';
    } else {
      if (machine.lastMaintenanceDate) {
        const last = new Date(machine.lastMaintenanceDate);
        const today = new Date();
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays >= Math.ceil(machine.intervalValue * 0.90)) return 'near';
      }
    }
    return 'normal';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Machine name is required';
    if (!formData.code.trim()) errors.code = 'Machine code is required';
    if (!formData.intervalValue || formData.intervalValue <= 0) {
      errors.intervalValue = 'Interval must be greater than 0';
    }
    if (formData.currentUsageHours < 0) {
      errors.currentUsageHours = 'Usage hours cannot be negative';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await machineService.createMachine({
        ...formData,
        intervalValue: Number(formData.intervalValue),
        currentUsageHours: Number(formData.currentUsageHours)
      });
      showToast('Machine created successfully', 'success');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        code: '',
        maintenanceType: 'HOURS',
        intervalValue: 100,
        currentUsageHours: 0,
        lastMaintenanceDate: new Date().toISOString().split('T')[0]
      });
      loadMachines();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await machineService.deleteMachine(deleteTarget.id);
      showToast('Machine deleted successfully', 'success');
      loadMachines();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const search = globalSearch || localSearch;

  const filteredMachines = machines.filter(m => {
    const matchesSearch = !search || 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'ALL' || m.maintenanceType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Equipment Machinery Directory</h2>
          <p className="text-xs text-slate-500">Manage plant equipment, usage limits, and intervals</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <IconPlus className="w-5 h-5" />
          Add Machine
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <IconFilter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interval Type:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {['ALL', 'HOURS', 'DAYS'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterType === type 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / Loading / Empty */}
      {loading ? (
        <LoadingSpinner label="Loading equipment list..." />
      ) : filteredMachines.length === 0 ? (
        <EmptyState
          icon={IconCog}
          title="No machines found"
          description={search ? `No equipment matching "${search}"` : "Get started by registering your first industrial equipment machine."}
          actionLabel="Add Machine"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <MachineTable
          machines={filteredMachines}
          getMachineStatus={getMachineStatus}
          onView={(m) => navigate(`/machines/${m.id}`)}
          onDelete={(m) => setDeleteTarget(m)}
        />
      )}

      {/* Add Machine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Equipment Machine"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Machine Name *
            </label>
            <input
              type="text"
              placeholder="e.g. CNC Milling Machine M-101"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                formErrors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500/20'
              }`}
            />
            {formErrors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unique Machine Code *
            </label>
            <input
              type="text"
              placeholder="e.g. CNC-01"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                formErrors.code ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500/20'
              }`}
            />
            {formErrors.code && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.code}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maintenance Type *
              </label>
              <select
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="HOURS">HOURS (Usage Hours)</option>
                <option value="DAYS">DAYS (Calendar Days)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maintenance Interval *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={formData.intervalValue}
                onChange={(e) => setFormData({ ...formData, intervalValue: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  formErrors.intervalValue ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.intervalValue && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.intervalValue}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Usage Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.currentUsageHours}
                onChange={(e) => setFormData({ ...formData, currentUsageHours: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Maintenance Date
              </label>
              <input
                type="date"
                value={formData.lastMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Add Machine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Machine Equipment"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})? This action cannot be undone.`}
        confirmText="Delete Machine"
      />
    </div>
  );
};
