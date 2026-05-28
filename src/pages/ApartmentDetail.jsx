import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import BookingModal from '../components/BookingModal';

const ApartmentDetail = () => {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchApartment();
  }, [id]);

  const fetchApartment = async () => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching apartment:', error);
    } else {
      setApartment(data);
    }
    setLoading(false);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!apartment) return <div style={styles.loading}>Apartment not found</div>;

  const images = apartment.image_urls || [apartment.image_url];

  return (
    <div style={styles.container}>
      <div style={styles.imageSection}>
        <img 
          src={images[selectedImage] || 'https://via.placeholder.com/800x500'} 
          alt={apartment.title}
          style={styles.mainImage}
        />
        {images.length > 1 && (
          <div style={styles.thumbnailStrip}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`View ${index + 1}`}
                style={{
                  ...styles.thumbnail,
                  border: selectedImage === index ? '3px solid #e94560' : '3px solid transparent'
                }}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div style={styles.content}>
        <div style={styles.info}>
          <h1 style={styles.title}>{apartment.title}</h1>
          <div style={styles.details}>
            <span>🛏️ {apartment.bedrooms} Bedrooms</span>
            <span>🚽 {apartment.bathrooms} Bathrooms</span>
            <span>👥 Sleeps {apartment.max_guests}</span>
          </div>
          <p style={styles.description}>{apartment.description}</p>
          
          <div style={styles.amenities}>
            <h3>Amenities</h3>
            <div style={styles.amenitiesList}>
              {apartment.amenities?.map((amenity, index) => (
                <span key={index} style={styles.amenityTag}>✓ {amenity}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div style={styles.bookingCard}>
          <div style={styles.price}>
            <span style={styles.priceAmount}>${apartment.price_per_night}</span>
            <span>/ night</span>
          </div>
          <button 
            onClick={() => setShowBooking(true)}
            style={styles.bookButton}
          >
            Book Now
          </button>
        </div>
      </div>

      {showBooking && (
        <BookingModal 
          apartment={apartment}
          onClose={() => setShowBooking(false)}
        />
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
  imageSection: {
    marginBottom: '2rem',
  },
  mainImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  thumbnailStrip: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    overflowX: 'auto',
  },
  thumbnail: {
    width: '100px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  info: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#1a1a2e',
    marginBottom: '1rem',
  },
  details: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap',
  },
  description: {
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: '#666',
  },
  amenities: {
    marginTop: '2rem',
  },
  amenitiesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  amenityTag: {
    backgroundColor: '#f0f0f0',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  bookingCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  price: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  priceAmount: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#e94560',
  },
  bookButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
  },
};

export default ApartmentDetail;