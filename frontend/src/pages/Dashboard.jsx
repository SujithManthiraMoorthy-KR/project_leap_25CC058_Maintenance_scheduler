import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { MachineTable } from '../components/MachineTable';
import { MaintenanceTable } from '../components/MaintenanceTable';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  IconCog, 
  IconWrench, 
  IconAlertTriangle, 
  IconUsers, 
  IconPlus, 
  IconActivity, 
  IconCheckCircle 
} from '../components/Icons';
import { machineService } from '../services/machineService';
import { maintenanceService } from '../services/maintenanceService';
import { technicianService } from '../services/technicianService';
import { useToast } from '../components/Toast';

export const Dashboard = ({ searchQuery }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [overdueMachines, setOverdueMachines] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [mList, tList, techList, ovList] = await Promise.all([
        machineService.getMachines(),
        maintenanceService.getAllTasks(),
        technicianService.getTechnicians(),
        maintenanceService.getOverdueMachines()
      ]);

      setMachines(mList || []);
      setTasks(tList || []);
      setTechnicians(techList || []);
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

  // Filter machines based on top bar search
  const filteredMachines = machines.filter(m => 
    !searchQuery || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTasksCount = tasks.filter(t => t.status === 'OPEN').length;
  const recentCompletedTasks = tasks.filter(t => t.status === 'COMPLETED').slice(0, 3);
  const upcomingTasks = tasks.filter(t => t.status === 'OPEN').slice(0, 3);

  if (loading) {
    return <LoadingSpinner label="Loading Maintenance Dashboard..." />;
  }

  // Count machine status breakdown for chart/summary
  let normalCount = 0;
  let nearCount = 0;
  let overdueCount = overdueMachines.length;

  machines.forEach(m => {
    const st = getMachineStatus(m);
    if (st === 'normal') normalCount++;
    else if (st === 'near') nearCount++;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner Alert if Overdue machines exist */}
      {overdueMachines.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <IconAlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base">Immediate Attention Required!</h4>
              <p className="text-xs text-rose-100">
                {overdueMachines.length} equipment unit(s) have exceeded their preventive maintenance interval limits.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/overdue-machines')}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-white rounded-xl shadow hover:bg-rose-50 transition-colors whitespace-nowrap self-end sm:self-center"
          >
            View Overdue Equipment →
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Machines"
          value={machines.length}
          icon={IconCog}
          colorScheme="blue"
          trend={`${normalCount} Operating Normally`}
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Active Maintenance Tasks"
          value={activeTasksCount}
          icon={IconWrench}
          colorScheme="amber"
          trend="In Progress & Scheduled"
          onClick={() => navigate('/maintenance-tasks')}
        />
        <StatCard
          title="Overdue Equipment"
          value={overdueCount}
          icon={IconAlertTriangle}
          colorScheme="rose"
          trend="Requires Urgent Action"
          onClick={() => navigate('/overdue-machines')}
        />
        <StatCard
          title="Total Technicians"
          value={technicians.length}
          icon={IconUsers}
          colorScheme="emerald"
          trend="Certified Crew"
          onClick={() => navigate('/technicians')}
        />
      </div>

      {/* Visual Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Equipment Fleet Health Breakdown</h3>
              <p className="text-xs text-slate-500">Real-time status based on usage hours & calendar intervals</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              90% Threshold System
            </span>
          </div>

          {/* Visual Bar Graph */}
          <div className="space-y-4 my-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal Status
                </span>
                <span className="text-slate-600">{normalCount} Machines ({machines.length ? Math.round((normalCount/machines.length)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${machines.length ? (normalCount/machines.length)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Approaching Maintenance (≥ 90%)
                </span>
                <span className="text-slate-600">{nearCount} Machines ({machines.length ? Math.round((nearCount/machines.length)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${machines.length ? (nearCount/machines.length)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue Maintenance
                </span>
                <span className="text-slate-600">{overdueCount} Machines ({machines.length ? Math.round((overdueCount/machines.length)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${machines.length ? (overdueCount/machines.length)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-medium text-slate-500 justify-between">
            <span>Automatic Task Generation: Enabled</span>
            <span>Interval Types: HOURS & DAYS</span>
          </div>
        </div>

        {/* Quick Action Panel & Maintenance Overview */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Quick Maintenance Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Perform common plant operations</p>
            
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/usage-logs')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-semibold text-xs text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <IconActivity className="w-4 h-4 text-blue-600" />
                  <span>Log Machine Usage Hours</span>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={() => navigate('/machines')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-semibold text-xs text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <IconPlus className="w-4 h-4 text-emerald-600" />
                  <span>Register New Equipment</span>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={() => navigate('/maintenance-tasks')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 font-semibold text-xs text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <IconWrench className="w-4 h-4 text-amber-600" />
                  <span>View & Complete Open Tasks</span>
                </div>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Recently Completed Work</h4>
            {recentCompletedTasks.length > 0 ? (
              <div className="space-y-2">
                {recentCompletedTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">{task.machine?.name}</span>
                    <span className="text-emerald-700 font-medium">Completed</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No recent completed tasks.</p>
            )}
          </div>
        </div>
      </div>

      {/* Machine Maintenance Overview Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Equipment Fleet Overview</h3>
            <p className="text-xs text-slate-500">Live monitoring of registered machinery</p>
          </div>
          <button
            onClick={() => navigate('/machines')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Machines →
          </button>
        </div>

        <MachineTable
          machines={filteredMachines}
          getMachineStatus={getMachineStatus}
          onView={(m) => navigate(`/machines/${m.id}`)}
          onDelete={() => navigate('/machines')}
        />
      </div>
    </div>
  );
};
