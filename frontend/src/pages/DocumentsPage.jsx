import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  X,
  FileCheck,
  FilePlus,
  ShieldCheck,
  HardDrive,
  FolderOpen,
  Filter,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

const initialDocuments = [
  {
    id: 'DOC-1001',
    title: 'Patient Medical Intake Form & History',
    category: 'Intake & Consent',
    owner: 'Rahul Sharma',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedAt: '2026-08-20',
    status: 'Verified',
    notes: 'Signed initial general medical consultation intake form.'
  },
  {
    id: 'DOC-1002',
    title: 'Comprehensive Blood Panel & Lipid Profile',
    category: 'Lab Results',
    owner: 'Ananya Roy',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedAt: '2026-08-22',
    status: 'Verified',
    notes: 'Complete blood count and cholesterol analysis report.'
  },
  {
    id: 'DOC-1003',
    title: 'Government Identity Proof (Aadhaar / Card)',
    category: 'Identity Proof',
    owner: 'Vikram Singh',
    fileType: 'JPG',
    fileSize: '850 KB',
    uploadedAt: '2026-08-23',
    status: 'Verified',
    notes: 'Verified national identity proof document.'
  },
  {
    id: 'DOC-1004',
    title: 'Post-Op Surgical Rehabilitation Plan',
    category: 'Clinical Reports',
    owner: 'Priya Verma',
    fileType: 'DOCX',
    fileSize: '3.1 MB',
    uploadedAt: '2026-08-24',
    status: 'Pending Review',
    notes: 'Orthopedic discharge summary and exercise routine guidelines.'
  },
  {
    id: 'DOC-1005',
    title: 'Medical Fitness & Vaccination Certificate',
    category: 'Medical Certifications',
    owner: 'Mary Joseph',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    uploadedAt: '2026-08-25',
    status: 'Verified',
    notes: 'Authorized health fitness certificate for employment.'
  }
];

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('caresync_documents_list');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Clinical Reports',
    owner: '',
    fileType: 'PDF',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('caresync_documents_list', JSON.stringify(documents));
  }, [documents]);

  const categories = [
    'All',
    'Clinical Reports',
    'Intake & Consent',
    'Lab Results',
    'Identity Proof',
    'Medical Certifications'
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Metrics
  const totalCount = documents.length;
  const intakeCount = documents.filter((d) => d.category === 'Intake & Consent' || d.category === 'Clinical Reports').length;
  const labCount = documents.filter((d) => d.category === 'Lab Results').length;
  const verifiedCount = documents.filter((d) => d.status === 'Verified').length;

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadData.title.trim()) return;

    const newDoc = {
      id: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
      title: uploadData.title,
      category: uploadData.category,
      owner: uploadData.owner.trim() || 'General Patient',
      fileType: uploadData.fileType,
      fileSize: (Math.random() * 2 + 0.5).toFixed(1) + ' MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Verified',
      notes: uploadData.notes || 'Newly uploaded clinic document.'
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    setUploadData({
      title: '',
      category: 'Clinical Reports',
      owner: '',
      fileType: 'PDF',
      notes: ''
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setDocuments(documents.filter((d) => d.id !== id));
    }
  };

  const handleDownloadMock = (doc) => {
    const element = document.createElement('a');
    const file = new Blob([`CareSync Medical Document Vault\n\nTitle: ${doc.title}\nCategory: ${doc.category}\nOwner: ${doc.owner}\nUploaded Date: ${doc.uploadedAt}\nNotes: ${doc.notes}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}_${doc.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Documents & Media Vault
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Securely store, organize, preview, and download patient clinical records, intake forms & certifications
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '230px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Document, ID or Patient..."
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsUploadModalOpen(true)}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Documents */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL VAULT DOCUMENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        {/* Clinical & Intake */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>CLINICAL & INTAKE FORMS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{intakeCount}</div>
          </div>
        </div>

        {/* Lab Results */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>LAB & DIAGNOSTIC PAPERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{labCount}</div>
          </div>
        </div>

        {/* Verified Status */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>VERIFIED & AUDITED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{verifiedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Documents Table View */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document Details</th>
                <th>Category</th>
                <th>Patient / Owner</th>
                <th>File Size & Format</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: doc.fileType === 'PDF' ? '#FEE2E2' : doc.fileType === 'JPG' ? '#FEF3C7' : '#DBEAFE',
                            color: doc.fileType === 'PDF' ? '#EF4444' : doc.fileType === 'JPG' ? '#D97706' : '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            fontWeight: '800',
                            fontSize: '0.75rem'
                          }}
                        >
                          {doc.fileType}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{doc.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                        {doc.category}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontSize: '0.85rem', fontWeight: '600' }}>
                        <User size={14} color="#64748B" />
                        {doc.owner}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '500' }}>
                        {doc.fileSize} ({doc.fileType})
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.82rem' }}>
                        <Clock size={13} />
                        {doc.uploadedAt}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${doc.status === 'Verified' ? 'badge-success' : 'badge-warning'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="action-btn"
                          title="Preview Document"
                          onClick={() => setPreviewDoc(doc)}
                          style={{ color: '#0066FF', background: '#EFF6FF', border: 'none', padding: '0.4rem', borderRadius: '8px' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn"
                          title="Download File"
                          onClick={() => handleDownloadMock(doc)}
                          style={{ color: '#10B981', background: '#ECFDF5', border: 'none', padding: '0.4rem', borderRadius: '8px' }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="action-btn"
                          title="Delete Document"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          style={{ color: '#EF4444', background: '#FEE2E2', border: 'none', padding: '0.4rem', borderRadius: '8px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No documents found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Upload Document Modal */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
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
              maxWidth: '520px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FilePlus size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Upload New Document</h2>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest X-Ray Radiology Scan"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="Clinical Reports">Clinical Reports</option>
                    <option value="Intake & Consent">Intake & Consent</option>
                    <option value="Lab Results">Lab Results</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Medical Certifications">Medical Certifications</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    File Extension
                  </label>
                  <select
                    value={uploadData.fileType}
                    onChange={(e) => setUploadData({ ...uploadData, fileType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="PDF">PDF File (.pdf)</option>
                    <option value="JPG">Image (.jpg/.png)</option>
                    <option value="DOCX">Word Doc (.docx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Associated Patient / Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={uploadData.owner}
                  onChange={(e) => setUploadData({ ...uploadData, owner: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Notes & Details
                </label>
                <textarea
                  rows="3"
                  placeholder="Additional context regarding this document..."
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700' }}
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Preview Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
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
                  <FileText size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>{previewDoc.title}</h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Vault Record ID: {previewDoc.id}</span>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Category:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{previewDoc.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Associated Patient / Owner:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{previewDoc.owner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>File Format & Size:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{previewDoc.fileType} ({previewDoc.fileSize})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Upload Date:</span>
                <span style={{ color: '#0F172A', fontWeight: '700' }}>{previewDoc.uploadedAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Security Status:</span>
                <span style={{ color: previewDoc.status === 'Verified' ? '#10B981' : '#F59E0B', fontWeight: '700' }}>{previewDoc.status}</span>
              </div>
              <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.85rem' }}>
                <span style={{ display: 'block', color: '#64748B', fontWeight: '600', marginBottom: '0.2rem' }}>Notes & Remarks:</span>
                <span style={{ color: '#334155', lineHeight: '1.5' }}>{previewDoc.notes}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => handleDownloadMock(previewDoc)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
              >
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentsPage;
