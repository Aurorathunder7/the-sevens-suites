import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const InquiryModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    guests: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Simple validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      setSubmitting(false);
      return;
    }

    // Prepare data - only include fields that exist in the table
    const inquiryData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      status: 'new'
    };

    // Add optional fields only if they have values
    if (formData.phone.trim()) inquiryData.phone = formData.phone.trim();
    if (formData.message.trim()) inquiryData.message = formData.message.trim();
    if (formData.check_in) inquiryData.check_in = formData.check_in;
    if (formData.check_out) inquiryData.check_out = formData.check_out;
    if (formData.guests) inquiryData.guests = parseInt(formData.guests);

    console.log('Sending inquiry:', inquiryData);

    try {
      const { data, error: insertError } = await supabase
        .from('inquiries')
        .insert([inquiryData])
        .select();

      if (insertError) {
        console.error('Insert error details:', insertError);
        setError(`Error: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      console.log('Success! Response:', data);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.successMessage}>
            <div style={styles.checkmark}>✓</div>
            <h2>Inquiry Sent!</h2>
            <p>Thank you for your interest. We'll get back to you within 24 hours.</p>
            <button onClick={onClose} style={styles.closeButton}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>Inquire About This Property</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your full name"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="your@email.com"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+1234567890"
            />
          </div>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label>Check-in</label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Check-out</label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label>Number of Guests</label>
            <input
              type="number"
              name="guests"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Message / Questions</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Tell us about your requirements..."
            />
          </div>
          
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Sending...' : 'Send Inquiry'}
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '550px',
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '0.25rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '0.25rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '1rem',
  },
  successMessage: {
    textAlign: 'center',
    padding: '2rem',
  },
  checkmark: {
    fontSize: '4rem',
    color: '#4caf50',
    marginBottom: '1rem',
  },
  closeButton: {
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default InquiryModal;