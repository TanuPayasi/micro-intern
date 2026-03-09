import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mi_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup         = (data)      => API.post('/auth/signup', data);
export const login          = (data)      => API.post('/auth/login', data);
export const getMe          = ()          => API.get('/auth/me');
export const updateProfile  = (data)      => API.put('/auth/profile', data);

// Tasks
export const getTasks       = (params)    => API.get('/tasks', { params });
export const getTask        = (id)        => API.get(`/tasks/${id}`);
export const createTask     = (data)      => API.post('/tasks', data);
export const updateTask     = (id, data)  => API.put(`/tasks/${id}`, data);
export const deleteTask     = (id)        => API.delete(`/tasks/${id}`);
export const getMyTasks     = ()          => API.get('/tasks/user/my-tasks');

// Applications
export const applyToTask             = (data)      => API.post('/applications', data);
export const getMyApplications       = ()          => API.get('/applications/my-applications');
export const getTaskApplications     = (taskId)    => API.get(`/applications/task/${taskId}`);
export const updateApplicationStatus = (id, data)  => API.put(`/applications/${id}/status`, data);
// AI
export const generateCoverNote = (data) => API.post('/ai/generate-cover-note', data);