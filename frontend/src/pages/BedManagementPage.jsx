import React, { useState, useEffect, useCallback } from 'react';
import { bedApi, authApi } from '../services/api';
import {
    BedDouble, Search, Plus, X, LayoutGrid, List,
    AlertCircle, CheckCircle2, XCircle, AlertTriangle,
    User, Stethoscope, ArrowRightLeft, LogOut, Trash2,
    TrendingUp, Activity, Building2, UserPlus, Edit
} from 'lucide-react';

const WARDS = ['All', 'General Ward', 'ICU', 'NICU', 'CCU', 'Emergency', 'Pediatric', 'Maternity', 'Orthopedic', 'Surgical', 'Psychiatric'];
const WARD_OPTIONS = WARDS.filter(w => w !== 'All');

const STATUS_CONFIG = {
    Available: { color: '#10B981', bg: '#D1FAE5', border: '#A7F3D0', label: 'Available', Icon: CheckCircle2 },
    Occupied:  { color: '#EF4444', bg: '#FEE2E2', border: '#FCA5A5', label: 'Occupied',  Icon: BedDouble },
    Cleaning:  { color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', label: 'Cleaning',  Icon: Activity },
};

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

const BedManagementPage = () => {
    const [beds, setBeds] = useState([]);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0, cleaning: 0, occupancyRate: '0.0' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterWard, setFilterWard] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [doctors, setDoctors] = useState([]);

    // Add bed modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [bedForm, setBedForm] = useState({
        ward: 'General Ward',
        bedNumber: '',
        status: 'Available',
        patientName: '',
        age: '',
        gender: 'Male',
        doctorName: '',
        diagnosis: ''
    });
    const [bedFormError, setBedFormError] = useState('');

    // Admit modal
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [admitForm, setAdmitForm] = useState({ patientName: '', age: '', gender: 'Male', doctorName: '', diagnosis: '' });
    const [admitError, setAdmitError] = useState('');

    // Transfer modal
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferTargetId, setTransferTargetId] = useState('');
    const [transferError, setTransferError] = useState('');

    const [saving, setSaving] = useState(false);

    const availableForTransfer = beds.filter(b => b.status !== 'Occupied' && b._id !== selectedBed?._id);
    const occupancyPct = parseFloat(stats.occupancyRate) || 0;
    const barColor = occupancyPct > 80 ? '#EF4444' : occupancyPct > 60 ? '#F59E0B' : '#10B981';

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [statsRes, bedsRes] = await Promise.all([
                bedApi.getStats(),
                bedApi.getAllBeds({
                    search: search || undefined,
                    ward: filterWard !== 'All' ? filterWard : undefined,
                    status: filterStatus !== 'All' ? filterStatus : undefined,
                })
            ]);
            setStats(statsRes.data.data || {});
            setBeds(bedsRes.data.data || []);
        } catch {
            setError('Failed to load bed data. Please check the server connection.');
        } finally {
            setLoading(false);
        }
    }, [search, filterWard, filterStatus]);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    useEffect(() => {
        authApi.getDoctors().then(r => setDoctors(r.data.doctors || r.data || [])).catch(() => setDoctors([]));
    }, []);

    const handleAddBed = async (e) => {
        e.preventDefault();
        setBedFormError('');
        if (!bedForm.bedNumber.trim()) { setBedFormError('Bed number is required.'); return; }
        if (bedForm.status === 'Occupied' && (!bedForm.patientName || !bedForm.diagnosis)) {
            setBedFormError('Patient Name and Diagnosis are required when registering an occupied bed.');
            return;
        }
        setSaving(true);
        try {
            const res = await bedApi.createBed(bedForm);
            if (bedForm.status === 'Occupied' && res.data?.data?._id) {
                await bedApi.admitPatient(res.data.data._id, {
                    patientName: bedForm.patientName,
                    age: bedForm.age,
                    gender: bedForm.gender,
                    doctorName: bedForm.doctorName,
                    diagnosis: bedForm.diagnosis
                });
            }
            setShowAddModal(false);
            fetchAll();
        } catch (err) {
            setBedFormError(err?.response?.data?.message || 'Failed to add bed.');
        } finally { setSaving(false); }
    };

    const handleAdmit = async (e) => {
        e.preventDefault();
        setAdmitError('');
        if (!admitForm.patientName || !admitForm.diagnosis) {
            setAdmitError('Patient name and diagnosis are required.');
            return;
        }
        setSaving(true);
        try {
            await bedApi.admitPatient(selectedBed._id, admitForm);
            setShowAdmitModal(false);
            fetchAll();
        } catch (err) {
            setAdmitError(err?.response?.data?.message || 'Admit failed.');
        } finally { setSaving(false); }
    };

    const handleDischarge = async (bed) => {
        if (!window.confirm(`Discharge ${bed.patientName} from ${bed.bedNumber}?`)) return;
        try {
            const res = await bedApi.dischargePatient(bed._id);
            alert(res.data.message || 'Patient discharged successfully.');
            fetchAll();
        } catch (err) { alert(err?.response?.data?.message || 'Discharge failed.'); }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setTransferError('');
        if (!transferTargetId) { setTransferError('Please select a target bed.'); return; }
        setSaving(true);
        try {
            const res = await bedApi.transferPatient(selectedBed._id, { targetBedId: transferTargetId });
            alert(res.data.message || 'Patient transferred successfully.');
            setShowTransferModal(false);
            fetchAll();
        } catch (err) {
            setTransferError(err?.response?.data?.message || 'Transfer failed.');
        } finally { setSaving(false); }
    };

    const handleMarkAvailable = async (id) => {
        try { await bedApi.updateBed(id, { status: 'Available' }); fetchAll(); }
        catch { alert('Failed to update bed status.'); }
    };

    const handleDeleteBed = async (id) => {
        if (!window.confirm('Remove this bed from the system?')) return;
        try { await bedApi.deleteBed(id); fetchAll(); }
        catch (err) { alert(err?.response?.data?.message || 'Delete failed.'); }
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BedDouble size={26} color="#0066FF" /> Bed &amp; Ward Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
                        Real-time bed occupancy, patient admission, discharge &amp; transfer
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => setViewMode(v => v === 'grid' ? 'table' : 'grid')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {viewMode === 'grid' ? <><List size={16} /> Table View</> : <><LayoutGrid size={16} /> Grid View</>}
                    </button>
                    <button className="btn btn-primary" onClick={() => {
                        setBedForm({ ward: 'General Ward', bedNumber: '', status: 'Available', patientName: '', age: '', gender: 'Male', doctorName: '', diagnosis: '' });
                        setBedFormError('');
                        setShowAddModal(true);
                    }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Plus size={16} /> Add Bed
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                <StatCard label="Total Beds"     value={stats.total || 0}              icon={<BedDouble size={24} color="#0066FF" />}     bg="#EEF4FF"  color="#0066FF" />
                <StatCard label="Occupied"        value={stats.occupied || 0}            icon={<BedDouble size={24} color="#EF4444" />}     bg="#FEE2E2"  color="#EF4444" />
                <StatCard label="Available"       value={stats.available || 0}           icon={<CheckCircle2 size={24} color="#10B981" />}  bg="#D1FAE5"  color="#10B981" />
                <StatCard label="Cleaning"        value={stats.cleaning || 0}            icon={<Activity size={24} color="#F59E0B" />}      bg="#FEF3C7"  color="#F59E0B" />
                <StatCard label="Occupancy Rate"  value={`${stats.occupancyRate || 0}%`} icon={<TrendingUp size={24} color="#8B5CF6" />}    bg="#F3E8FF"  color="#8B5CF6" />
            </div>

            {/* Occupancy Bar */}
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={16} color="#64748B" /> Overall Bed Occupancy
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: barColor }}>{stats.occupancyRate || 0}%</span>
                </div>
                <div style={{ height: 10, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(occupancyPct, 100)}%`, background: barColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BedDouble size={13} color="#EF4444" /> {stats.occupied || 0} occupied</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} color="#10B981" /> {stats.available || 0} available</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={13} color="#F59E0B" /> {stats.cleaning || 0} cleaning</span>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
                    <Search size={16} color="#94A3B8" />
                    <input type="text" placeholder="Search by bed, patient, ward..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0', fontSize: '0.9rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }} />
                </div>
                <select className="input-field" value={filterWard} onChange={e => setFilterWard(e.target.value)} style={{ width: 'auto' }}>
                    {WARDS.map(w => <option key={w}>{w}</option>)}
                </select>
                <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
                    {['All', 'Available', 'Occupied', 'Cleaning'].map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {error && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, gap: 12, color: 'var(--text-muted)' }}>
                    <div className="loading-spinner" /><span>Loading beds...</span>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── Grid View ── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {beds.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <BedDouble size={48} color="#E2E8F0" style={{ display: 'block', margin: '0 auto 14px' }} />
                            No beds found. Click "+ Add Bed" to register beds.
                        </div>
                    ) : beds.map(bed => {
                        const sc = STATUS_CONFIG[bed.status] || STATUS_CONFIG.Available;
                        const StatusIcon = sc.Icon;
                        return (
                            <div key={bed._id} className="card" style={{ padding: '1.1rem', borderTop: `3px solid ${sc.color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <BedDouble size={17} color={sc.color} /> {bed.bedNumber}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Building2 size={12} /> {bed.ward}
                                        </div>
                                    </div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                                        <StatusIcon size={12} /> {sc.label}
                                    </span>
                                </div>

                                {bed.status === 'Occupied' ? (
                                    <>
                                        <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '0.7rem 0.85rem', marginBottom: 10 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <User size={14} color="#0066FF" /> {bed.patientName}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{bed.gender}, {bed.age}y</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                                                <span style={{ fontWeight: 600 }}>Dx:</span> {bed.diagnosis}
                                            </div>
                                            {bed.doctorName && (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Stethoscope size={11} /> {bed.doctorName}
                                                </div>
                                            )}
                                            {bed.admitDate && (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                                                    Admitted: {bed.admitDate}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                                onClick={() => { setSelectedBed(bed); setTransferTargetId(''); setTransferError(''); setShowTransferModal(true); }}>
                                                <ArrowRightLeft size={13} /> Transfer
                                            </button>
                                            <button className="btn btn-sm" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
                                                onClick={() => handleDischarge(bed)}>
                                                <LogOut size={13} /> Discharge
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '8px 0 12px' }}>
                                            {bed.status === 'Available' ? 'Bed is ready for patient admission.' : 'Bed is being cleaned / prepared.'}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button className="btn btn-primary btn-sm" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                                onClick={() => { setSelectedBed(bed); setAdmitForm({ patientName: '', age: '', gender: 'Male', doctorName: '', diagnosis: '' }); setAdmitError(''); setShowAdmitModal(true); }}>
                                                <UserPlus size={13} /> Mark Occupied / Admit
                                            </button>
                                            {bed.status === 'Cleaning' && (
                                                <button className="btn btn-sm" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' }}
                                                    onClick={() => handleMarkAvailable(bed._id)}>
                                                    <CheckCircle2 size={13} /> Ready
                                                </button>
                                            )}
                                            <button className="btn btn-sm" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0' }}
                                                onClick={() => handleDeleteBed(bed._id)}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── Table View ── */
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Bed ID</th>
                                <th>Bed No.</th>
                                <th>Ward</th>
                                <th>Status</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Admit Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beds.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No beds found.</td></tr>
                            ) : beds.map(bed => {
                                const sc = STATUS_CONFIG[bed.status] || STATUS_CONFIG.Available;
                                const StatusIcon = sc.Icon;
                                return (
                                    <tr key={bed._id}>
                                        <td><span style={{ fontWeight: 700, color: '#0066FF', fontSize: '0.82rem', fontFamily: 'monospace', background: '#EEF4FF', padding: '3px 8px', borderRadius: 6 }}>{bed.bedId}</span></td>
                                        <td><strong>{bed.bedNumber}</strong></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{bed.ward}</td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                                                <StatusIcon size={12} /> {sc.label}
                                            </span>
                                        </td>
                                        <td>
                                            {bed.patientName
                                                ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} color="#64748B" /><span style={{ fontWeight: 600 }}>{bed.patientName}</span></div>
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                            {bed.doctorName ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Stethoscope size={13} color="#94A3B8" /> {bed.doctorName}</span> : '—'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{bed.admitDate || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                {bed.status !== 'Occupied' && (
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setSelectedBed(bed); setAdmitForm({ patientName: '', age: '', gender: 'Male', doctorName: '', diagnosis: '' }); setAdmitError(''); setShowAdmitModal(true); }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><UserPlus size={12} /> Mark Occupied</button>
                                                )}
                                                {bed.status === 'Occupied' && (<>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedBed(bed); setTransferTargetId(''); setTransferError(''); setShowTransferModal(true); }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowRightLeft size={12} /> Transfer</button>
                                                    <button className="btn btn-sm" onClick={() => handleDischarge(bed)}
                                                        style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: 4 }}><LogOut size={12} /> Discharge</button>
                                                </>)}
                                                {bed.status === 'Cleaning' && (
                                                    <button className="btn btn-sm" onClick={() => handleMarkAvailable(bed._id)}
                                                        style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Available</button>
                                                )}
                                                <button className="btn btn-sm" onClick={() => handleDeleteBed(bed._id)}
                                                    style={{ background: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center' }}><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Add Bed Modal ── */}
            {showAddModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
                    <div className="modal-content" style={{ maxWidth: 500 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BedDouble size={18} color="#0066FF" /> Add New Bed
                            </h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={22} /></button>
                        </div>
                        {bedFormError && <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}><AlertCircle size={15} /> {bedFormError}</div>}
                        <form onSubmit={handleAddBed}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Ward *</label>
                                    <select className="input-field" value={bedForm.ward} onChange={e => setBedForm({ ...bedForm, ward: e.target.value })}>
                                        {WARD_OPTIONS.map(w => <option key={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bed Number *</label>
                                    <input className="input-field" value={bedForm.bedNumber} onChange={e => setBedForm({ ...bedForm, bedNumber: e.target.value })} required placeholder="e.g. G-101, ICU-03" />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Initial Status *</label>
                                    <select className="input-field" value={bedForm.status} onChange={e => setBedForm({ ...bedForm, status: e.target.value })}>
                                        <option value="Available">Available (Ready for Patients)</option>
                                        <option value="Occupied">Occupied (Admit Patient Immediately)</option>
                                        <option value="Cleaning">Cleaning / Under Maintenance</option>
                                    </select>
                                </div>

                                {bedForm.status === 'Occupied' && (
                                    <>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.2rem 0' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0066FF' }}>Patient Admission Details:</span>
                                        </div>
                                        <div className="form-group">
                                            <label>Patient Name *</label>
                                            <input className="input-field" value={bedForm.patientName} onChange={e => setBedForm({ ...bedForm, patientName: e.target.value })} required placeholder="Patient Full Name" />
                                        </div>
                                        <div className="form-group">
                                            <label>Age</label>
                                            <input className="input-field" type="number" value={bedForm.age} onChange={e => setBedForm({ ...bedForm, age: e.target.value })} placeholder="45" />
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select className="input-field" value={bedForm.gender} onChange={e => setBedForm({ ...bedForm, gender: e.target.value })}>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Attending Doctor</label>
                                            <select className="input-field" value={bedForm.doctorName} onChange={e => setBedForm({ ...bedForm, doctorName: e.target.value })}>
                                                <option value="">-- Select Doctor --</option>
                                                {doctors.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label>Diagnosis *</label>
                                            <input className="input-field" value={bedForm.diagnosis} onChange={e => setBedForm({ ...bedForm, diagnosis: e.target.value })} required placeholder="Reason for Admission" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Saving...' : <><Plus size={15} /> Save Bed</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Admit Modal / Mark Occupied ── */}
            {showAdmitModal && selectedBed && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdmitModal(false)}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <UserPlus size={18} color="#0066FF" /> Mark Bed Occupied — Admit Patient
                            </h2>
                            <button onClick={() => setShowAdmitModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={22} /></button>
                        </div>
                        <div style={{ background: '#EEF4FF', borderRadius: 10, padding: '0.65rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BedDouble size={16} color="#0066FF" />
                            <span style={{ fontSize: '0.85rem', color: '#0066FF', fontWeight: 600 }}>{selectedBed.bedNumber} — {selectedBed.ward}</span>
                        </div>
                        {admitError && <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}><AlertCircle size={15} /> {admitError}</div>}
                        <form onSubmit={handleAdmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Patient Name *</label>
                                    <input className="input-field" value={admitForm.patientName} onChange={e => setAdmitForm({ ...admitForm, patientName: e.target.value })} required placeholder="Full name" />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input className="input-field" type="number" min="0" value={admitForm.age} onChange={e => setAdmitForm({ ...admitForm, age: e.target.value })} placeholder="45" />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select className="input-field" value={admitForm.gender} onChange={e => setAdmitForm({ ...admitForm, gender: e.target.value })}>
                                        {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Attending Doctor</label>
                                    <select className="input-field" value={admitForm.doctorName} onChange={e => setAdmitForm({ ...admitForm, doctorName: e.target.value })}>
                                        <option value="">-- Select Doctor --</option>
                                        {doctors.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Diagnosis / Reason for Admission *</label>
                                    <textarea className="input-field" rows={3} value={admitForm.diagnosis} onChange={e => setAdmitForm({ ...admitForm, diagnosis: e.target.value })} required style={{ resize: 'vertical' }} placeholder="e.g. Pneumonia, Post-op recovery, Acute MI..." />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdmitModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Admitting...' : <><CheckCircle2 size={15} /> Confirm &amp; Mark Occupied</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Transfer Modal ── */}
            {showTransferModal && selectedBed && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTransferModal(false)}>
                    <div className="modal-content" style={{ maxWidth: 460 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ArrowRightLeft size={18} color="#0066FF" /> Transfer Patient
                            </h2>
                            <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={22} /></button>
                        </div>
                        <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                <User size={14} color="#0066FF" />
                                Moving <strong style={{ color: 'var(--text-main)', marginLeft: 3 }}>{selectedBed.patientName}</strong>
                                &nbsp;from&nbsp;
                                <span style={{ fontWeight: 700, color: '#0066FF', background: '#EEF4FF', padding: '2px 8px', borderRadius: 6 }}>{selectedBed.bedNumber}</span>
                            </div>
                        </div>
                        {transferError && <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}><AlertCircle size={15} /> {transferError}</div>}
                        <form onSubmit={handleTransfer}>
                            <div className="form-group">
                                <label>Select Target Bed *</label>
                                <select className="input-field" value={transferTargetId} onChange={e => setTransferTargetId(e.target.value)} required>
                                    <option value="">-- Select Available / Cleaning Bed --</option>
                                    {availableForTransfer.map(b => (
                                        <option key={b._id} value={b._id}>{b.bedNumber} — {b.ward} ({b.status})</option>
                                    ))}
                                </select>
                                {availableForTransfer.length === 0 && (
                                    <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <AlertTriangle size={14} /> No available beds for transfer currently.
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving || availableForTransfer.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Transferring...' : <><ArrowRightLeft size={15} /> Confirm Transfer</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BedManagementPage;
