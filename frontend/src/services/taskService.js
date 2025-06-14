import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { authService } from './authService';

// Configuration avec le token d'authentification
const getAuthConfig = () => ({
  ...API_CONFIG,
  headers: {
    ...API_CONFIG.headers,
    'Authorization': `Bearer ${authService.getToken()}`
  }
});

export const taskService = {
  // Récupérer toutes les tâches
  async getTasks(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_ENDPOINTS.TASKS}${query ? `?${query}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        ...getAuthConfig()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des tâches');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle tâche
  async createTask(taskData) {
    try {
      const response = await fetch(API_ENDPOINTS.TASKS, {
        method: 'POST',
        ...getAuthConfig(),
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la tâche');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une tâche
  async updateTask(id, taskData) {
    try {
      const response = await fetch(API_ENDPOINTS.TASK(id), {
        method: 'PATCH',
        ...getAuthConfig(),
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de la tâche');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une tâche
  async deleteTask(id) {
    try {
      const response = await fetch(API_ENDPOINTS.TASK(id), {
        method: 'DELETE',
        ...getAuthConfig()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de la tâche');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
}; 