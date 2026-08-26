import React, { useState, useEffect, useCallback } from 'react';
import { serviceApi } from '../services/api';
import {
    Stethoscope, Search, Plus, X, Edit, Trash2,
    CheckCircle2, XCircle, AlertCircle, IndianRupee,
    Activity, Heart, Bone, Brain, Pill, Zap, Microscope, Smile
} from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Cardiology', 'Orthopedics', 'Neurology', 'Gynecology', 'Radiology', 'Pathology', 'Dental', 'Emergency'];

const CATEGORY_STYLES = {
    General:     { color: '#0066FF', bg: '#EEF4FF' },
    Cardiology:  { color: '#EF4444', bg: '#FEE2E2' },
    Orthopedics: { color: '#F59E0B', bg: '#FEF3C7' },
    Neurology:   { color: '#8B5CF6', bg: '#F3E8FF' },
    Gynecology:  { color: '#EC4899', bg: '#FCE7F3' },
    Radiology:   { color: '#06B6D4', bg: '#ECFEFF' },
    Pathology:   { color: '#14B8A6', bg: '#F0FDFA' },
    Dental:      { color: '#3B82F6', bg: '#EFF6FF' },
    Emergency:   { color: '#F97316', bg: '#FFF7ED' },
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

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [form, setForm] = useState({ name: '', category: 'General', price: '', duration: '', description: '', isActive: true });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [statsRes, servicesRes] = await Promise.all([
                serviceApi.getStats(),
                serviceApi.getAllServices({
                    search: search || undefined,
                    category: filterCategory !== 'All' ? filterCategory : undefined,
                    status: filterStatus !== 'All' ? filterStatus : undefined,
                })
            ]);
            setStats(statsRes.data.data || {});
            setServices(servicesRes.data.data || []);
        } catch {
            setError('Failed to load services. Please check the server connection.');
        } finally {
            setLoading(false);
        }
    }, [search, filterCategory, filterStatus]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openAdd = () => {
        setEditingService(null);
        setForm({ name: '', category: 'General', price: '', duration: '', description: '', isActive: true });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (svc) => {
        setEditingService(svc);
        setForm({ name: svc.name, category: svc.category || 'General', price: svc.price, duration: svc.duration || '', description: svc.description || '', isActive: svc.isActive });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!form.name || form.price === '') { setFormError('Service name and price are required.'); return; }
        setSaving(true);
        try {
            if (editingService) {
                await serviceApi.updateService(editingService._id, form);
            } else {
                await serviceApi.createService(form);
            }
            setShowModal(false);
            fetchAll();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Save failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete service "${name}"?`)) return;
        try { await serviceApi.deleteService(id); fetchAll(); }
        catch (err) { alert(err?.response?.data?.message || 'Delete failed.'); }
    };

    const avgPrice = stats.total ? Math.round((stats.totalRevenue || 0) / stats.total) : 0;

    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Stethoscope size={26} color="#0066FF" /> Clinical Services
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
                        Manage your hospital's service catalog, pricing &amp; availability
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> Add Service
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard label="Total Services" value={stats.total || 0} icon={<Stethoscope size={24} color="#0066FF" />} bg="#EEF4FF" color="#0066FF" />
                <StatCard label="Active Services" value={stats.active || 0} icon={<CheckCircle2 size={24} color="#10B981" />} bg="#D1FAE5" color="#10B981" />
                <StatCard label="Inactive" value={stats.inactive || 0} icon={<XCircle size={24} color="#F59E0B" />} bg="#FEF3C7" color="#F59E0B" />
                <StatCard label="Avg Price" value={`₹${avgPrice}`} icon={<IndianRupee size={24} color="#8B5CF6" />} bg="#F3E8FF" color="#8B5CF6" />
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
                    <Search size={16} color="#94A3B8" />
                    <input
                        type="text" placeholder="Search services..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0', fontSize: '0.9rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }}
                    />
                </div>
                <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 'auto' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
                    {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, gap: 12, color: 'var(--text-muted)' }}>
                        <div className="loading-spinner" />
                        <span>Loading services...</span>
                    </div>
                ) : (
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                                        <Stethoscope size={40} color="#E2E8F0" style={{ display: 'block', margin: '0 auto 12px' }} />
                                        No services found. Click "Add Service" to get started.
                                    </td>
                                </tr>
                            ) : services.map(svc => {
                                const cat = CATEGORY_STYLES[svc.category] || { color: '#64748B', bg: '#F1F5F9' };
                                return (
                                    <tr key={svc._id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{svc.name}</div>
                                            {svc.description && <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{svc.description}</div>}
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, background: cat.bg, color: cat.color }}>
                                                {svc.category || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 800, color: '#10B981', fontSize: '0.95rem' }}>₹{svc.price}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                            {svc.duration ? `${svc.duration} min` : '—'}
                                        </td>
                                        <td>
                                            {svc.isActive
                                                ? <span className="doc-badge confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Active</span>
                                                : <span className="doc-badge cancelled" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> Inactive</span>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openEdit(svc)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                >
                                                    <Edit size={13} /> Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                    onClick={() => handleDelete(svc._id, svc.name)}
                                                >
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

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {editingService ? <><Edit size={18} color="#0066FF" /> Edit Service</> : <><Plus size={18} color="#0066FF" /> Add New Service</>}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                <X size={22} />
                            </button>
                        </div>

                        {formError && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
                                <AlertCircle size={15} /> {formError}
                            </div>
                        )}

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Service Name *</label>
                                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. ECG Test, X-Ray Chest" required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input className="input-field" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0" placeholder="500" required />
                                </div>
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input className="input-field" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} min="0" placeholder="30" />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="input-field" value={form.isActive ? 'Active' : 'Inactive'} onChange={e => setForm({ ...form, isActive: e.target.value === 'Active' })}>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Description</label>
                                    <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the service..." style={{ resize: 'vertical' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? 'Saving...' : editingService ? <><Edit size={15} /> Update Service</> : <><Plus size={15} /> Create Service</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
