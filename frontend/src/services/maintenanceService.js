import api from './api';
import { initialMockMaintenanceTasks } from '../data/mockMaintenanceTasks';
import { machineService } from './machineService';
import { technicianService } from './technicianService';

let localTasks = [...initialMockMaintenanceTasks];

export const maintenanceService = {
  async getAllTasks() {
    try {
      const response = await api.get('/maintenance-tasks');
      localTasks = response.data;
      return response.data;
    } catch (err) {
      console.warn('API connection failed, using local task cache:', err.message);
      return [...localTasks];
    }
  },

  async getTaskById(id) {
    try {
      const response = await api.get(`/maintenance-tasks/${id}`);
      return response.data;
    } catch (err) {
      const task = localTasks.find(t => t.id === Number(id));
      if (!task) throw new Error('Maintenance task not found');
      return task;
    }
  },

  async getTasksByMachine(machineId) {
    try {
      const response = await api.get(`/maintenance-tasks/machine/${machineId}`);
      return response.data;
    } catch (err) {
      return localTasks.filter(t => t.machine && t.machine.id === Number(machineId));
    }
  },

  async getOpenTasks() {
    try {
      const response = await api.get('/maintenance-tasks/open');
      return response.data;
    } catch (err) {
      return localTasks.filter(t => t.status === 'OPEN');
    }
  },

  async checkMaintenance() {
    try {
      const response = await api.get('/maintenance-tasks/check');
      return response.data;
    } catch (err) {
      return 'Maintenance check completed locally.';
    }
  },

  async createTask(requestData) {
    try {
      const response = await api.post('/maintenance-tasks', requestData);
      localTasks.unshift(response.data);
      return response.data;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        const machine = await machineService.getMachineById(requestData.machineId);

        // Check business rule: cannot create task if machine already has an OPEN task
        const alreadyOpen = localTasks.some(t => t.machine && t.machine.id === Number(machine.id) && t.status === 'OPEN');
        if (alreadyOpen) {
          throw new Error('An open maintenance task already exists for this machine');
        }

        let technician = null;
        if (requestData.technicianId) {
          technician = await technicianService.getTechnicianById(requestData.technicianId);
        }

        const newTask = {
          id: Date.now(),
          machine,
          technician,
          status: 'OPEN',
          notes: requestData.notes || '',
          dueUsageHours: machine.maintenanceType === 'HOURS' ? machine.intervalValue : null,
          dueDate: machine.maintenanceType === 'DAYS' ? new Date(Date.now() + machine.intervalValue * 86400000).toISOString().split('T')[0] : null,
          completedAt: null
        };

        localTasks.unshift(newTask);
        return newTask;
      }
      throw err;
    }
  },

  async completeTask(id, notes) {
    try {
      const notesQuery = notes ? `?notes=${encodeURIComponent(notes)}` : '';
      const response = await api.put(`/maintenance-tasks/${id}/complete${notesQuery}`);
      // Update local task
      const updatedIndex = localTasks.findIndex(t => t.id === Number(id));
      if (updatedIndex !== -1) {
        localTasks[updatedIndex] = response.data;
      }
      return response.data;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        const task = localTasks.find(t => t.id === Number(id));
        if (!task) throw new Error('Maintenance task not found.');
        if (task.status === 'COMPLETED') throw new Error('Maintenance task is already completed.');

        task.status = 'COMPLETED';
        task.notes = notes || task.notes;
        task.completedAt = new Date().toISOString();

        // Reset machine cycle locally
        if (task.machine) {
          const machine = await machineService.getMachineById(task.machine.id);
          machine.currentUsageHours = 0.0;
          machine.lastMaintenanceDate = new Date().toISOString().split('T')[0];
        }

        return task;
      }
      throw err;
    }
  },

  async getOverdueMachines() {
    try {
      const response = await api.get('/maintenance-tasks/overdue');
      return response.data;
    } catch (err) {
      const machines = await machineService.getMachines();
      const today = new Date();
      
      return machines.filter(m => {
        if (m.maintenanceType === 'HOURS') {
          return m.currentUsageHours != null && m.currentUsageHours >= m.intervalValue;
        } else if (m.maintenanceType === 'DAYS') {
          if (!m.lastMaintenanceDate) return false;
          const lastDate = new Date(m.lastMaintenanceDate);
          const dueDate = new Date(lastDate.getTime() + (m.intervalValue * 86400000));
          return today > dueDate;
        }
        return false;
      });
    }
  }
};
