import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, []);

  const checkAuth = () => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      window.location.href = '/admin-login';
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        apartments (
          title,
          price_per_night
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateBookingStatus = async (id, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      alert('Error updating booking status');
    } else {
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Booking Management</h1>
        <div style={styles.filterButtons}>
          <button 
            onClick={() => setFilter('all')}
            style={{...styles.filterBtn, ...(filter === 'all' ? styles.activeFilter : {})}}
          >
            All ({bookings.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            style={{...styles.filterBtn, ...(filter === 'pending' ? styles.activeFilter : {})}}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('confirmed')}
            style={{...styles.filterBtn, ...(filter === 'confirmed' ? styles.activeFilter : {})}}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setFilter('cancelled')}
            style={{...styles.filterBtn, ...(filter === 'cancelled' ? styles.activeFilter : {})}}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <p style={styles.noBookings}>No bookings found</p>
      ) : (
        <div style={styles.bookingsGrid}>
          {filteredBookings.map(booking => (
            <div key={booking.id} style={styles.bookingCard}>
              <div style={styles.cardHeader}>
                <h3>{booking.apartments?.title}</h3>
                <span style={{...styles.status, backgroundColor: getStatusColor(booking.status)}}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              
              <div style={styles.cardContent}>
                <div style={styles.guestInfo}>
                  <p><strong>Guest:</strong> {booking.guest_name}</p>
                  <p><strong>Email:</strong> {booking.guest_email}</p>
                  {booking.guest_phone && <p><strong>Phone:</strong> {booking.guest_phone}</p>}
                </div>
                
                <div style={styles.bookingDetails}>
                  <p><strong>Check-in:</strong> {new Date(booking.check_in).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(booking.check_out).toLocaleDateString()}</p>
                  <p><strong>Total Price:</strong> ${booking.total_price}</p>
                  <p><strong>Booked on:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {booking.status === 'pending' && (
                <div style={styles.cardActions}>
                  <button 
                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    style={styles.confirmBtn}
                  >
                    Confirm Booking
                  </button>
                  <button 
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    style={styles.cancelBtn}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    color: '#1a1a2e',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  activeFilter: {
    backgroundColor: '#e94560',
    color: 'white',
  },
  bookingsGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f0f0f0',
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  cardContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  guestInfo: {
    lineHeight: '1.6',
  },
  bookingDetails: {
    lineHeight: '1.6',
  },
  cardActions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f0f0f0',
  },
  confirmBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
  },
  noBookings: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
    padding: '2rem',
  },
};

export default Bookings;