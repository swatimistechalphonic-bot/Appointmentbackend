import React, { useState, useEffect, useCallback } from 'react';
import { labApi, authApi } from '../services/api';
import {
    Microscope, Search, Plus, X, Edit, Trash2, ClipboardList,
    AlertCircle, CheckCircle2, XCircle, Clock, RotateCcw,
    User, Stethoscope, Flag, FileText, Filter
} from 'lucide-react';

const STATUS_STYLES = {
    Pending:      { cls: 'pending',   icon: <Clock size={12} />,         label: 'Pending' },
    'In Progress':{ cls: 'pending',   icon: <RotateCcw size={12} />,     label: 'In Progress' },
    Completed:    { cls: 'confirmed', icon: <CheckCircle2 size={12} />,  label: 'Completed' },
    Cancelled:    { cls: 'cancelled', icon: <XCircle size={12} />,       label: 'Cancelled' },
};

const PRIORITY_STYLES = {
    Normal:   { bg: '#D1FAE5', color: '#065F46' },
    Urgent:   { bg: '#FEF3C7', color: '#92400E' },
    Critical: { bg: '#FEE2E2', color: '#991B1B' },
};

const FLAG_STYLES = {
    Normal:   { bg: '#D1FAE5', color: '#065F46' },
    Abnormal: { bg: '#FEF3C7', color: '#92400E' },
    Critical: { bg: '#FEE2E2', color: '#991B1B' },
};

const TEST_TYPES = [
    'CBC (Complete Blood Count)', 'LFT (Liver Function Test)', 'KFT (Kidney Function Test)',
    'Lipid Profile', 'Thyroid Profile (TSH)', 'Blood Glucose (Fasting)', 'HbA1c',
    'Urine Routine', 'Stool Routine', 'X-Ray', 'ECG', 'Ultrasound', 'CT Scan', 'MRI',
    'Culture & Sensitivity'
];

