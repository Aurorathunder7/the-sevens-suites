import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const BookingModal = ({ apartment, onClose }) => {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const calculateTotalPrice = () => {
    if (formData.check_in && formData.check_out) {
      const start = new Date(formData.check_in);
      const end = new Date(formData.check_out);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights * apartment.price_per_night;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const totalPrice = calculateTotalPrice();
    
    const { error } = await supabase
      .from('bookings')
      .insert([{
        apartment_id: apartment.id,
        ...formData,
        total_price: totalPrice,
        status: 'pending'
      }]);
    
    if (error) {
      setMessage('Error creating booking. Please try again.');
      console.error(error);
    } else {
      setMessage('✅ Booking successful! We will contact you shortly.');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>Book {apartment.title}</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Full Name *</label>
            <input
              type="text"
              name="guest_name"
              required
              value={formData.guest_name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="guest_email"
              required
              value={formData.guest_email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="guest_phone"
              value={formData.guest_phone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Check-in Date *</label>
            <input
              type="date"
              name="check_in"
              required
              value={formData.check_in}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Check-out Date *</label>
            <input
              type="date"
              name="check_out"
              required
              value={formData.check_out}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          {formData.check_in && formData.check_out && (
            <div style={styles.priceBreakdown}>
              <p><strong>Total: ${calculateTotalPrice()}</strong></p>
              <small>${apartment.price_per_night} per night</small>
            </div>
          )}
          
          {message && (
            <div style={message.includes('✅') ? styles.success : styles.error}>
              {message}
            </div>
          )}
          
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#666',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '0.25rem',
  },
  priceBreakdown: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '5px',
    margin: '1rem 0',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '5px',
    marginBottom: '1rem',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '5px',
    marginBottom: '1rem',
  },
};

export default BookingModal;