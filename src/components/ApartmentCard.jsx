import React from 'react';
import { useNavigate } from 'react-router-dom';

const ApartmentCard = ({ apartment }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      <img 
        src={apartment.image_url || 'https://via.placeholder.com/400x300'} 
        alt={apartment.title}
        style={styles.image}
      />
      <div style={styles.content}>
        <h3 style={styles.title}>{apartment.title}</h3>
        <p style={styles.description}>{apartment.description?.substring(0, 100)}...</p>
        <div style={styles.details}>
          <span>🛏️ {apartment.bedrooms} beds</span>
          <span>🚽 {apartment.bathrooms} baths</span>
          <span>👥 {apartment.max_guests} guests</span>
        </div>
        <div style={styles.priceRow}>
          <span style={styles.price}>${apartment.price_per_night}</span>
          <span style={styles.perNight}>/ night</span>
        </div>
        <button 
          onClick={() => navigate(`/apartment/${apartment.id}`)}
          style={styles.button}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
  },
  content: {
    padding: '1.5rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#1a1a2e',
  },
  description: {
    color: '#666',
    marginBottom: '1rem',
  },
  details: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  priceRow: {
    marginBottom: '1rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#e94560',
  },
  perNight: {
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default ApartmentCard;