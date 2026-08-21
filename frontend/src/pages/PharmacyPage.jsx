import React from 'react';
import { Pill, ShoppingBag, Tag, Search, Plus } from 'lucide-react';

const PharmacyPage = () => {
  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Fever & Pain Relief', price: '$12.50', stock: 'In Stock (120 Pcs)', iconBg: '#EEF2FF', iconColor: '#2F65F6' },
    { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotics', price: '$24.00', stock: 'In Stock (45 Pcs)', iconBg: '#ECFDF5', iconColor: '#10B981' },
    { id: 3, name: 'Vitamin C 1000mg', category: 'Supplements', price: '$18.90', stock: 'In Stock (200 Pcs)', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { id: 4, name: 'Cetirizine 10mg', category: 'Allergy & Cold', price: '$9.99', stock: 'Low Stock (12 Pcs)', iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { id: 5, name: 'Omeprazole 20mg', category: 'Gastroenterology', price: '$15.00', stock: 'In Stock (80 Pcs)', iconBg: '#F3E8FF', iconColor: '#8B5CF6' },
    { id: 6, name: 'Ibuprofen 400mg', category: 'Anti-Inflammatory', price: '$11.20', stock: 'In Stock (150 Pcs)', iconBg: '#E0F2FE', iconColor: '#0284C7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Doctris Pharmacy Store
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage medicine stock, prescriptions, and pharmaceutical inventory</p>
        </div>

        <button className="btn btn-primary">
          <Plus size={18} /> Add New Medicine
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {medicines.map((med) => (
          <div key={med.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: med.iconBg, color: med.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={24} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#2F65F6' }}>{med.price}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.2rem' }}>{med.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.75rem' }}>{med.category}</p>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: med.stock.includes('Low') ? '#DC2626' : '#059669', fontWeight: '600' }}>
                {med.stock}
              </span>
              <button className="btn btn-secondary btn-sm">
                <ShoppingBag size={14} /> Order Stock
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyPage;
