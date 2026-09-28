import api from './api';
import { initialMockUsageLogs } from '../data/mockUsageLogs';
import { machineService } from './machineService';
import { maintenanceService } from './maintenanceService';

let localUsageLogs = [...initialMockUsageLogs];

export const usageService = {
  async logUsage(machineId, usageHours) {
    try {
      const response = await api.post(`/usage/${machineId}?usageHours=${usageHours}`);
      localUsageLogs.unshift(response.data);
      return response.data;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        const machine = await machineService.getMachineById(machineId);
        
        // Log usage locally
        const newLog = {
          id: Date.now(),
          usageHours: Number(usageHours),
          loggedAt: new Date().toISOString(),
          machine: {
            id: machine.id,
            name: machine.name,
            code: machine.code
          }
        };
        localUsageLogs.unshift(newLog);

        // Update current machine usage
        machine.currentUsageHours = (machine.currentUsageHours || 0) + Number(usageHours);

        // Check 90% threshold auto-task creation rule locally
        let isThresholdReached = false;
        if (machine.maintenanceType === 'HOURS') {
          isThresholdReached = machine.currentUsageHours >= (machine.intervalValue * 0.90);
        }

        if (isThresholdReached) {
          try {
            await maintenanceService.createTask({
              machineId: machine.id,
              notes: `Auto-generated: Usage threshold reached (${machine.currentUsageHours} / ${machine.intervalValue} hours)`
            });
          } catch (taskErr) {
            // Task might already be open, ignore
          }
        }

        return newLog;
      }
      throw err;
    }
  },

  async getUsageLogsByMachine(machineId) {
    try {
      const response = await api.get(`/usage/machine/${machineId}`);
      return response.data;
    } catch (err) {
      return localUsageLogs.filter(log => log.machine && log.machine.id === Number(machineId));
    }
  },

  async getAllUsageLogs() {
    return [...localUsageLogs];
  }
};
