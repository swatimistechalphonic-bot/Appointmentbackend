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
import ChatPage from './pages/ChatPage';
import DepartmentsPage from './pages/DepartmentsPage';
import SchedulesPage from './pages/SchedulesPage';
import ReportsPage from './pages/ReportsPage';
import ReviewsPage from './pages/ReviewsPage';
import PharmacyPage from './pages/PharmacyPage';
import PaymentsPage from './pages/PaymentsPage';
import BlogsPage from './pages/BlogsPage';
import AppsPage from './pages/AppsPage';
import SettingsPage from './pages/SettingsPage';
import ComponentsPage from './pages/ComponentsPage';
import LabPage from './pages/LabPage';
import ServicesPage from './pages/ServicesPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import QueueManagementPage from './pages/QueueManagementPage';
import StaffRolesPage from './pages/StaffRolesPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import TelemedicinePage from './pages/TelemedicinePage';
import DocumentsPage from './pages/DocumentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import BedManagementPage from './pages/BedManagementPage';
import ReferralsPage from './pages/ReferralsPage';
import VaccinationsPage from './pages/VaccinationsPage';
import DischargeSummariesPage from './pages/DischargeSummariesPage';
import {
  ClipboardList,
  FolderHeart,
  FileSpreadsheet,
  Video,
  Stethoscope,
  Activity,
  FileText,
  Bell,
  ShieldAlert,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';

const PlaceholderPage = ({ title, desc, icon: Icon }) => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Icon size={32} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.5rem' }}>{title}</h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>{desc}</p>
        
        <div style={{ padding: '0.85rem 1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
          <HeartPulse size={16} color="#0066FF" />
          <span>Active Role Access: <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{user?.role || 'Admin'}</strong></span>
        </div>
      </div>
    </div>
  );
};

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
            <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><QueueManagementPage /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><MedicalRecordsPage /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/telemedicine" element={<ProtectedRoute><TelemedicinePage /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
            <Route path="/beds" element={<ProtectedRoute><BedManagementPage /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
            <Route path="/vaccinations" element={<ProtectedRoute><VaccinationsPage /></ProtectedRoute>} />
            <Route path="/discharge-summaries" element={<ProtectedRoute><DischargeSummariesPage /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><StaffRolesPage /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
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
