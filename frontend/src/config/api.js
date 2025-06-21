const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-application-ixiw.onrender.com/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_URL}/auth/register`,
  LOGIN: `${API_URL}/auth/login`,
  
  // Tasks
  TASKS: `${API_URL}/tasks`,
  TASK: (id) => `${API_URL}/tasks/${id}`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
}; 
