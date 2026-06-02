import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import ImageGallery from '../components/ImageGallery';
import FacilityCard from '../components/FacilityCard';
import InquiryModal from '../components/InquiryModal';

const ApartmentDetail = () => {
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

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!apartment) return <div style={styles.loading}>No data found</div>;

  return (
    <div>
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>{apartment.title}</h1>
          <p style={styles.location}>📍 {apartment.location}</p>
        </div>
      </div>

      <div style={styles.container}>
        <ImageGallery images={images} />

        <div style={styles.content}>
          <div style={styles.mainInfo}>
            <div style={styles.specs}>
              <div style={styles.spec}>
                <span style={styles.specValue}>{apartment.bedrooms}</span>
                <span style={styles.specLabel}>Bedrooms</span>
              </div>
              <div style={styles.spec}>
                <span style={styles.specValue}>{apartment.bathrooms}</span>
                <span style={styles.specLabel}>Bathrooms</span>
              </div>
              <div style={styles.spec}>
                <span style={styles.specValue}>{apartment.max_guests}</span>
                <span style={styles.specLabel}>Max Guests</span>
              </div>
              <div style={styles.spec}>
                <span style={styles.specValue}>{apartment.size_sqft}</span>
                <span style={styles.specLabel}>Sq Ft</span>
              </div>
            </div>

            <div style={styles.description}>
              <h2>About This Property</h2>
              <p>{apartment.description}</p>
            </div>

            <div style={styles.pricing}>
              <h2>Pricing</h2>
              <div style={styles.priceCards}>
                <div style={styles.priceCard}>
                  <span style={styles.priceValue}>${apartment.price_per_night}</span>
                  <span style={styles.priceLabel}>per night</span>
                </div>
                <div style={styles.priceCard}>
                  <span style={styles.priceValue}>${apartment.price_per_month}</span>
                  <span style={styles.priceLabel}>per month</span>
                </div>
              </div>
            </div>

            <div style={styles.facilities}>
              <h2>Amenities</h2>
              <div style={styles.facilitiesGrid}>
                {facilities.map(facility => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.contactCard}>
              <h3>Contact Owner</h3>
              <div style={styles.contactInfo}>
                <p>📧 {apartment.contact_email}</p>
                <p>📞 {apartment.contact_phone}</p>
              </div>
              <button onClick={() => setShowInquiry(true)} style={styles.inquireBtn}>
                Send Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  );
};

const styles = {
  hero: {
    height: '50vh',
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
    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
  },
  heroContent: {
    position: 'relative',
    textAlign: 'center',
    color: 'white',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  location: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 20px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    marginTop: '2rem',
  },
  mainInfo: {
    gridColumn: '1',
  },
  sidebar: {
    gridColumn: '2',
  },
  specs: {
    display: 'flex',
    gap: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  spec: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  specValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#e94560',
  },
  specLabel: {
    fontSize: '0.9rem',
    color: '#666',
  },
  description: {
    marginBottom: '2rem',
    lineHeight: '1.8',
    color: '#444',
  },
  pricing: {
    marginBottom: '2rem',
  },
  priceCards: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  priceCard: {
    flex: 1,
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    textAlign: 'center',
  },
  priceValue: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#e94560',
  },
  priceLabel: {
    fontSize: '0.9rem',
    color: '#666',
  },
  facilities: {
    marginTop: '2rem',
  },
  facilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  contactCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '100px',
  },
  contactInfo: {
    margin: '1rem 0',
    lineHeight: '1.8',
  },
  inquireBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
  },
};

export default ApartmentDetail;