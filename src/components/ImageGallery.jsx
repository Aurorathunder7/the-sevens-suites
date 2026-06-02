import React, { useState } from 'react';

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div style={styles.placeholder}>
        <p>No images available</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.gallery}>
        <div style={styles.mainImageContainer}>
          <img
            src={images[selectedImage]?.image_url}
            alt={images[selectedImage]?.title || 'Apartment view'}
            style={styles.mainImage}
            onClick={() => setLightboxOpen(true)}
          />
        </div>
        <div style={styles.thumbnailStrip}>
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.image_url}
              alt={image.title}
              style={{
                ...styles.thumbnail,
                border: selectedImage === index ? '3px solid #e94560' : '3px solid transparent'
              }}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div style={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button style={styles.closeBtn} onClick={() => setLightboxOpen(false)}>×</button>
          <img src={images[selectedImage]?.image_url} alt="Full size" style={styles.lightboxImage} />
        </div>
      )}
    </>
  );
};

const styles = {
  gallery: {
    marginBottom: '2rem',
  },
  mainImageContainer: {
    width: '100%',
    height: '500px',
    overflow: 'hidden',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  thumbnailStrip: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  thumbnail: {
    width: '100px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  placeholder: {
    height: '400px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
  },
  lightbox: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  lightboxImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '30px',
    fontSize: '40px',
    color: 'white',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
};

export default ImageGallery;