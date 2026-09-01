import React, { useState, useEffect, useCallback } from 'react';
import { documentApi, patientApi } from '../services/api';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  X,
  FileCheck,
  ShieldCheck,
  FolderOpen,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  Upload
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Clinical Reports',
  'Intake & Consent',
  'Lab Results',
  'Identity Proof',
  'Medical Certifications',
  'Insurance & Billing',
  'Other'
];

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientOptions, setPatientOptions] = useState([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Clinical Reports',
    owner: '',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    fileUrl: '',
    notes: '',
    status: 'Verified'
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, listRes] = await Promise.all([
        documentApi.getStats(),
        documentApi.getAllDocuments({
          search: searchTerm || undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
        })
      ]);
      setStats(statsRes.data?.data || { total: 0, verified: 0, pending: 0, archived: 0 });
      setDocuments(listRes.data?.data || []);
    } catch {
      setError('Failed to load documents. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Fetch real patients for owner dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientApi.getAllPatients('');
        const pats = res.data?.patients || [];
        if (pats.length > 0) setPatientOptions(pats.map(p => p.name));
      } catch (err) {
        console.error('Documents patient fetch error:', err);
      }
    };
    fetchPatients();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    let typeExt = file.name.split('.').pop().toUpperCase();
    if (typeExt === 'JPEG') typeExt = 'JPG';

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadData(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        fileType: typeExt || 'PDF',
        fileSize: sizeInMB,
        fileUrl: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadData.title.trim() || !uploadData.owner.trim()) {
      setUploadError('Document title and owner/patient name are required.');
      return;
    }
    setSubmitting(true);
    try {
      await documentApi.uploadDocument(uploadData);
      setIsUploadModalOpen(false);
      setUploadData({
        title: '',
        category: 'Clinical Reports',
        owner: '',
        fileType: 'PDF',
        fileSize: '1.5 MB',
        fileUrl: '',
        notes: '',
        status: 'Verified'
      });
      fetchAll();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await documentApi.deleteDocument(id);
        fetchAll();
      } catch {
        alert('Failed to delete document');
      }
    }
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const element = document.createElement('a');
      element.href = doc.fileUrl;
      element.download = `${doc.title.replace(/\s+/g, '_')}_${doc.documentId || 'doc'}.${doc.fileType.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([`CareSync Medical Document Vault\n\nDocument ID: ${doc.documentId || doc.id}\nTitle: ${doc.title}\nCategory: ${doc.category}\nOwner: ${doc.owner}\nUploaded Date: ${doc.uploadedAt}\nNotes: ${doc.notes || 'N/A'}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}_${doc.documentId || 'doc'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpen size={26} color="#0066FF" /> Documents &amp; Media Vault
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Securely store, organize, preview, and download patient clinical records, intake forms &amp; certifications
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search Document Title, Owner, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 0', fontSize: '0.82rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setUploadData({
                title: '',
                category: 'Clinical Reports',
                owner: patientOptions[0] || '',
                fileType: 'PDF',
                fileSize: '1.5 MB',
                fileUrl: '',
                notes: '',
                status: 'Verified'
              });
              setUploadError('');
              setIsUploadModalOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL DOCUMENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{stats.total || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>VERIFIED DOCUMENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{stats.verified || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>PENDING REVIEW</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{stats.pending || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#581C87', fontWeight: '700' }}>ARCHIVED VAULT</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#581C87', marginTop: '0.1rem' }}>{stats.archived || 0}</div>
          </div>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              borderRadius: '999px',
              backgroundColor: categoryFilter === cat ? '#0066FF' : '#FFFFFF',
              color: categoryFilter === cat ? '#FFFFFF' : 'var(--text-main)',
              borderColor: categoryFilter === cat ? '#0066FF' : '#E2E8F0',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--text-muted)', gap: 10 }}>
            <div className="loading-spinner" /> Loading documents...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Document Record</th>
                  <th>Category</th>
                  <th>Owner / Patient</th>
                  <th>File Format</th>
                  <th>Uploaded Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{doc.title}</div>
                            <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{doc.documentId || doc.id} • {doc.notes || 'Clinic Record'}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>{doc.category}</span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#0066FF', fontWeight: '600' }}>
                          <User size={14} /> {doc.owner}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', background: '#F1F5F9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          {doc.fileType} ({doc.fileSize})
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#64748B' }}>{doc.uploadedAt}</span>
                      </td>

                      <td>
                        <span className={`doc-badge ${doc.status === 'Verified' ? 'confirmed' : doc.status === 'Pending Review' ? 'pending' : 'cancelled'}`} style={{ fontSize: '0.75rem' }}>
                          {doc.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Preview Document"
                            onClick={() => setPreviewDoc(doc)}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Download Document"
                            onClick={() => handleDownload(doc)}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Download size={15} />
                          </button>
                          <button
                            className="btn btn-sm"
                            title="Delete Document"
                            onClick={() => handleDelete(doc._id, doc.title)}
                            style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '0.35rem 0.6rem' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                      No documents found matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Upload Document */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsUploadModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderOpen size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Upload Document to Vault</h2>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
                <AlertCircle size={15} /> {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* File Dropzone / Select */}
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer' }}>
                <Upload size={28} color="#0066FF" style={{ display: 'block', margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#0F172A' }}>
                  Click to select file or drag &amp; drop
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#64748B' }}>
                  Supports PDF, JPG, PNG, DOCX up to 10MB
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  style={{ display: 'none' }}
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.75rem', cursor: 'pointer', display: 'inline-flex', gap: 6 }}
                >
                  <Upload size={14} /> Browse File
                </label>
                {uploadData.fileUrl && (
                  <div style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: '#10B981', fontWeight: '700' }}>
                    ✓ Selected: {uploadData.fileType} ({uploadData.fileSize})
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Lab Results — Blood Panel Report"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Document Category</label>
                  <select
                    className="input-field"
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Format / Extension</label>
                  <select
                    className="input-field"
                    value={uploadData.fileType}
                    onChange={(e) => setUploadData({ ...uploadData, fileType: e.target.value })}
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="JPG">JPG Image</option>
                    <option value="PNG">PNG Image</option>
                    <option value="DOCX">DOCX Word</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Document Owner / Patient Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  list="patients-datalist"
                  placeholder="e.g. Rahul Sharma"
                  value={uploadData.owner}
                  onChange={(e) => setUploadData({ ...uploadData, owner: e.target.value })}
                />
                <datalist id="patients-datalist">
                  {patientOptions.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Notes / Context</label>
                <textarea
                  rows="2"
                  className="input-field"
                  placeholder="Additional observations or document remarks..."
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Document Preview */}
      {previewDoc && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewDoc(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Document Vault Viewer</h2>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Document Title</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: '2px 0 0' }}>{previewDoc.title}</h3>
              </div>

              {previewDoc.fileUrl && previewDoc.fileUrl.startsWith('data:image') && (
                <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                  <img src={previewDoc.fileUrl} alt={previewDoc.title} style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Ref ID:</strong> {previewDoc.documentId || previewDoc.id}</div>
                <div><strong>Category:</strong> {previewDoc.category}</div>
                <div><strong>Owner:</strong> {previewDoc.owner}</div>
                <div><strong>Format:</strong> {previewDoc.fileType} ({previewDoc.fileSize})</div>
                <div><strong>Uploaded Date:</strong> {previewDoc.uploadedAt}</div>
                <div><strong>Status:</strong> <span className="doc-badge confirmed" style={{ fontSize: '0.72rem' }}>{previewDoc.status}</span></div>
              </div>

              {previewDoc.notes && (
                <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.84rem', color: '#475569' }}>
                  <strong>Notes:</strong> {previewDoc.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(previewDoc)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={15} /> Download Document
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentsPage;
