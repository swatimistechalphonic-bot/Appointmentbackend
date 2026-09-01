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
import PublicWebsite from './pages/PublicWebsite';
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
            <Route path="/" element={<DoctorDashboard />} />
            <Route path="/appointments" element={<PatientDashboard />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/queue" element={<QueueManagementPage />} />
            <Route path="/records" element={<MedicalRecordsPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/messages" element={<ChatPage />} />
            <Route path="/telemedicine" element={<TelemedicinePage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/beds" element={<BedManagementPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/vaccinations" element={<VaccinationsPage />} />
            <Route path="/discharge-summaries" element={<DischargeSummariesPage />} />
            <Route path="/dischargesummaries" element={<DischargeSummariesPage />} />
            <Route path="/discharge" element={<DischargeSummariesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/staff" element={<StaffRolesPage />} />
            <Route path="/logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<DoctorsPage />} />
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
          <Route path="/" element={<PublicWebsite />} />
          <Route path="/website" element={<PublicWebsite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
