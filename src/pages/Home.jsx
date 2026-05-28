import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import ApartmentCard from '../components/ApartmentCard';

const Home = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error fetching apartments:', error);
    } else {
      setApartments(data);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Experience Luxury Living</h1>
          <p style={styles.heroSubtitle}>Book premium apartments in the heart of the city</p>
          <a href="/apartments" style={styles.heroButton}>View Apartments</a>
        </div>
      </div>

      {/* Featured Apartments */}
      <div style={styles.featured}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Featured Apartments</h2>
          {loading ? (
            <p style={styles.loading}>Loading amazing apartments...</p>
          ) : (
            <div style={styles.grid}>
              {apartments.map(apartment => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🏆</div>
              <h3>Prime Locations</h3>
              <p>All apartments in the best neighborhoods</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>💰</div>
              <h3>Best Price Guarantee</h3>
              <p>We match any lower price</p>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🛡️</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  hero: {
    height: '80vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  heroContent: {
    color: 'white',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'fadeInUp 0.8s ease',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    animation: 'fadeInUp 1s ease',
  },
  heroButton: {
    padding: '1rem 2rem',
    backgroundColor: '#e94560',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    display: 'inline-block',
    transition: 'transform 0.3s',
  },
  featured: {
    padding: '4rem 0',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#1a1a2e',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  features: {
    padding: '4rem 0',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    textAlign: 'center',
  },
  feature: {
    padding: '2rem',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default Home;