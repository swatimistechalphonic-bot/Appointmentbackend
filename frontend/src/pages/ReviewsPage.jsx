import React, { useState, useEffect } from 'react';
import { reviewApi } from '../services/api';
import {
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  UserCheck,
  User,
  ThumbsUp
} from 'lucide-react';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);

  // Add Form
  const [addFormData, setAddFormData] = useState({
    doctorName: 'Dr. Rahul Sharma',
    rating: 5,
    comment: '',
    status: 'Approved'
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    doctorName: '',
    rating: 5,
    comment: '',
    status: 'Approved'
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [searchTerm, ratingFilter, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (ratingFilter !== 'All') params.rating = Number(ratingFilter);
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await reviewApi.getAllReviews(params);
      if (res.data?.success && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Fetch Reviews Error:', err);
      setError('Failed to load doctor reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addFormData.comment) {
      setAddError('Review comment is required');
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await reviewApi.createReview({
        ...addFormData,
        rating: Number(addFormData.rating)
      });

      if (res.data?.success) {
        setIsAddModalOpen(false);
        setAddFormData({
          doctorName: 'Dr. Rahul Sharma',
          rating: 5,
          comment: '',
          status: 'Approved'
        });
        fetchReviews();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleOpenEditModal = (rev) => {
    setEditReview(rev);
    setEditFormData({
      doctorName: rev.doctorName || '',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      status: rev.status || 'Approved'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.comment) {
      setEditError('Review comment is required');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await reviewApi.updateReview(editReview._id, {
        ...editFormData,
        rating: Number(editFormData.rating)
      });

      if (res.data?.success) {
        setEditReview(null);
        fetchReviews();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async (rev) => {
    if (!window.confirm(`Are you sure you want to delete review by "${rev.userName}"?`)) return;

    try {
      const res = await reviewApi.deleteReview(rev._id);
      if (res.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== rev._id));
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  // Calculate Rating Metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const renderStars = (ratingCount) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        size={16}
        fill={idx < ratingCount ? '#F59E0B' : '#E2E8F0'}
        color={idx < ratingCount ? '#F59E0B' : '#CBD5E1'}
      />
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Patient Reviews & Doctor Ratings
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Monitor patient feedback, star ratings, and doctor reviews</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Review..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="All">All Stars ⭐</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Review
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Rating Summary Header */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{avgRating}</span>
            <Star size={32} fill="#F59E0B" color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#78350F' }}>Overall Doctor Rating</h3>
            <p style={{ fontSize: '0.84rem', color: '#92400E', margin: 0 }}>Based on {totalReviews} patient feedback reviews</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: '#FFFFFF', padding: '0.65rem 1.15rem', borderRadius: '12px', border: '1px solid #FCD34D', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700', textTransform: 'uppercase' }}>Total Reviews</span>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#B45309' }}>{totalReviews}</div>
          </div>
        </div>
      </div>

      {/* Grid of Review Cards */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading doctor reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No doctor reviews found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card" style={{ padding: '1.4rem', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={rev.userName}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>{rev.userName}</h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                        For Doctor: <span style={{ color: '#0066FF' }}>{rev.doctorName || 'Dr. Specialist'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`doc-badge ${rev.status === 'Approved' ? 'confirmed' : rev.status === 'Pending' ? 'pending' : 'cancelled'}`}>
                    {rev.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                  {renderStars(rev.rating)}
                </div>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.5', fontStyle: 'italic', background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.15rem' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '500' }}>
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.65rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                    title="Edit Review / Status"
                    onClick={() => handleOpenEditModal(rev)}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                    title="Delete Review"
                    onClick={() => handleDeleteReview(rev)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Popup Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Star size={22} color="#F59E0B" fill="#F59E0B" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Doctor Review</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Select Doctor *</label>
                <select
                  className="input-field"
                  value={addFormData.doctorName}
                  onChange={(e) => setAddFormData({ ...addFormData, doctorName: e.target.value })}
                >
                  <option value="Dr. Rahul Sharma">Dr. Rahul Sharma (General Physician)</option>
                  <option value="Dr. Calvin Carlo">Dr. Calvin Carlo (Orthopedic)</option>
                  <option value="Dr. Cristino Murphy">Dr. Cristino Murphy (Gynecology)</option>
                  <option value="Dr. Jessica Taylor">Dr. Jessica Taylor (Neurology)</option>
                  <option value="Dr. Alia Reddy">Dr. Alia Reddy (Psychotherapy)</option>
                  <option value="Dr. Toni Kover">Dr. Toni Kover (Cardiology)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Star Rating (1 - 5) *</label>
                  <select
                    className="input-field"
                    value={addFormData.rating}
                    onChange={(e) => setAddFormData({ ...addFormData, rating: e.target.value })}
                  >
                    <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                    <option value="3">3 Stars ⭐⭐⭐</option>
                    <option value="2">2 Stars ⭐⭐</option>
                    <option value="1">1 Star ⭐</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Review Status</label>
                  <select
                    className="input-field"
                    value={addFormData.status}
                    onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Review Feedback Comment *</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Provide feedback comment on doctor treatment and consultation..."
                  value={addFormData.comment}
                  onChange={(e) => setAddFormData({ ...addFormData, comment: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addSubmitting}>
                  {addSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Popup Modal */}
      {editReview && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Star size={22} color="#F59E0B" fill="#F59E0B" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Doctor Review</h2>
              </div>
              <button onClick={() => setEditReview(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.doctorName}
                  onChange={(e) => setEditFormData({ ...editFormData, doctorName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Star Rating (1 - 5)</label>
                  <select
                    className="input-field"
                    value={editFormData.rating}
                    onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                  >
                    <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                    <option value="3">3 Stars ⭐⭐⭐</option>
                    <option value="2">2 Stars ⭐⭐</option>
                    <option value="1">1 Star ⭐</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Review Status</label>
                  <select
                    className="input-field"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Review Comment *</label>
                <textarea
                  className="input-field"
                  rows="4"
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditReview(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
