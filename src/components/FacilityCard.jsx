import React from 'react';

const FacilityCard = ({ facility }) => {
  return (
    <div style={styles.card}>
      {facility.image_url ? (
        <img src={facility.image_url} alt={facility.name} style={styles.icon} />
      ) : (
        <div style={styles.iconPlaceholder}>✓</div>
      )}
      <h3 style={styles.name}>{facility.name}</h3>
      {facility.description && <p style={styles.description}>{facility.description}</p>}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  icon: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  iconPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    margin: '0 auto 1rem auto',
  },
  name: {
    color: '#1a1a2e',
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
  },
  description: {
    color: '#666',
    fontSize: '0.9rem',
  },
};

export default FacilityCard;