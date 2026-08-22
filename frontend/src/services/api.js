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

// User Authentication & Profile API endpoints
export const authApi = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
  sendOtp: (phone) => api.post('/users/send-otp', { phone }),
  verifyOtp: (data) => api.post('/users/verify-otp', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getAllUsers: () => api.get('/users'),
  getDoctors: () => api.get('/users/doctors'),
  createDoctor: (data) => api.post('/users/doctors', data),
  updateDoctor: (id, data) => api.put(`/users/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/users/doctors/${id}`),
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

// Patient API endpoints
export const patientApi = {
  getAllPatients: (search) => api.get('/patients', { params: { search } }),
  getPatientById: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),
};

// Department API endpoints
export const departmentApi = {
  getAllDepartments: (params) => api.get('/departments', { params }),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
};

// Reports & Analytics API endpoints
export const reportApi = {
  getAnalytics: () => api.get('/reports/analytics'),
  getRevenueTrends: () => api.get('/reports/revenue-trends'),
  getAppointmentStatusReport: () => api.get('/reports/appointment-status'),
  getDoctorPerformanceReport: () => api.get('/reports/doctor-performance'),
  getPatientDemographicsReport: () => api.get('/reports/patient-demographics'),
};

// Doctor Reviews & Ratings API endpoints
export const reviewApi = {
  getAllReviews: (params) => api.get('/reviews', { params }),
  getReviewsByDoctor: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Real-Time Consultation Chat API endpoints
export const chatApi = {
  sendMessage: (data) => api.post('/chat/send', data),
  getConversation: (userId) => api.get(`/chat/conversation/${userId}`),
  getContacts: () => api.get('/chat/contacts'),
  markAsRead: (senderId) => api.put(`/chat/read/${senderId}`),
};

// System Settings & Dynamic Logo API endpoints
export const settingApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

// Payment Management API endpoints
export const paymentApi = {
  getStats: () => api.get('/payments/stats'),
  getAllPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`),
};

export default api;
