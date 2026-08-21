import React from 'react';
import { BookOpen, Clock, User, ArrowRight } from 'lucide-react';

const BlogsPage = () => {
  const blogs = [
    {
      id: 1,
      title: '10 Essential Tips for Heart Health and Cholesterol Control',
      author: 'Dr. Toni Kover',
      date: 'Aug 20, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop&q=80',
      category: 'Cardiology'
    },
    {
      id: 2,
      title: 'Understanding Posture and Joint Care in Modern Workspaces',
      author: 'Dr. Calvin Carlo',
      date: 'Aug 18, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
      category: 'Orthopedics'
    },
    {
      id: 3,
      title: 'Mindfulness and Stress Reduction Techniques for Daily Well-being',
      author: 'Dr. Alia Reddy',
      date: 'Aug 15, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80',
      category: 'Psychotherapy'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
          Health & Medical Articles
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Latest medical research, wellness guides, and expert advice from top doctors</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {blogs.map((b) => (
          <div key={b.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <img src={b.image} alt={b.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            
            <div style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2F65F6', background: '#EEF2FF', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                {b.category}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', margin: '0.6rem 0' }}>{b.title}</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginTop: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {b.author}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {b.readTime}</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{b.date}</span>
              <button className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                Read Article <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
