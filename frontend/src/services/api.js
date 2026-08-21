import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careSync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User Authentication API endpoints
export const authApi = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
  sendOtp: (phone) => api.post('/users/send-otp', { phone }),
  verifyOtp: (data) => api.post('/users/verify-otp', data),
  getAllUsers: () => api.get('/users'),
  getDoctors: () => api.get('/users/doctors'),
  getUserById: (id) => api.get(`/users/${id}`),
};

// Appointment API endpoints
export const appointmentApi = {
  getDashboardStats: () => api.get('/appointments/dashboard-stats'),
  createAppointment: (data) => api.post('/appointments', data),
  getAllAppointments: (params) => api.get('/appointments', { params }),
  getUserAppointments: (userId) => api.get(`/appointments/user/${userId}`),
  getDoctorAppointments: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export default api;
