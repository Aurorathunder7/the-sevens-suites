import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const AdminImageManager = ({ images, onImagesUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('interior');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    let uploaded = 0;
    for (const file of files) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 5MB`);
        continue;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `apartment/${Date.now()}-${Math.random()}.${fileExt}`;
      
      console.log('Uploading:', fileName);
      
      const { error: uploadError, data } = await supabase.storage
        .from('apartment-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Error uploading ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('apartment-images')
        .getPublicUrl(fileName);

      console.log('Uploaded to:', publicUrl);

      const { error: insertError } = await supabase
        .from('apartment_images')
        .insert([{
          image_url: publicUrl,
          title: newImageTitle || file.name.split('.')[0],
          category: newImageCategory,
          display_order: images.length + uploaded
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        alert(`Error saving to database: ${insertError.message}`);
      } else {
        uploaded++;
        setUploadProgress((uploaded / files.length) * 100);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    e.target.value = '';
    alert(`Successfully uploaded ${uploaded} images!`);
    onImagesUpdate();
  };

  const handleDeleteImage = async (imageId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = `${folder}/${fileName}`;
    
    console.log('Deleting:', filePath);
    
    const { error: deleteError } = await supabase.storage
      .from('apartment-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      alert(`Error deleting from storage: ${deleteError.message}`);
      return;
    }

    const { error: dbError } = await supabase
      .from('apartment_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('DB delete error:', dbError);
      alert(`Error deleting from database: ${dbError.message}`);
    } else {
      alert('Image deleted successfully!');
      onImagesUpdate();
    }
  };

  const handleReorder = async (imageId, newOrder) => {
    await supabase
      .from('apartment_images')
      .update({ display_order: newOrder })
      .eq('id', imageId);
    onImagesUpdate();
  };

  return (
    <div style={styles.container}>
      <h3>Manage Apartment Images</h3>
      
      <div style={styles.uploadSection}>
        <div style={styles.uploadForm}>
          <input
            type="text"
            placeholder="Image title (e.g., Living Room)"
            value={newImageTitle}
            onChange={(e) => setNewImageTitle(e.target.value)}
            style={styles.input}
          />
          <select
            value={newImageCategory}
            onChange={(e) => setNewImageCategory(e.target.value)}
            style={styles.select}
          >
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="facility">Facility</option>
            <option value="amenity">Amenity</option>
          </select>
          <label style={styles.uploadButton}>
            📸 Choose Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        {uploading && (
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${uploadProgress}%`}}></div>
            <span style={styles.progressText}>{Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>

      <div style={styles.imageGrid}>
        {images.map((image, index) => (
          <div key={image.id} style={styles.imageCard}>
            <img src={image.image_url} alt={image.title} style={styles.image} />
            <div style={styles.imageInfo}>
              <p><strong>{image.title}</strong></p>
              <p style={styles.category}>{image.category}</p>
            </div>
            <div style={styles.imageActions}>
              <button
                onClick={() => handleReorder(image.id, index - 1)}
                disabled={index === 0}
                style={styles.moveBtn}
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(image.id, index + 1)}
                disabled={index === images.length - 1}
                style={styles.moveBtn}
              >
                ↓
              </button>
              <button
                onClick={() => handleDeleteImage(image.id, image.image_url)}
                style={styles.deleteBtn}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '2rem',
  },
  uploadSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '2px dashed #dee2e6',
  },
  uploadForm: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  uploadButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  progressBar: {
    marginTop: '1rem',
    height: '30px',
    backgroundColor: '#e0e0e0',
    borderRadius: '15px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '0.75rem',
  },
  category: {
    fontSize: '0.8rem',
    color: '#666',
    textTransform: 'capitalize',
  },
  imageActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderTop: '1px solid #eee',
  },
  moveBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AdminImageManager;