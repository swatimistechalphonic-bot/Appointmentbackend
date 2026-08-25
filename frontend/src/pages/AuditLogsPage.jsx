import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  X,
  AlertTriangle,
  Info,
  ShieldAlert,
  User,
  Clock,
  Laptop,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';

const initialLogs = [
  {
    id: 'LOG-8901',
    event: 'User Session Authentication',
    category: 'Authentication',
    user: 'Dr. Rahul Sharma',
    role: 'Doctor',
    resource: '/api/users/login',
    ip: '192.168.1.104',
    location: 'Mumbai, MH, India',
    timestamp: '2026-08-25 12:34:12',
    severity: 'Info',
    status: 'Success',
    details: 'JWT Token generated successfully for Doctor session. Browser: Chrome v128 (Windows 11).'
  },
  {
    id: 'LOG-8902',
    event: 'Patient Medical Record Updated',
    category: 'Medical Data Edit',
    user: 'Amit Kumar',
    role: 'Admin',
    resource: '/api/patients/PAT-9041',
    ip: '192.168.1.101',
    location: 'Delhi, DL, India',
    timestamp: '2026-08-25 11:45:08',
    severity: 'Info',
    status: 'Success',
    details: 'Updated blood pressure parameters and diagnosis notes for Patient PAT-9041.'
  },
  {
    id: 'LOG-8903',
    event: 'Failed Password Attempt',
    category: 'Authentication',
    user: 'Unknown User',
    role: 'Guest',
    resource: '/api/users/login',
    ip: '103.24.182.55',
    location: 'Bangalore, KA, India',
    timestamp: '2026-08-25 10:12:44',
    severity: 'Warning',
    status: 'Failed',
    details: '3 consecutive invalid password attempts registered for email admin@caresync.com.'
  },
  {
    id: 'LOG-8904',
    event: 'Payment Invoice Refund Initiated',
    category: 'Payment/Billing',
    user: 'Karan Johar',
    role: 'Accountant',
    resource: '/api/payments/INV-4029',
    ip: '192.168.1.115',
    location: 'Mumbai, MH, India',
    timestamp: '2026-08-25 09:20:19',
    severity: 'Info',
    status: 'Success',
    details: 'Processed refund of ₹1,800 for appointment cancellation INV-4029.'
  },
  {
    id: 'LOG-8905',
    event: 'Unusual IP Access Warning',
    category: 'System Security',
    user: 'Mary Joseph',
    role: 'Nurse',
    resource: '/api/documents/DOC-1002',
    ip: '45.112.90.12',
    location: 'Chennai, TN, India',
    timestamp: '2026-08-24 23:55:01',
    severity: 'Critical',
    status: 'Flagged',
    details: 'Access requested from unrecognized foreign IP subnet. Account access temporarily flagged.'
  },
  {
    id: 'LOG-8906',
    event: 'Dynamic Clinic Logo Updated',
    category: 'System Security',
    user: 'Super Admin',
    role: 'Admin',
    resource: '/api/settings',
    ip: '192.168.1.100',
    location: 'New Delhi, DL, India',
    timestamp: '2026-08-24 18:30:22',
    severity: 'Info',
    status: 'Success',
    details: 'System branding logo updated in local storage and database settings.'
  }
];

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState(initialLogs);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Metrics
  const totalLogs = logs.length;
  const authCount = logs.filter((l) => l.category === 'Authentication').length;
  const editCount = logs.filter((l) => l.category === 'Medical Data Edit' || l.category === 'System Security').length;
  const warningCount = logs.filter((l) => l.severity === 'Warning' || l.severity === 'Critical').length;

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Event', 'Category', 'User', 'Role', 'IP Address', 'Timestamp', 'Severity', 'Status'];
    const rows = filteredLogs.map((l) => [l.id, l.event, l.category, l.user, l.role, l.ip, l.timestamp, l.severity, l.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            System Audit Logs & Security Checks
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Inspect transaction history, session logins, user actions, data edits, and IP details for absolute transparency
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Event, User, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Medical Data Edit">Medical Data Edit</option>
            <option value="Payment/Billing">Payment/Billing</option>
            <option value="System Security">System Security</option>
          </select>

          <select
            className="filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} /> Export Logs
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL AUDIT LOGS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalLogs}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>LOGIN & SESSION EVENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{authCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>DATA & SYSTEM EDITS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{editCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '700' }}>SECURITY WARNINGS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7F1D1D', marginTop: '0.1rem' }}>{warningCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Audit Logs Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Category</th>
                <th>Performed By</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.88rem' }}>{log.event}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{log.id} • {log.resource}</div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                        {log.category}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{log.user}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{log.role}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: '600' }}>
                        <Laptop size={14} color="#64748B" />
                        {log.ip}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.82rem' }}>
                        <Clock size={13} />
                        {log.timestamp}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: log.severity === 'Critical' ? '#FEE2E2' : log.severity === 'Warning' ? '#FEF3C7' : '#E0F2FE',
                          color: log.severity === 'Critical' ? '#991B1B' : log.severity === 'Warning' ? '#92400E' : '#075985'
                        }}
                      >
                        {log.severity}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          log.status === 'Success' ? 'badge-success' : log.status === 'Failed' ? 'badge-danger' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn"
                        title="View Details Payload"
                        onClick={() => setSelectedLog(log)}
                        style={{ color: '#0066FF', background: '#EFF6FF', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={15} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No system audit logs found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Details Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>{selectedLog.event}</h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Log ID: {selectedLog.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>User & Role:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{selectedLog.user} ({selectedLog.role})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Resource Endpoint:</span>
                <span style={{ color: '#0F172A', fontWeight: '700', fontFamily: 'monospace' }}>{selectedLog.resource}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>IP Address & Location:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{selectedLog.ip} ({selectedLog.location})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Exact Timestamp:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{selectedLog.timestamp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Severity Level:</span>
                <span style={{ color: selectedLog.severity === 'Critical' ? '#EF4444' : '#0066FF', fontWeight: '700' }}>{selectedLog.severity}</span>
              </div>

              <div style={{ paddingTop: '0.6rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.85rem' }}>
                <span style={{ display: 'block', color: '#64748B', fontWeight: '600', marginBottom: '0.3rem' }}>Event Details & Payload Context:</span>
                <div style={{ background: '#0F172A', color: '#F1F5F9', padding: '0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', background: '#0F172A', color: '#FFFFFF', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogsPage;
