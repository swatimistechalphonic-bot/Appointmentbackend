import React, { useState, useEffect } from 'react';
import { appointmentApi, authApi } from '../services/api';
import {
  Clock,
  Calendar as CalendarIcon,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Stethoscope,
  CheckCircle2,
  ShieldAlert,
  PlusCircle,
  UserX,
  Coffee,
  Ban,
  CalendarRange,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SchedulesPage = () => {
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);

  // Tabs: 'schedules', 'calendar', 'leaves', 'holidays', 'slots'
  const [activeTab, setActiveTab] = useState('schedules');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Master Doctor Schedules list
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      doctorName: 'Dr. Rahul Sharma',
      specialization: 'General Physician',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 18,
      status: 'Active'
    },
    {
      id: '2',
      doctorName: 'Dr. Calvin Carlo',
      specialization: 'Orthopedic Specialist',
      workingDays: 'Mon - Fri',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 16,
      status: 'Active'
    },
    {
      id: '3',
      doctorName: 'Dr. Cristino Murphy',
      specialization: 'Gynecology & Obstetrics',
      workingDays: 'Mon - Sat',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      slotDuration: '20 Mins',
      totalSlots: 18,
      status: 'Active'
    },
    {
      id: '4',
      doctorName: 'Dr. Alia Reddy',
      specialization: 'Psychotherapy & Mental Health',
      workingDays: 'Tue - Sat',
      startTime: '11:00 AM',
      endTime: '06:00 PM',
      slotDuration: '45 Mins',
      totalSlots: 9,
      status: 'On Leave'
    },
    {
      id: '5',
      doctorName: 'Dr. Toni Kover',
      specialization: 'Cardiology Specialist',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '03:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 12,
      status: 'Active'
    },
    {
      id: '6',
      doctorName: 'Dr. Jessica Taylor',
      specialization: 'Neurology & Brain Care',
      workingDays: 'Mon - Fri',
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 14,
      status: 'Active'
    }
  ]);

  // Master Doctor Leaves list
  const [leaves, setLeaves] = useState([
    {
      id: 'L1',
      doctorName: 'Dr. Alia Reddy',
      startDate: '2026-08-24',
      endDate: '2026-08-27',
      reason: 'Attending Medical Conference',
      status: 'Approved'
    },
    {
      id: 'L2',
      doctorName: 'Dr. Calvin Carlo',
      startDate: '2026-08-30',
      endDate: '2026-08-31',
      reason: 'Personal Leave',
      status: 'Pending'
    }
  ]);

  // Master Holidays list
  const [holidays, setHolidays] = useState([
    {
      id: 'H1',
      name: 'Independence Day',
      date: '2026-08-15',
      type: 'National'
    },
    {
      id: 'H2',
      name: 'Ganesh Chaturthi',
      date: '2026-09-14',
      type: 'Regional'
    },
    {
      id: 'H3',
      name: 'Gandhi Jayanti',
      date: '2026-10-02',
      type: 'National'
    }
  ]);

  // Master Blocked Slots list (Slot Management / Date Overrides)
  const [blockedSlots, setBlockedSlots] = useState([
    {
      id: 'B1',
      doctorName: 'Dr. Rahul Sharma',
      date: '2026-08-25',
      timeSlot: '01:00 PM - 01:30 PM',
      reason: 'Lunch / Break Time'
    },
    {
      id: 'B2',
      doctorName: 'Dr. Cristino Murphy',
      date: '2026-08-28',
      timeSlot: '11:00 AM - 11:20 AM',
      reason: 'Emergency Ward Round'
    }
  ]);

  // Fetch doctors from API and load their schedules
  const fetchDoctorSchedules = async () => {
    setApiLoading(true);
    setApiError('');
    try {
      const doctorsRes = await authApi.getDoctors();
      const doctors = doctorsRes.data?.doctors || doctorsRes.data || [];
      if (doctors.length > 0) {
        setDoctorsList(doctors);
        // Fetch each doctor's schedule and merge
        const schedulePromises = doctors.slice(0, 10).map(d =>
          appointmentApi.getDoctorSchedule(d._id).catch(() => null)
        );
        const scheduleResults = await Promise.all(schedulePromises);
        const apiSchedules = doctors.slice(0, 10).map((d, idx) => {
          const sch = scheduleResults[idx]?.data?.schedule;
          if (!sch) return null;
          return {
            id: d._id,
            doctorName: sch.doctorName || d.name || 'Dr. Specialist',
            specialization: d.specialization || 'General Physician',
            workingDays: Array.isArray(sch.workingDays)
              ? sch.workingDays.slice(0, 2).join(' - ')
              : 'Mon - Sat',
            startTime: sch.shiftStartTime || '09:00 AM',
            endTime: sch.shiftEndTime || '05:00 PM',
            slotDuration: `${sch.slotDurationMinutes || 30} Mins`,
            totalSlots: Math.floor(8 * 60 / (sch.slotDurationMinutes || 30)),
            status: sch.status === 'active' ? 'Active' : 'Inactive'
          };
        }).filter(Boolean);
        if (apiSchedules.length > 0) setSchedules(apiSchedules);
      }
    } catch (err) {
      console.error('Schedule fetch error:', err);
      setApiError('Could not load live schedule data. Showing demo records.');
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorSchedules();
  }, []);

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  
  const [addFormData, setAddFormData] = useState({
    doctorName: '',
    specialization: 'General Physician',
    workingDays: 'Mon - Sat',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    slotDuration: '30 Mins',
    totalSlots: 18,
    status: 'Active'
  });

  const [editFormData, setEditFormData] = useState({});

  // Leave Form
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    doctorName: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Holiday Form
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayFormData, setHolidayFormData] = useState({
    name: '',
    date: '',
    type: 'National'
  });

  // Block Slot Form
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockFormData, setBlockFormData] = useState({
    doctorName: '',
    date: '',
    timeSlot: '',
    reason: 'Break Time'
  });

  // Calendar view states
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 24)); // August 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-08-24');

  // Filtered schedules (for search and status)
  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary Metrics calculations
  const totalDoctors = schedules.length;
  const activeSchedulesCount = schedules.filter(s => s.status === 'Active').length;
  const onLeaveCount = schedules.filter(s => s.status === 'On Leave' || leaves.some(l => l.doctorName === s.doctorName && l.status === 'Approved')).length;
  const totalSlotsToday = schedules
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.totalSlots, 0);

  // Handlers
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.doctorName) return;
    const newEntry = {
      id: Date.now().toString(),
      ...addFormData
    };
    setSchedules([newEntry, ...schedules]);
    setIsAddModalOpen(false);

    // Attempt to persist via API
    try {
      const slotDurMin = parseInt(addFormData.slotDuration) || 30;
      const doctor = doctorsList.find(d =>
        d.name?.toLowerCase().includes(addFormData.doctorName.toLowerCase().replace('Dr. ', ''))
      );
      await appointmentApi.saveDoctorSchedule({
        doctor: doctor?._id || addFormData.doctorName,
        doctorName: addFormData.doctorName,
        workingDays: addFormData.workingDays.split(' - '),
        shiftStartTime: addFormData.startTime,
        shiftEndTime: addFormData.endTime,
        slotDurationMinutes: slotDurMin,
        status: addFormData.status === 'Active' ? 'active' : 'inactive'
      });
    } catch (err) {
      console.error('Save schedule API error:', err);
    }

    setAddFormData({
      doctorName: '',
      specialization: 'General Physician',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 18,
      status: 'Active'
    });
  };

  const handleOpenEditModal = (sch) => {
    setEditSchedule(sch);
    setEditFormData({ ...sch });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSchedules((prev) =>
      prev.map((s) => (s.id === editSchedule.id ? { ...editFormData } : s))
    );
    setEditSchedule(null);

    // Attempt to persist edit via API
    try {
      const slotDurMin = parseInt(editFormData.slotDuration) || 30;
      await appointmentApi.saveDoctorSchedule({
        doctor: editSchedule.id,
        doctorName: editFormData.doctorName,
        workingDays: editFormData.workingDays ? editFormData.workingDays.split(' - ') : ['Monday', 'Saturday'],
        shiftStartTime: editFormData.startTime,
        shiftEndTime: editFormData.endTime,
        slotDurationMinutes: slotDurMin,
        status: editFormData.status === 'Active' ? 'active' : 'inactive'
      });
    } catch (err) {
      console.error('Update schedule API error:', err);
    }
  };

  const handleDeleteSchedule = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete schedule for ${name}?`)) return;
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveFormData.doctorName || !leaveFormData.startDate || !leaveFormData.endDate) return;

    const newLeave = {
      id: 'L' + Date.now(),
      ...leaveFormData,
      status: 'Pending'
    };

    setLeaves([newLeave, ...leaves]);
    
    // Auto toggle schedule status if conflict is immediately visible
    setLeaves(prev => prev.map(l => l.id === newLeave.id ? { ...l, status: 'Approved' } : l));
    setSchedules(prev => prev.map(s => s.doctorName === leaveFormData.doctorName ? { ...s, status: 'On Leave' } : s));

    setIsLeaveModalOpen(false);
    setLeaveFormData({ doctorName: '', startDate: '', endDate: '', reason: '' });
  };

  const handleApproveLeave = (id, docName) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    setSchedules(prev => prev.map(s => s.doctorName === docName ? { ...s, status: 'On Leave' } : s));
  };

  const handleRejectLeave = (id, docName) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    setSchedules(prev => prev.map(s => s.doctorName === docName ? { ...s, status: 'Active' } : s));
  };

  const handleAddHolidaySubmit = (e) => {
    e.preventDefault();
    if (!holidayFormData.name || !holidayFormData.date) return;
    const newHoliday = {
      id: 'H' + Date.now(),
      ...holidayFormData
    };
    setHolidays([...holidays, newHoliday]);
    setIsHolidayModalOpen(false);
    setHolidayFormData({ name: '', date: '', type: 'National' });
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const handleBlockSlotSubmit = (e) => {
    e.preventDefault();
    if (!blockFormData.doctorName || !blockFormData.date || !blockFormData.timeSlot) return;

    // Check if conflict exists
    const conflictExists = blockedSlots.some(
      b => b.doctorName === blockFormData.doctorName &&
           b.date === blockFormData.date &&
           b.timeSlot === blockFormData.timeSlot
    );

    if (conflictExists) {
      alert(`Conflict Alert: This slot is already blocked for ${blockFormData.doctorName} on this date.`);
      return;
    }

    const newBlock = {
      id: 'B' + Date.now(),
      ...blockFormData
    };
    setBlockedSlots([newBlock, ...blockedSlots]);
    setIsBlockModalOpen(false);
    setBlockFormData({ doctorName: '', date: '', timeSlot: '', reason: 'Break Time' });
  };

  const handleUnblockSlot = (id) => {
    setBlockedSlots(prev => prev.filter(b => b.id !== id));
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    const dayElements = [];

    // Empty blank cells before start day of month
    for (let i = 0; i < startDay; i++) {
      dayElements.push(<div key={`blank-${i}`} style={{ height: '70px', border: '1px solid #F1F5F9', background: '#F8FAFC' }}></div>);
    }

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedCalendarDate === dateString;
      const isHoliday = holidays.some(h => h.date === dateString);
      const activeDailySchedules = schedules.filter(s => {
        // Simple day of week mapping
        const dayOfWeek = new Date(year, month, day).getDay(); // 0 = Sun, 1 = Mon, etc.
        const onLeave = leaves.some(l => l.doctorName === s.doctorName && l.status === 'Approved' && dateString >= l.startDate && dateString <= l.endDate);
        if (onLeave) return false;
        
        if (s.workingDays === 'Mon - Sat' && dayOfWeek >= 1 && dayOfWeek <= 6) return true;
        if (s.workingDays === 'Mon - Fri' && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
        if (s.workingDays === 'Tue - Sat' && dayOfWeek >= 2 && dayOfWeek <= 6) return true;
        if (s.workingDays === 'Daily') return true;
        return false;
      });

      dayElements.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedCalendarDate(dateString)}
          style={{
            height: '70px',
            border: '1px solid #F1F5F9',
            padding: '0.35rem',
            position: 'relative',
            cursor: 'pointer',
            backgroundColor: isSelected ? '#EFF6FF' : isHoliday ? '#FEF2F2' : '#FFFFFF',
            borderColor: isSelected ? '#3B82F6' : '#F1F5F9',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '800' : '600', color: isSelected ? '#2563EB' : isHoliday ? '#DC2626' : '#334155' }}>
              {day}
            </span>
            {isHoliday && <span style={{ width: '6px', height: '6px', backgroundColor: '#DC2626', borderRadius: '50%' }} title="Holiday" />}
          </div>
          
          {activeDailySchedules.length > 0 && (
            <div style={{ fontSize: '0.68rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.1rem 0.25rem', borderRadius: '4px', marginTop: '0.35rem', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {activeDailySchedules.length} Doctors
            </div>
          )}
        </div>
      );
    }

    return dayElements;
  };

  // Get schedules for selected calendar date
  const getSchedulesForSelectedDate = () => {
    const dateObj = new Date(selectedCalendarDate);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, etc.
    const isHoliday = holidays.find(h => h.date === selectedCalendarDate);

    if (isHoliday) return { isHoliday: true, holiday: isHoliday, list: [] };

    const list = schedules.map(s => {
      const onLeave = leaves.some(l => l.doctorName === s.doctorName && l.status === 'Approved' && selectedCalendarDate >= l.startDate && selectedCalendarDate <= l.endDate);
      const isWorking = (s.workingDays === 'Mon - Sat' && dayOfWeek >= 1 && dayOfWeek <= 6) ||
                        (s.workingDays === 'Mon - Fri' && dayOfWeek >= 1 && dayOfWeek <= 5) ||
                        (s.workingDays === 'Tue - Sat' && dayOfWeek >= 2 && dayOfWeek <= 6) ||
                        (s.workingDays === 'Daily');

      return {
        ...s,
        onLeave,
        isWorking,
        blocked: blockedSlots.filter(b => b.doctorName === s.doctorName && b.date === selectedCalendarDate)
      };
    });

    return { isHoliday: false, holiday: null, list };
  };

  const calendarDateDetails = getSchedulesForSelectedDate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Doctor Schedules & Shift Timings
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Configure weekly shifts, time slot parameters, leaves, and block off break times</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {activeTab === 'schedules' && (
            <>
              <div className="header-search" style={{ width: '220px' }}>
                <Search size={15} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search Doctor..."
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
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                <Plus size={16} /> Add Schedule
              </button>
            </>
          )}

          {activeTab === 'leaves' && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsLeaveModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Plus size={16} /> Apply Leave
            </button>
          )}

          {activeTab === 'holidays' && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsHolidayModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Plus size={16} /> Add Holiday
            </button>
          )}

          {activeTab === 'slots' && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsBlockModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
              <Ban size={15} style={{ marginRight: '0.3rem' }} /> Block Time Slot
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary Cards (4 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Doctors */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL DOCTORS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalDoctors}</div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ACTIVE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{activeSchedulesCount}</div>
          </div>
        </div>

        {/* Card 3: On Leave */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserX size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>ON LEAVE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{onLeaveCount}</div>
          </div>
        </div>

        {/* Card 4: Today's Slots */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>TODAY'S SLOTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{totalSlotsToday}</div>
          </div>
        </div>

      </div>

      {/* 3. Sub-modules Tabs Selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px', gap: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('schedules')}
          style={{
            padding: '0.6rem 0.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: activeTab === 'schedules' ? '#0066FF' : '#64748B',
            borderBottom: activeTab === 'schedules' ? '3px solid #0066FF' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Weekly Schedules
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '0.6rem 0.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: activeTab === 'calendar' ? '#0066FF' : '#64748B',
            borderBottom: activeTab === 'calendar' ? '3px solid #0066FF' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Calendar View
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          style={{
            padding: '0.6rem 0.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: activeTab === 'leaves' ? '#0066FF' : '#64748B',
            borderBottom: activeTab === 'leaves' ? '3px solid #0066FF' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Leaves Management
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          style={{
            padding: '0.6rem 0.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: activeTab === 'holidays' ? '#0066FF' : '#64748B',
            borderBottom: activeTab === 'holidays' ? '3px solid #0066FF' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Holiday Calendar
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          style={{
            padding: '0.6rem 0.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            color: activeTab === 'slots' ? '#0066FF' : '#64748B',
            borderBottom: activeTab === 'slots' ? '3px solid #0066FF' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Slot Management & Overrides
        </button>
      </div>

      {/* 4. Active Tab Content Rendering */}
      <div>
        
        {/* TAB 1: Weekly Schedules */}
        {activeTab === 'schedules' && (
          filteredSchedules.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', background: '#FFFFFF', borderRadius: '16px' }} className="card">
              <AlertCircle size={32} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
              <div>No doctor schedules match your search.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredSchedules.map((sch) => (
                <div key={sch.id} className="card" style={{ padding: '1.4rem', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EEF2FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{sch.doctorName}</h3>
                          <div style={{ fontSize: '0.8rem', color: '#0066FF', fontWeight: '700' }}>
                            {sch.specialization}
                          </div>
                        </div>
                      </div>

                      <span className={`doc-badge ${sch.status === 'Active' ? 'confirmed' : sch.status === 'On Leave' ? 'pending' : 'cancelled'}`}>
                        {sch.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', marginBottom: '1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon size={14} color="#0066FF" />
                        <span>Working Days: <strong style={{ color: '#0F172A' }}>{sch.workingDays}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="#10B981" />
                        <span>Shift Hours: <strong style={{ color: '#0F172A' }}>{sch.startTime} - {sch.endTime}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Stethoscope size={14} color="#8B5CF6" />
                        <span>Slot Config: <strong style={{ color: '#0F172A' }}>{sch.slotDuration}</strong> ({sch.totalSlots} Slots/day)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>
                      Schedule ID: #{sch.id}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                        title="Edit Schedule"
                        onClick={() => handleOpenEditModal(sch)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                        title="Delete Schedule"
                        onClick={() => handleDeleteSchedule(sch.id, sch.doctorName)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB 2: Calendar View */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left side: Month Grid */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={18} color="#0066FF" />
                  {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateMonth(-1)} style={{ padding: '0.3rem 0.5rem' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateMonth(1)} style={{ padding: '0.3rem 0.5rem' }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', paddingBottom: '0.35rem' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {renderCalendarDays()}
              </div>
            </div>

            {/* Right side: Selected Day Detail list */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Daily Shifts: {new Date(selectedCalendarDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' })}
                </h3>
              </div>

              {calendarDateDetails.isHoliday ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#FEF2F2', borderRadius: '12px', border: '1px dashed #FCA5A5' }}>
                  <Coffee size={32} style={{ color: '#EF4444', marginBottom: '0.5rem' }} />
                  <h4 style={{ color: '#991B1B', margin: '0 0 0.25rem 0', fontWeight: '800' }}>Clinic Holiday: {calendarDateDetails.holiday.name}</h4>
                  <p style={{ color: '#EF4444', fontSize: '0.78rem', margin: 0 }}>All standard consultation shifts are suspended.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {calendarDateDetails.list.map(doc => (
                    <div key={doc.id} style={{ border: '1px solid #F1F5F9', borderRadius: '12px', padding: '0.85rem', background: doc.onLeave ? '#FEF2F2' : !doc.isWorking ? '#F8FAFC' : '#FFFFFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.88rem' }}>{doc.doctorName}</span>
                        {doc.onLeave ? (
                          <span style={{ fontSize: '0.7rem', color: '#DC2626', background: '#FEE2E2', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>On Leave</span>
                        ) : !doc.isWorking ? (
                          <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#E2E8F0', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>Weekly Off</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#166534', background: '#DCFCE7', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>Duty Shift Active</span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>Dept: {doc.specialization}</div>
                        {doc.isWorking && !doc.onLeave && (
                          <>
                            <div>Shift: <strong>{doc.startTime} - {doc.endTime}</strong> ({doc.slotDuration})</div>
                            {doc.blocked.length > 0 && (
                              <div style={{ color: '#D97706', marginTop: '0.3rem', background: '#FFFBEB', padding: '0.3rem', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid #FDE68A' }}>
                                ⚠️ Blocked Slots: {doc.blocked.map(b => b.timeSlot).join(', ')} ({doc.blocked.map(b => b.reason).join(', ')})
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: Leaves Management */}
        {activeTab === 'leaves' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Doctor Absence & Leave Planner</h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem' }}>Doctor Name</th>
                    <th style={{ padding: '0.75rem' }}>Start Date</th>
                    <th style={{ padding: '0.75rem' }}>End Date</th>
                    <th style={{ padding: '0.75rem' }}>Leave Reason</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{l.doctorName}</td>
                      <td style={{ padding: '0.85rem', color: '#475569' }}>{l.startDate}</td>
                      <td style={{ padding: '0.85rem', color: '#475569' }}>{l.endDate}</td>
                      <td style={{ padding: '0.85rem', color: '#64748B' }}>{l.reason}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className={`doc-badge ${l.status === 'Approved' ? 'confirmed' : l.status === 'Pending' ? 'pending' : 'cancelled'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: '#166534', borderColor: '#86EFAC', background: '#DCFCE7' }}
                              onClick={() => handleApproveLeave(l.id, l.doctorName)}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: '#991B1B', borderColor: '#FCA5A5', background: '#FEE2E2' }}
                              onClick={() => handleRejectLeave(l.id, l.doctorName)}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>No actions required</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Holiday Calendar */}
        {activeTab === 'holidays' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left side: Holidays list */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.15rem' }}>Scheduled Clinic Holidays</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {holidays.map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: h.type === 'National' ? '#FEE2E2' : '#EFF6FF', color: h.type === 'National' ? '#DC2626' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Coffee size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{h.name}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>
                          Date: <strong>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> ({h.type} Holiday)
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2', borderRadius: '50%' }}
                      onClick={() => handleDeleteHoliday(h.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Block slot instructions/holiday config card */}
            <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>Important Note: Clinic Holidays</h3>
              <p style={{ color: '#475569', fontSize: '0.84rem', lineHeight: '1.5', margin: 0 }}>
                Holidays configured in this panel apply clinic-wide. They automatically block slot generation on the given calendar dates for all doctors. Patients will not be able to request or book appointments on holidays.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', padding: '0.75rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                <CheckCircle2 size={16} color="#2563EB" />
                <span style={{ fontSize: '0.78rem', color: '#1E40AF', fontWeight: '700' }}>Real-time Sync Active with Patient Booking Portal</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Slot Management & Overrides */}
        {activeTab === 'slots' && (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left side: Blocked slots table */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.15rem' }}>Blocked Slots & Custom Date Overrides</h3>

              {blockedSlots.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No slots currently blocked. Use the button above to block times.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem' }}>Doctor</th>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                        <th style={{ padding: '0.75rem' }}>Time Slot</th>
                        <th style={{ padding: '0.75rem' }}>Reason</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedSlots.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{b.doctorName}</td>
                          <td style={{ padding: '0.85rem', color: '#475569' }}>{b.date}</td>
                          <td style={{ padding: '0.85rem', fontWeight: '700', color: '#EF4444' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Ban size={12} /> {b.timeSlot}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem', color: '#64748B' }}>{b.reason}</td>
                          <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: '#166534', borderColor: '#86EFAC', background: '#DCFCE7' }}
                              onClick={() => handleUnblockSlot(b.id)}
                            >
                              Unblock Slot
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right side: Slot rules */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.85rem' }}>Conflict & Overlap Resolution</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem', background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.35rem 0' }}>Automatic Slot Generation</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                    Schedules generate appointment time slots matching the <strong>Slot Duration</strong> (e.g. 30 Mins) between the shift start and end times automatically.
                  </p>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem', background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.35rem 0' }}>Date & Time Overrides</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                    To override a slot on a specific date (e.g., doctor has a personal emergency on Tuesday afternoon), block that specific slot. It halts patient selection on that spot.
                  </p>
                </div>

                <div style={{ border: '1px dashed #F59E0B', borderRadius: '12px', padding: '0.85rem', background: '#FFFBEB', display: 'flex', gap: '0.65rem' }}>
                  <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '850', color: '#92400E', margin: '0 0 0.2rem 0' }}>Conflict Detection</h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#B45309', lineHeight: '1.3' }}>
                      Blocking a slot checks against existing patient bookings. If conflict exists, the system will highlight the conflict and suggest rescheduling the booked appointments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 5. Modals section */}

      {/* Modal A: Add Weekly Schedule */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Create Doctor Schedule</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dr. Rahul Sharma"
                  value={addFormData.doctorName}
                  onChange={(e) => setAddFormData({ ...addFormData, doctorName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Cardiologist"
                    value={addFormData.specialization}
                    onChange={(e) => setAddFormData({ ...addFormData, specialization: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <select
                    className="input-field"
                    value={addFormData.workingDays}
                    onChange={(e) => setAddFormData({ ...addFormData, workingDays: e.target.value })}
                  >
                    <option value="Mon - Sat">Mon - Sat</option>
                    <option value="Mon - Fri">Mon - Fri</option>
                    <option value="Tue - Sat">Tue - Sat</option>
                    <option value="Daily">Daily (Mon - Sun)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Shift Start Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 09:00 AM"
                    value={addFormData.startTime}
                    onChange={(e) => setAddFormData({ ...addFormData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Shift End Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 06:00 PM"
                    value={addFormData.endTime}
                    onChange={(e) => setAddFormData({ ...addFormData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={addFormData.slotDuration}
                    onChange={(e) => setAddFormData({ ...addFormData, slotDuration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={addFormData.status}
                    onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Edit Weekly Schedule */}
      {editSchedule && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Modify Schedule</h2>
              </div>
              <button onClick={() => setEditSchedule(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.doctorName}
                  onChange={(e) => setEditFormData({ ...editFormData, doctorName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <select
                    className="input-field"
                    value={editFormData.workingDays}
                    onChange={(e) => setEditFormData({ ...editFormData, workingDays: e.target.value })}
                  >
                    <option value="Mon - Sat">Mon - Sat</option>
                    <option value="Mon - Fri">Mon - Fri</option>
                    <option value="Tue - Sat">Tue - Sat</option>
                    <option value="Daily">Daily (Mon - Sun)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Shift Start Time</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Shift End Time</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={editFormData.slotDuration}
                    onChange={(e) => setEditFormData({ ...editFormData, slotDuration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditSchedule(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal C: Apply Leave */}
      {isLeaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CalendarRange size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Apply Doctor Leave</h2>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit}>
              <div className="form-group">
                <label>Select Doctor *</label>
                <select
                  className="input-field"
                  value={leaveFormData.doctorName}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, doctorName: e.target.value })}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.doctorName}>{s.doctorName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="e.g. Attending conference, personal health emergency..."
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal D: Add Holiday */}
      {isHolidayModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Coffee size={22} color="#DC2626" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Clinic Holiday</h2>
              </div>
              <button onClick={() => setIsHolidayModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHolidaySubmit}>
              <div className="form-group">
                <label>Holiday Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Diwali, Christmas Day"
                  value={holidayFormData.name}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Holiday Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={holidayFormData.date}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Holiday Classification</label>
                <select
                  className="input-field"
                  value={holidayFormData.type}
                  onChange={(e) => setHolidayFormData({ ...holidayFormData, type: e.target.value })}
                >
                  <option value="National">National Holiday</option>
                  <option value="Regional">Regional Holiday</option>
                  <option value="Clinic Specific">Clinic Specific Special Off</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal E: Block Slot / Custom Date Override */}
      {isBlockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Ban size={22} color="#DC2626" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Block Appointment Slot</h2>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBlockSlotSubmit}>
              <div className="form-group">
                <label>Select Doctor *</label>
                <select
                  className="input-field"
                  value={blockFormData.doctorName}
                  onChange={(e) => setBlockFormData({ ...blockFormData, doctorName: e.target.value })}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.doctorName}>{s.doctorName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Override Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={blockFormData.date}
                    onChange={(e) => setBlockFormData({ ...blockFormData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Slot Timing (Time Slot) *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 01:00 PM - 01:30 PM"
                    value={blockFormData.timeSlot}
                    onChange={(e) => setBlockFormData({ ...blockFormData, timeSlot: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Blockage *</label>
                <select
                  className="input-field"
                  value={blockFormData.reason}
                  onChange={(e) => setBlockFormData({ ...blockFormData, reason: e.target.value })}
                  required
                >
                  <option value="Break Time">Lunch / Tea Break Time</option>
                  <option value="Ward Round">Ward Rounds / IPD Visit</option>
                  <option value="Meeting">Hospital Administration Meeting</option>
                  <option value="Urgent Surgery">Scheduled OT Surgery</option>
                  <option value="Other">Other / Emergency Leave</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsBlockModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SchedulesPage;
