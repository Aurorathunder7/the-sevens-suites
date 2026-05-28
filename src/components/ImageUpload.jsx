import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const ImageUpload = ({ apartmentId, onImageUploaded, existingImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${apartmentId}/${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('apartment-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('apartment-images')
          .getPublicUrl(filePath);

        // Update apartment record with new image URL
        const currentImages = [...images, publicUrl];
        const { error: updateError } = await supabase
          .from('apartments')
          .update({ image_urls: currentImages, image_url: currentImages[0] })
          .eq('id', apartmentId);

        if (updateError) throw updateError;

        setImages(currentImages);
        onImageUploaded(currentImages);
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload image');
      }
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    // Extract file path from URL
    const filePath = imageUrl.split('/').slice(-2).join('/');
    
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('apartment-images')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update apartment record
      const updatedImages = images.filter(img => img !== imageUrl);
      const { error: updateError } = await supabase
        .from('apartments')
        .update({ 
          image_urls: updatedImages,
          image_url: updatedImages[0] || null 
        })
        .eq('id', apartmentId);

      if (updateError) throw updateError;

      setImages(updatedImages);
      onImageUploaded(updatedImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.uploadArea}>
        <label style={styles.uploadLabel}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={styles.hiddenInput}
          />
          <div style={styles.uploadButton}>
            {uploading ? 'Uploading...' : '📸 Upload New Images'}
          </div>
        </label>
        {error && <p style={styles.error}>{error}</p>}
      </div>

      <div style={styles.imageGrid}>
        {images.map((image, index) => (
          <div key={index} style={styles.imageCard}>
            <img src={image} alt={`Apartment ${index + 1}`} style={styles.image} />
            <button
              onClick={() => handleDeleteImage(image)}
              style={styles.deleteButton}
              title="Delete image"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '1rem',
  },
  uploadArea: {
    marginBottom: '1rem',
  },
  uploadLabel: {
    display: 'inline-block',
    cursor: 'pointer',
  },
  hiddenInput: {
    display: 'none',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
    transition: 'background-color 0.3s',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  imageCard: {
    position: 'relative',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(255,0,0,0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  error: {
    color: 'red',
    marginTop: '0.5rem',
  },
};

export default ImageUpload;