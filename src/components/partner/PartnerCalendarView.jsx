import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const PartnerCalendarView = ({ onOpenFulfillment }) => {
  const { allBookings = [] } = usePartner('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get start and end of the current month view
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map bookings to their respective dates
  const bookingsByDate = useMemo(() => {
    const map = {};
    allBookings.forEach((b) => {
      // Ignore cancelled or rejected bookings
      if (['cancelled', 'refunded'].includes(String(b.status || '').toLowerCase())) return;

      const dateStr = b.bookingDate ? new Date(b.bookingDate).toDateString() : new Date(b.createdAt).toDateString();
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(b);
    });
    return map;
  }, [allBookings]);

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Empty slots for previous month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  // Selected date details
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const selectedDateStr = selectedDate.toDateString();
  const selectedDateBookings = bookingsByDate[selectedDateStr] || [];

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div className="mui-card" style={{ padding: '26px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
          <CalendarIcon size={20} color="#2563eb" /> Job Schedule & Dispatch Calendar
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
          Interactive calendar dispatch view. Select a date to view assigned jobs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Calendar Main Grid */}
        <div className="mui-card" style={{ padding: '24px', minHeight: '400px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              {monthNames[month]} {year}
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handlePrevMonth} className="btn btn-ghost" style={{ padding: '6px' }}>
                <ChevronLeft size={20} color="#475569" />
              </button>
              <button type="button" onClick={handleNextMonth} className="btn btn-ghost" style={{ padding: '6px' }}>
                <ChevronRight size={20} color="#475569" />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={idx} style={{ padding: '10px' }} />;
              
              const dateString = date.toDateString();
              const isSelected = selectedDateStr === dateString;
              const isToday = new Date().toDateString() === dateString;
              const dayBookings = bookingsByDate[dateString] || [];
              const hasJobs = dayBookings.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : (isToday ? '#f8fafc' : '#ffffff'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: isSelected || isToday ? '900' : '600',
                    color: isSelected ? '#1d4ed8' : (isToday ? '#0f172a' : '#334155')
                  }}>
                    {date.getDate()}
                  </span>
                  
                  {hasJobs && (
                    <div style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      color: '#ffffff', 
                      background: '#10b981', 
                      padding: '2px 6px', 
                      borderRadius: '10px' 
                    }}>
                      {dayBookings.length} {dayBookings.length > 1 ? 'Jobs' : 'Job'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            {selectedDateStr === new Date().toDateString() ? "Today's Schedule" : `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} Schedule`}
          </h4>
          
          {selectedDateBookings.length === 0 ? (
            <div className="mui-card" style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CalendarIcon size={32} color="#cbd5e1" />
              <div>
                <div style={{ fontWeight: '800', color: '#475569' }}>No Jobs Scheduled</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>You have a free day!</div>
              </div>
            </div>
          ) : (
            selectedDateBookings.map((booking) => {
              const serviceTitle = booking.packageName || booking.service?.name || booking.serviceTitle || 'Service Job';
              const isCompleted = booking.status?.toLowerCase() === 'completed';
              
              return (
                <div key={booking._id} className="mui-card" style={{ padding: '18px', borderLeft: isCompleted ? '4px solid #10b981' : '4px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: isCompleted ? '#059669' : '#2563eb' }}>
                      {booking.timeSlot || booking.bookingTimeSlot || '10:00 AM'}
                    </div>
                    {isCompleted && <CheckCircle2 size={16} color="#10b981" />}
                  </div>
                  
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {serviceTitle}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <MapPin size={12} /> {typeof booking.address === 'object' ? (booking.address?.city || 'Delhi NCR') : (booking.address || booking.city)}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => onOpenFulfillment && onOpenFulfillment(booking)}
                    className="btn btn-sm" 
                    style={{ 
                      width: '100%', 
                      background: isCompleted ? '#f0fdf4' : '#eff6ff', 
                      color: isCompleted ? '#16a34a' : '#2563eb',
                      border: 'none',
                      fontWeight: '700'
                    }}
                  >
                    {isCompleted ? 'View Details' : 'Open Job Dashboard'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
};

export default PartnerCalendarView;