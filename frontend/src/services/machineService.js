import api from './api';
import { initialMockMachines } from '../data/mockMachines';

// Local cache store for offline/fallback state management
let localMachines = [...initialMockMachines];

export const machineService = {
  async getMachines() {
    try {
      const response = await api.get('/machines');
      // Update local cache on successful backend fetch
      localMachines = response.data;
      return response.data;
    } catch (err) {
      console.warn('API connection failed, falling back to local state:', err.message);
      return [...localMachines];
    }
  },

  async getMachineById(id) {
    try {
      const response = await api.get(`/machines/${id}`);
      return response.data;
    } catch (err) {
      const found = localMachines.find(m => m.id === Number(id));
      if (!found) throw new Error('Machine not found.');
      return found;
    }
  },

  async createMachine(machineData) {
    try {
      const response = await api.post('/machines', machineData);
      localMachines.push(response.data);
      return response.data;
    } catch (err) {
      // Fallback local creation if backend offline
      if (err.message.includes('Unable to connect')) {
        const newMachine = {
          id: Date.now(),
          ...machineData,
          currentUsageHours: Number(machineData.currentUsageHours || 0),
          lastMaintenanceDate: machineData.lastMaintenanceDate || new Date().toISOString().split('T')[0]
        };
        localMachines.push(newMachine);
        return newMachine;
      }
      throw err;
    }
  },

  async deleteMachine(id) {
    try {
      await api.delete(`/machines/${id}`);
      localMachines = localMachines.filter(m => m.id !== Number(id));
      return true;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        localMachines = localMachines.filter(m => m.id !== Number(id));
        return true;
      }
      throw err;
    }
  }
};
