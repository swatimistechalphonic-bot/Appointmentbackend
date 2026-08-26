import React, { useState, useEffect } from 'react';
import { patientApi, authApi } from '../services/api';
import {
  Activity,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  FileText,
  CheckCircle2,
  Filter,
  FlaskConical,
  Beaker,
  ShieldAlert,
  Clipboard,
  Printer,
  Download,
  AlertTriangle
} from 'lucide-react';

const LabPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTest, setActiveTest] = useState(null);
  const [viewReport, setViewReport] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);

  // Fetch real patients and doctors to populate form dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          patientApi.getAllPatients(''),
          authApi.getDoctors()
        ]);
        const pats = patientsRes.data?.patients || [];
        const docs = doctorsRes.data?.doctors || doctorsRes.data || [];
        if (pats.length > 0) setPatientOptions(pats.map(p => p.name));
        if (docs.length > 0) setDoctorOptions(docs.map(d => d.name ? 'Dr. ' + d.name : 'Dr. Specialist'));
      } catch (err) {
        console.error('Lab options fetch error:', err);
      }
    };
    fetchOptions();
  }, []);



  // Initial Diagnostic Tests and Requests list
  const [tests, setTests] = useState([
    {
      id: 'LAB-2026-001',
      patientName: 'Swati Verma',
      age: 26,
      gender: 'Female',
      doctorName: 'Dr. Rahul Sharma',
      testType: 'Complete Blood Count (CBC)',
      priority: 'Normal',
      requestDate: '2026-08-24',
      status: 'Pending',
      parameters: {
        hemoglobin: '',
        wbc: '',
        platelets: ''
      },
      flag: 'Normal'
    },
    {
      id: 'LAB-2026-002',
      patientName: 'Rahul Sharma',
      age: 34,
      gender: 'Male',
      doctorName: 'Dr. Amit Verma',
      testType: 'Lipid Profile',
      priority: 'Urgent',
      requestDate: '2026-08-23',
      status: 'In Progress',
      parameters: {
        cholesterol: '',
        triglycerides: '',
        hdl: '',
        ldl: ''
      },
      flag: 'Normal'
    },
    {
      id: 'LAB-2026-003',
      patientName: 'Priya Patel',
      age: 28,
      gender: 'Female',
      doctorName: 'Dr. Neha Singh',
      testType: 'Thyroid Profile (T3, T4, TSH)',
      priority: 'Normal',
      requestDate: '2026-08-22',
      status: 'Completed',
      parameters: {
        t3: '1.2', // Normal range: 0.8 - 2.0
        t4: '7.8', // Normal range: 4.5 - 11.5
        tsh: '2.5'  // Normal range: 0.4 - 4.5
      },
      flag: 'Normal',
      completedDate: '2026-08-22'
    },
    {
      id: 'LAB-2026-004',
      patientName: 'Karan Mehta',
      age: 45,
      gender: 'Male',
      doctorName: 'Dr. Vivek Malhotra',
      testType: 'Blood Sugar (Fasting & PP)',
      priority: 'Urgent',
      requestDate: '2026-08-21',
      status: 'Completed',
      parameters: {
        fasting: '168', // Normal range: 70 - 100
        pp: '240'       // Normal range: < 140
      },
      flag: 'Abnormal',
      completedDate: '2026-08-22'
    },
    {
      id: 'LAB-2026-005',
      patientName: 'Simran Kaur',
      age: 29,
      gender: 'Female',
      doctorName: 'Dr. Pooja Sharma',
      testType: 'Urine Routine',
      priority: 'Normal',
      requestDate: '2026-08-24',
      status: 'Sample Collected',
      parameters: {
        color: '',
        pH: '',
        protein: ''
      },
      flag: 'Normal'
    }
  ]);

  // Form states for entering numeric parameters
  const [cbcFormData, setCbcFormData] = useState({ hemoglobin: '', wbc: '', platelets: '' });
  const [lipidFormData, setLipidFormData] = useState({ cholesterol: '', triglycerides: '', hdl: '', ldl: '' });
  const [thyroidFormData, setThyroidFormData] = useState({ t3: '', t4: '', tsh: '' });
  const [sugarFormData, setSugarFormData] = useState({ fasting: '', pp: '' });
  const [urineFormData, setUrineFormData] = useState({ color: 'Pale Yellow', pH: '6.0', protein: 'Negative' });

  // Filtered lists
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = tests.length;
  const pendingCount = tests.filter(t => t.status === 'Pending').length;
  const progressCount = tests.filter(t => t.status === 'In Progress' || t.status === 'Sample Collected').length;
  const abnormalCount = tests.filter(t => t.status === 'Completed' && t.flag === 'Abnormal').length;

  // Status transitions
  const handleCollectSample = (id) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'Sample Collected' } : t));
  };

  const handleStartTesting = (id) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'In Progress' } : t));
  };

  const handleOpenResultsModal = (t) => {
    setActiveTest(t);
    // Initialize specific forms based on test type
    if (t.testType.includes('CBC')) {
      setCbcFormData({ hemoglobin: t.parameters.hemoglobin || '14.0', wbc: t.parameters.wbc || '7200', platelets: t.parameters.platelets || '260000' });
    } else if (t.testType.includes('Lipid')) {
      setLipidFormData({ cholesterol: t.parameters.cholesterol || '195', triglycerides: t.parameters.triglycerides || '140', hdl: t.parameters.hdl || '50', ldl: t.parameters.ldl || '110' });
    } else if (t.testType.includes('Thyroid')) {
      setThyroidFormData({ t3: t.parameters.t3 || '1.4', t4: t.parameters.t4 || '8.2', tsh: t.parameters.tsh || '2.8' });
    } else if (t.testType.includes('Sugar')) {
      setSugarFormData({ fasting: t.parameters.fasting || '95', pp: t.parameters.pp || '135' });
    } else {
      setUrineFormData({ color: t.parameters.color || 'Pale Yellow', pH: t.parameters.pH || '6.0', protein: t.parameters.protein || 'Negative' });
    }
  };

  // Submit results & automatically calculate normal/abnormal bounds
  const handleSubmitResults = (e) => {
    e.preventDefault();
    if (!activeTest) return;

    let params = {};
    let flag = 'Normal';

    if (activeTest.testType.includes('CBC')) {
      params = { ...cbcFormData };
      const hbVal = parseFloat(cbcFormData.hemoglobin);
      const wbcVal = parseFloat(cbcFormData.wbc);
      if (hbVal < 11.5 || hbVal > 17.5 || wbcVal < 4000 || wbcVal > 11000) {
        flag = 'Abnormal';
      }
    } else if (activeTest.testType.includes('Lipid')) {
      params = { ...lipidFormData };
      const chol = parseFloat(lipidFormData.cholesterol);
      const ldlVal = parseFloat(lipidFormData.ldl);
      if (chol > 200 || ldlVal > 130) {
        flag = 'Abnormal';
      }
    } else if (activeTest.testType.includes('Thyroid')) {
      params = { ...thyroidFormData };
      const tshVal = parseFloat(thyroidFormData.tsh);
      if (tshVal < 0.4 || tshVal > 4.5) {
        flag = 'Abnormal';
      }
    } else if (activeTest.testType.includes('Sugar')) {
      params = { ...sugarFormData };
      const fastingVal = parseFloat(sugarFormData.fasting);
      const ppVal = parseFloat(sugarFormData.pp);
      if (fastingVal > 100 || ppVal > 140) {
        flag = 'Abnormal';
      }
    } else {
      params = { ...urineFormData };
      if (urineFormData.protein !== 'Negative') {
        flag = 'Abnormal';
      }
    }

    setTests(prev =>
      prev.map(t =>
        t.id === activeTest.id
          ? {
              ...t,
              status: 'Completed',
              parameters: params,
              flag,
              completedDate: new Date().toISOString().split('T')[0]
            }
          : t
      )
    );

    setActiveTest(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Laboratory & Diagnostics Panel
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Collect biological samples, record diagnostic test parameters, check ranges, and verify clinical reports</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Test ID or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Collection</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="In Progress">Testing In Progress</option>
            <option value="Completed">Completed Reports</option>
          </select>
        </div>
      </div>

      {/* 2. Diagnostic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Test Requests */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clipboard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TEST REQUESTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        {/* Card 2: Pending Samples */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>PENDING COLLECTION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{pendingCount}</div>
          </div>
        </div>

        {/* Card 3: In Process */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Beaker size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>TESTING IN PROGRESS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{progressCount}</div>
          </div>
        </div>

        {/* Card 4: Critical Abnormal Alerts */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: '700' }}>ABNORMAL ALERTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#991B1B', marginTop: '0.1rem' }}>{abnormalCount}</div>
          </div>
        </div>

      </div>

      {/* 3. Main Data Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Test ID</th>
                <th style={{ padding: '0.75rem' }}>Patient Details</th>
                <th style={{ padding: '0.75rem' }}>Diagnostician / Doctor</th>
                <th style={{ padding: '0.75rem' }}>Test Category</th>
                <th style={{ padding: '0.75rem' }}>Priority</th>
                <th style={{ padding: '0.75rem' }}>Request Date</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0066FF' }}>{t.id}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A' }}>{t.patientName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>{t.age} Yrs ({t.gender})</div>
                  </td>
                  <td style={{ padding: '0.85rem', color: '#475569', fontWeight: '600' }}>{t.doctorName}</td>
                  <td style={{ padding: '0.85rem', color: '#0F172A', fontWeight: '700' }}>{t.testType}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`doc-badge ${t.priority === 'Urgent' ? 'cancelled' : 'pending'}`} style={{ fontSize: '0.74rem' }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', color: '#64748B' }}>{t.requestDate}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`doc-badge ${
                      t.status === 'Completed' ? 'confirmed' :
                      t.status === 'In Progress' ? 'pending' :
                      t.status === 'Sample Collected' ? 'pending' : 'cancelled'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                      
                      {t.status === 'Pending' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                          onClick={() => handleCollectSample(t.id)}
                        >
                          Collect Sample
                        </button>
                      )}

                      {t.status === 'Sample Collected' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#4F46E5', borderColor: '#C7D2FE', background: '#EEF2FF' }}
                          onClick={() => handleStartTesting(t.id)}
                        >
                          Start Testing
                        </button>
                      )}

                      {t.status === 'In Progress' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                          onClick={() => handleOpenResultsModal(t)}
                        >
                          Enter Results
                        </button>
                      )}

                      {t.status === 'Completed' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#166534', borderColor: '#A7F3D0', background: '#ECFDF5', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setViewReport(t)}
                        >
                          <FileText size={13} /> View Report
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modals */}

      {/* Modal A: Enter Results Form */}
      {activeTest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FlaskConical size={22} color="#0066FF" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Enter Lab Parameters</h2>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0 }}>Input findings for {activeTest.testType}</p>
                </div>
              </div>
              <button onClick={() => setActiveTest(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitResults}>
              <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '10px', marginBottom: '1.15rem', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Patient: <strong style={{ color: '#0F172A' }}>{activeTest.patientName} ({activeTest.gender}, {activeTest.age} yrs)</strong></div>
                <div>Requester: <strong style={{ color: '#0F172A' }}>{activeTest.doctorName}</strong></div>
              </div>

              {/* Form Input fields dynamically rendered based on selected test type */}
              
              {/* CBC Parameters Form */}
              {activeTest.testType.includes('CBC') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label>Hemoglobin (Hb) [g/dL] (Ref: 12.0 - 17.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      value={cbcFormData.hemoglobin}
                      onChange={(e) => setCbcFormData({ ...cbcFormData, hemoglobin: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>White Blood Cells (WBC) [/mcL] (Ref: 4000 - 11000)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={cbcFormData.wbc}
                      onChange={(e) => setCbcFormData({ ...cbcFormData, wbc: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Platelet Count [/mcL] (Ref: 150000 - 450000)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={cbcFormData.platelets}
                      onChange={(e) => setCbcFormData({ ...cbcFormData, platelets: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Lipid Profile Parameters Form */}
              {activeTest.testType.includes('Lipid') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label>Cholesterol [mg/dL] (&lt; 200)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={lipidFormData.cholesterol}
                        onChange={(e) => setLipidFormData({ ...lipidFormData, cholesterol: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Triglycerides [mg/dL] (&lt; 150)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={lipidFormData.triglycerides}
                        onChange={(e) => setLipidFormData({ ...lipidFormData, triglycerides: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label>HDL Cholesterol [mg/dL] (&gt; 40)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={lipidFormData.hdl}
                        onChange={(e) => setLipidFormData({ ...lipidFormData, hdl: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>LDL Cholesterol [mg/dL] (&lt; 130)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={lipidFormData.ldl}
                        onChange={(e) => setLipidFormData({ ...lipidFormData, ldl: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Thyroid Parameters Form */}
              {activeTest.testType.includes('Thyroid') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>T3 [nmol/L] (0.8-2.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={thyroidFormData.t3}
                        onChange={(e) => setThyroidFormData({ ...thyroidFormData, t3: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>T4 [ug/dL] (4.5-11.5)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={thyroidFormData.t4}
                        onChange={(e) => setThyroidFormData({ ...thyroidFormData, t4: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>TSH [uIU/mL] (0.4-4.5)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={thyroidFormData.tsh}
                        onChange={(e) => setThyroidFormData({ ...thyroidFormData, tsh: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sugar Parameters Form */}
              {activeTest.testType.includes('Sugar') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label>Fasting Blood Sugar [mg/dL] (Ref: 70 - 100)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={sugarFormData.fasting}
                        onChange={(e) => setSugarFormData({ ...sugarFormData, fasting: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Post-Prandial (PP) [mg/dL] (Ref: &lt; 140)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={sugarFormData.pp}
                        onChange={(e) => setSugarFormData({ ...sugarFormData, pp: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Urine Parameters Form */}
              {!activeTest.testType.includes('CBC') && !activeTest.testType.includes('Lipid') && !activeTest.testType.includes('Thyroid') && !activeTest.testType.includes('Sugar') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label>Urine Color</label>
                    <select
                      className="input-field"
                      value={urineFormData.color}
                      onChange={(e) => setUrineFormData({ ...urineFormData, color: e.target.value })}
                    >
                      <option value="Pale Yellow">Pale Yellow</option>
                      <option value="Straw Yellow">Straw Yellow</option>
                      <option value="Dark Yellow">Dark Amber Yellow</option>
                      <option value="Reddish">Reddish / Turbid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>pH Value (Ref: 4.5 - 8.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      value={urineFormData.pH}
                      onChange={(e) => setUrineFormData({ ...urineFormData, pH: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Protein Levels</label>
                    <select
                      className="input-field"
                      value={urineFormData.protein}
                      onChange={(e) => setUrineFormData({ ...urineFormData, protein: e.target.value })}
                    >
                      <option value="Negative">Negative (Normal)</option>
                      <option value="Trace">Trace (Borderline)</option>
                      <option value="1+">1+ (Abnormal)</option>
                      <option value="2+">2+ (Highly Abnormal)</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveTest(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Complete Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: View Diagnostic Report Print Preview */}
      {viewReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', padding: '2rem' }}>
            
            {/* Header toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }} className="no-print">
              <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#64748B' }}>Diagnostic Report Receipt</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }} onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setViewReport(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div style={{ color: '#0F172A' }}>
              
              {/* Lab Header details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CareSync Laboratories</h1>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>123 Healthway Blvd, Sector 62, Noida, India</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>Tel: +91 120 445566 | Email: lab@caresync.com</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0066FF' }}>REPORT ID: {viewReport.id}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Requested: {viewReport.requestDate}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Released: {viewReport.completedDate}</div>
                </div>
              </div>

              {/* Patient details card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ color: '#64748B' }}>PATIENT NAME</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>{viewReport.patientName}</div>
                  <div style={{ marginTop: '0.35rem', color: '#475569' }}>Age / Gender: <strong>{viewReport.age} Yrs / {viewReport.gender}</strong></div>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>REFERRING DOCTOR</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A', marginTop: '0.15rem' }}>{viewReport.doctorName}</div>
                  <div style={{ marginTop: '0.35rem', color: '#475569' }}>Category: <strong>{viewReport.testType}</strong></div>
                </div>
              </div>

              {/* Findings Table */}
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.75rem' }}>Clinical Test Parameters</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ background: '#0F172A', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.85rem' }}>Test parameter</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>Observed Value</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>Reference Range</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(viewReport.parameters).map(([key, val]) => {
                    // Check ranges to show Normal / Abnormal tag inside report
                    let ref = '';
                    let isAbnormal = false;

                    if (key === 'hemoglobin') { ref = '12.0 - 17.5 g/dL'; isAbnormal = parseFloat(val) < 12.0 || parseFloat(val) > 17.5; }
                    else if (key === 'wbc') { ref = '4000 - 11000 /mcL'; isAbnormal = parseFloat(val) < 4000 || parseFloat(val) > 11000; }
                    else if (key === 'platelets') { ref = '150000 - 450000 /mcL'; isAbnormal = parseFloat(val) < 150000 || parseFloat(val) > 450000; }
                    else if (key === 'cholesterol') { ref = '< 200 mg/dL'; isAbnormal = parseFloat(val) > 200; }
                    else if (key === 'triglycerides') { ref = '< 150 mg/dL'; isAbnormal = parseFloat(val) > 150; }
                    else if (key === 'hdl') { ref = '> 40 mg/dL'; isAbnormal = parseFloat(val) < 40; }
                    else if (key === 'ldl') { ref = '< 130 mg/dL'; isAbnormal = parseFloat(val) > 130; }
                    else if (key === 't3') { ref = '0.8 - 2.0 nmol/L'; isAbnormal = parseFloat(val) < 0.8 || parseFloat(val) > 2.0; }
                    else if (key === 't4') { ref = '4.5 - 11.5 ug/dL'; isAbnormal = parseFloat(val) < 4.5 || parseFloat(val) > 11.5; }
                    else if (key === 'tsh') { ref = '0.4 - 4.5 uIU/mL'; isAbnormal = parseFloat(val) < 0.4 || parseFloat(val) > 4.5; }
                    else if (key === 'fasting') { ref = '70 - 100 mg/dL'; isAbnormal = parseFloat(val) > 100; }
                    else if (key === 'pp') { ref = '< 140 mg/dL'; isAbnormal = parseFloat(val) > 140; }
                    else if (key === 'pH') { ref = '4.5 - 8.0'; isAbnormal = parseFloat(val) < 4.5 || parseFloat(val) > 8.0; }
                    else if (key === 'protein') { ref = 'Negative'; isAbnormal = val !== 'Negative'; }
                    else { ref = 'N/A'; }

                    return (
                      <tr key={key} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: '800', textTransform: 'uppercase', color: '#334155' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '800', color: isAbnormal ? '#DC2626' : '#0F172A' }}>
                          {val}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#64748B' }}>
                          {ref}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.15rem 0.45rem', 
                            fontSize: '0.72rem', 
                            borderRadius: '4px',
                            fontWeight: '800',
                            backgroundColor: isAbnormal ? '#FEE2E2' : '#DCFCE7',
                            color: isAbnormal ? '#DC2626' : '#15803D'
                          }}>
                            {isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Report Summary and Doctor Alert box */}
              {viewReport.flag === 'Abnormal' && (
                <div style={{ display: 'flex', gap: '0.65rem', padding: '0.85rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '0.78rem', color: '#92400E', marginBottom: '2rem' }}>
                  <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Clinical Finding Warning:</strong> Diagnostic values exceed safe physiological limits. Immediate clinical review by the referring physician (<strong>{viewReport.doctorName}</strong>) is recommended.
                  </div>
                </div>
              )}

              {/* Verification & Signature footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ color: '#64748B' }}>Verified Electronically By:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', marginTop: '0.2rem' }}>Dr. Amit Verma, MD (Pathology)</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Chief Pathology Specialist | Reg #Path-56321</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#4F46E5', fontWeight: '700', paddingRight: '1rem', borderBottom: '1px solid #94A3B8', display: 'inline-block', paddingBottom: '0.2rem' }}>
                    CareSync Lab
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.72rem', marginTop: '0.3rem' }}>Authorized Institutional Stamp</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LabPage;
