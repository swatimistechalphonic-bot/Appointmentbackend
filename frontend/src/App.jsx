import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorsPage from './pages/DoctorsPage';
import PatientsPage from './pages/PatientsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import SchedulesPage from './pages/SchedulesPage';
import PharmacyPage from './pages/PharmacyPage';
import BlogsPage from './pages/BlogsPage';
import AppsPage from './pages/AppsPage';
import ComponentsPage from './pages/ComponentsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#64748B' }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppLayout = () => {
  return (
    <div className="doctris-layout">
      <Sidebar />
      <div className="doctris-main-wrapper">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
            <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PharmacyPage /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ComponentsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ComponentsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
