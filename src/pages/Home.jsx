import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import ImageGallery from '../components/ImageGallery';
import FacilityCard from '../components/FacilityCard';
import InquiryModal from '../components/InquiryModal';

const Home = () => {
  const [apartment, setApartment] = useState(null);
  const [images, setImages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: aptData } = await supabase
      .from('apartment_details')
      .select('*')
      .limit(1)
      .single();

    const { data: imgData } = await supabase
      .from('apartment_images')
      .select('*')
      .order('display_order');

    const { data: facData } = await supabase
      .from('facilities')
      .select('*')
      .order('display_order');

    setApartment(aptData);
    setImages(imgData || []);
    setFacilities(facData || []);
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div>
      {/* Hero Section with Parallax Effect */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{apartment?.title}</h1>
          <p style={styles.heroSubtitle}>
            <span style={styles.locationIcon}>📍</span> {apartment?.location}
          </p>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <span style={styles.statValue}>{apartment?.bedrooms}</span>
              <span style={styles.statLabel}>Bedrooms</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{apartment?.bathrooms}</span>
              <span style={styles.statLabel}>Bathrooms</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{apartment?.max_guests}</span>
              <span style={styles.statLabel}>Max Guests</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{apartment?.size_sqft}</span>
              <span style={styles.statLabel}>Sq Ft</span>
            </div>
          </div>
          <div style={styles.heroButtons}>
            <button onClick={() => setShowInquiry(true)} style={styles.primaryBtn}>
              Inquire Now
            </button>
            <Link to="/apartment" style={styles.secondaryBtn}>
              View Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Price Banner */}
      <div style={styles.priceBanner}>
        <div style={styles.priceContainer}>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>Starting from</span>
            <span style={styles.priceValue}>${apartment?.price_per_night}</span>
            <span style={styles.pricePeriod}>per night</span>
          </div>
          <div style={styles.priceDivider}>or</div>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>Monthly rate</span>
            <span style={styles.priceValue}>${apartment?.price_per_month}</span>
            <span style={styles.pricePeriod}>per month</span>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Photo Gallery</h2>
          <p style={styles.sectionSubtitle}>Take a visual tour of this stunning property</p>
          <ImageGallery images={images} />
        </div>
      </div>

      {/* Description Section */}
      <div style={{...styles.section, backgroundColor: '#f8f9fa'}}>
        <div style={styles.container}>
          <div style={styles.descriptionGrid}>
            <div>
              <h2 style={styles.sectionTitle}>About This Property</h2>
              <p style={styles.description}>{apartment?.description}</p>
            </div>
            <div style={styles.highlights}>
              <h3>Key Highlights</h3>
              <ul style={styles.highlightsList}>
                <li>✨ Prime location with stunning views</li>
                <li>🏊 Access to premium amenities</li>
                <li>🔒 24/7 security system</li>
                <li>🅿️ Free parking included</li>
                <li>🧹 Weekly cleaning service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Amenities & Facilities</h2>
          <p style={styles.sectionSubtitle}>Everything you need for a perfect stay</p>
          <div style={styles.facilitiesGrid}>
            {facilities.map(facility => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Experience Luxury?</h2>
          <p style={styles.ctaText}>Contact us today to check availability or schedule a viewing</p>
          <button onClick={() => setShowInquiry(true)} style={styles.ctaButton}>
            Request Information
          </button>
        </div>
      </div>

      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  );
};

const styles = {
  hero: {
    height: '85vh',
    backgroundImage: 'url(https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
  },
  heroContent: {
    position: 'relative',
    textAlign: 'center',
    color: 'white',
    maxWidth: '800px',
    padding: '0 20px',
  },
  heroTitle: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    opacity: 0.95,
  },
  locationIcon: {
    marginRight: '0.5rem',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '2rem',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '1rem 2rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  secondaryBtn: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s',
  },
  priceBanner: {
    backgroundColor: 'white',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'relative',
    marginTop: '-30px',
    marginBottom: '2rem',
    zIndex: 10,
  },
  priceContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
  },
  priceBox: {
    textAlign: 'center',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#666',
  },
  priceValue: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#e94560',
  },
  pricePeriod: {
    fontSize: '0.85rem',
    color: '#666',
  },
  priceDivider: {
    fontSize: '1rem',
    color: '#ccc',
  },
  section: {
    padding: '5rem 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#1a1a2e',
  },
  sectionSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '3rem',
  },
  descriptionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'start',
  },
  description: {
    lineHeight: '1.8',
    color: '#444',
    fontSize: '1.05rem',
  },
  highlights: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  highlightsList: {
    listStyle: 'none',
    padding: 0,
  },
  facilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '2rem',
  },
  cta: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '5rem 0',
    textAlign: 'center',
    backgroundImage: 'linear-gradient(135deg, #e94560 0%, #c41e3a 100%)',
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 20px',
  },
  ctaTitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: 'white',
  },
  ctaText: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    color: 'rgba(255,255,255,0.9)',
  },
  ctaButton: {
    padding: '1rem 2.5rem',
    backgroundColor: 'white',
    color: '#e94560',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
  },
};

export default Home;