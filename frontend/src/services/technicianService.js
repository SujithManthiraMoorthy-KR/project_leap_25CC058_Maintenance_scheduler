import api from './api';
import { initialMockTechnicians } from '../data/mockTechnicians';

let localTechnicians = [...initialMockTechnicians];

export const technicianService = {
  async getTechnicians() {
    try {
      const response = await api.get('/technicians');
      localTechnicians = response.data;
      return response.data;
    } catch (err) {
      console.warn('API connection failed, falling back to local state:', err.message);
      return [...localTechnicians];
    }
  },

  async getTechnicianById(id) {
    try {
      const response = await api.get(`/technicians/${id}`);
      return response.data;
    } catch (err) {
      const found = localTechnicians.find(t => t.id === Number(id));
      if (!found) throw new Error('Technician not found.');
      return found;
    }
  },

  async createTechnician(technicianData) {
    try {
      const response = await api.post('/technicians', technicianData);
      localTechnicians.push(response.data);
      return response.data;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        const newTech = {
          id: Date.now(),
          ...technicianData
        };
        localTechnicians.push(newTech);
        return newTech;
      }
      throw err;
    }
  },

  async deleteTechnician(id) {
    try {
      await api.delete(`/technicians/${id}`);
      localTechnicians = localTechnicians.filter(t => t.id !== Number(id));
      return true;
    } catch (err) {
      if (err.message.includes('Unable to connect')) {
        localTechnicians = localTechnicians.filter(t => t.id !== Number(id));
        return true;
      }
      throw err;
    }
  }
};
