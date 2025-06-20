const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-application-ixiw.onrender.com';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_URL}/api/auth/register`,
  LOGIN: `${API_URL}/api/auth/login`,
  
  // Tasks
  TASKS: `${API_URL}/api/tasks`,
  TASK: (id) => `${API_URL}/api/tasks/${id}`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};