const StatCard = ({ label, value, icon, bg, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <p style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#0F172A', margin: 0 }}>{value}</p>
        </div>
    </div>
);

const LabPage = () => {
    const [labs, setLabs] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [doctors, setDoctors] = useState([]);

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ patientName: '', age: '', gender: 'Male', doctorName: '', testType: '', priority: 'Normal' });
    const [createError, setCreateError] = useState('');

    // Result modal
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedLab, setSelectedLab] = useState(null);
    const [resultForm, setResultForm] = useState({ status: 'In Progress', parameters: '', flag: 'Normal', notes: '' });
    const [resultError, setResultError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [statsRes, labsRes] = await Promise.all([
                labApi.getStats(),
                labApi.getAllLabTests({
                    search: search || undefined,
                    status: filterStatus || undefined,
                    priority: filterPriority || undefined,
                })
            ]);
            setStats(statsRes.data.data || {});
            setLabs(labsRes.data.data || []);
        } catch {
            setError('Failed to load lab tests. Please check the server connection.');
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus, filterPriority]);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    useEffect(() => {
        authApi.getDoctors()
            .then(r => setDoctors(r.data.doctors || r.data || []))
            .catch(() => setDoctors([]));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateError('');
        if (!createForm.patientName || !createForm.doctorName || !createForm.testType) {
            setCreateError('Patient name, doctor, and test type are required.');
            return;
        }
        setSaving(true);
        try {
            await labApi.createLabTest(createForm);
            setShowCreateModal(false);
            fetchAll();
        } catch (err) {
            setCreateError(err?.response?.data?.message || 'Failed to create lab test.');
        } finally { setSaving(false); }
    };

    const openResultModal = (lab) => {
        setSelectedLab(lab);
        setResultForm({
            status: lab.status || 'In Progress',
            parameters: lab.parameters && Object.keys(lab.parameters).length > 0
                ? JSON.stringify(lab.parameters, null, 2)
                : '',
            flag: lab.flag || 'Normal',
            notes: lab.notes || ''
        });
        setResultError('');
        setShowResultModal(true);
    };

    const handleUpdateResult = async (e) => {
        e.preventDefault();
        setResultError('');
        setSaving(true);
        try {
            let parameters = {};
            try { parameters = JSON.parse(resultForm.parameters || '{}'); } catch { parameters = {}; }
            await labApi.updateLabTest(selectedLab._id, { ...resultForm, parameters });
            setShowResultModal(false);
            fetchAll();
        } catch (err) {
            setResultError(err?.response?.data?.message || 'Update failed.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lab test order?')) return;
        try { await labApi.deleteLabTest(id); fetchAll(); }
        catch (err) { alert(err?.response?.data?.message || 'Delete failed.'); }
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Microscope size={26} color="#0066FF" /> Laboratory &amp; Diagnostics
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
                        Manage lab test orders, track progress, and record results
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { setCreateForm({ patientName: '', age: '', gender: 'Male', doctorName: '', testType: '', priority: 'Normal' }); setCreateError(''); setShowCreateModal(true); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> New Lab Test
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                <StatCard label="Total Tests"   value={stats.total || 0}      icon={<Microscope size={24} color="#0066FF" />}      bg="#EEF4FF"  color="#0066FF" />
                <StatCard label="Pending"       value={stats.pending || 0}     icon={<Clock size={24} color="#F59E0B" />}            bg="#FEF3C7"  color="#F59E0B" />
                <StatCard label="In Progress"   value={stats.inProgress || 0}  icon={<RotateCcw size={24} color="#6366F1" />}       bg="#EEF2FF"  color="#6366F1" />
                <StatCard label="Completed"     value={stats.completed || 0}   icon={<CheckCircle2 size={24} color="#10B981" />}     bg="#D1FAE5"  color="#10B981" />
                <StatCard label="Cancelled"     value={stats.cancelled || 0}   icon={<XCircle size={24} color="#EF4444" />}          bg="#FEE2E2"  color="#EF4444" />
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
                    <Search size={16} color="#94A3B8" />
                    <input type="text" placeholder="Search by patient, doctor, test type..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0', fontSize: '0.9rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }} />
                </div>
                <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">All Statuses</option>
                    {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="input-field" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">All Priorities</option>
                    {['Normal', 'Urgent', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {error && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, gap: 12, color: 'var(--text-muted)' }}>
                        <div className="loading-spinner" /><span>Loading lab tests...</span>
                    </div>
                ) : (
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Lab ID</th>
                                <th>Patient</th>
                                <th>Test Type</th>
                                <th>Doctor</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                                        <Microscope size={40} color="#E2E8F0" style={{ display: 'block', margin: '0 auto 12px' }} />
                                        No lab tests found. Click "New Lab Test" to create one.
                                    </td>
                                </tr>
                            ) : labs.map(lab => {
                                const ss = STATUS_STYLES[lab.status] || STATUS_STYLES.Pending;
                                const ps = PRIORITY_STYLES[lab.priority] || PRIORITY_STYLES.Normal;
                                return (
                                    <tr key={lab._id}>
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#0066FF', fontSize: '0.82rem', fontFamily: 'monospace', background: '#EEF4FF', padding: '3px 8px', borderRadius: 6 }}>
                                                {lab.labTestId}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <User size={16} color="#0066FF" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lab.patientName}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lab.gender}, {lab.age}y</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{lab.testType}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Stethoscope size={14} color="#94A3B8" />
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{lab.doctorName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: ps.bg, color: ps.color }}>
                                                {lab.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`doc-badge ${ss.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {ss.icon} {ss.label}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{lab.requestDate}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openResultModal(lab)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <ClipboardList size={13} /> Result
                                                </button>
                                                <button className="btn btn-sm" onClick={() => handleDelete(lab._id)}
                                                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Microscope size={18} color="#0066FF" /> New Lab Test Order
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                <X size={22} />
                            </button>
                        </div>
                        {createError && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <AlertCircle size={15} /> {createError}
                            </div>
                        )}
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Patient Name *</label>
                                    <input className="input-field" value={createForm.patientName} onChange={e => setCreateForm({ ...createForm, patientName: e.target.value })} required placeholder="Full name" />
                                </div>
                                <div className="form-group">
                                    <label>Age *</label>
                                    <input className="input-field" type="number" min="0" value={createForm.age} onChange={e => setCreateForm({ ...createForm, age: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select className="input-field" value={createForm.gender} onChange={e => setCreateForm({ ...createForm, gender: e.target.value })}>
                                        {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Referring Doctor *</label>
                                    <select className="input-field" value={createForm.doctorName} onChange={e => setCreateForm({ ...createForm, doctorName: e.target.value })} required>
                                        <option value="">-- Select Doctor --</option>
                                        {doctors.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Test Type *</label>
                                    <select className="input-field" value={createForm.testType} onChange={e => setCreateForm({ ...createForm, testType: e.target.value })} required>
                                        <option value="">-- Select Test Type --</option>
                                        {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select className="input-field" value={createForm.priority} onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}>
                                        {['Normal', 'Urgent', 'Critical'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Creating...' : <><Microscope size={15} /> Create Order</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResultModal && selectedLab && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowResultModal(false)}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ClipboardList size={18} color="#0066FF" /> Update Result
                                <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: '0.9rem', marginLeft: 4 }}>— {selectedLab.labTestId}</span>
                            </h2>
                            <button onClick={() => setShowResultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} color="#64748B" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Patient:</strong> {selectedLab.patientName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Microscope size={14} color="#64748B" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Test:</strong> {selectedLab.testType}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Stethoscope size={14} color="#64748B" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-main)' }}>Doctor:</strong> {selectedLab.doctorName}</span>
                            </div>
                        </div>

                        {resultError && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
                                <AlertCircle size={15} /> {resultError}
                            </div>
                        )}

                        <form onSubmit={handleUpdateResult}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="input-field" value={resultForm.status} onChange={e => setResultForm({ ...resultForm, status: e.target.value })}>
                                        {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Result Flag</label>
                                    <select className="input-field" value={resultForm.flag} onChange={e => setResultForm({ ...resultForm, flag: e.target.value })}>
                                        {['Normal', 'Abnormal', 'Critical'].map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FileText size={14} /> Parameters (JSON format)
                                    </label>
                                    <textarea className="input-field" rows={4}
                                        value={resultForm.parameters}
                                        onChange={e => setResultForm({ ...resultForm, parameters: e.target.value })}
                                        style={{ fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                                        placeholder={'{\n  "Hemoglobin": "13.5 g/dL",\n  "WBC": "7000 /uL"\n}'} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Clinical Notes</label>
                                    <textarea className="input-field" rows={3}
                                        value={resultForm.notes}
                                        onChange={e => setResultForm({ ...resultForm, notes: e.target.value })}
                                        style={{ resize: 'vertical' }}
                                        placeholder="Additional observations or remarks..." />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Saving...' : <><CheckCircle2 size={15} /> Save Result</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabPage;
