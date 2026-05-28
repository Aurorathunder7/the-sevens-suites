import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import ImageUpload from '../components/ImageUpload';

const AdminDashboard = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    amenities: []
  });

  useEffect(() => {
    checkAuth();
    fetchApartments();
  }, []);

  const checkAuth = () => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      window.location.href = '/admin-login';
    }
  };

  const fetchApartments = async () => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching apartments:', error);
    } else {
      setApartments(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingApartment) {
      // Update existing apartment
      const { error } = await supabase
        .from('apartments')
        .update(formData)
        .eq('id', editingApartment.id);
      
      if (error) {
        alert('Error updating apartment');
      } else {
        alert('Apartment updated successfully!');
        resetForm();
        fetchApartments();
      }
    } else {
      // Create new apartment
      const { error } = await supabase
        .from('apartments')
        .insert([{
          ...formData,
          price_per_night: parseFloat(formData.price_per_night),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          max_guests: parseInt(formData.max_guests),
          image_urls: [],
          amenities: formData.amenities.split(',').map(a => a.trim())
        }]);
      
      if (error) {
        alert('Error creating apartment');
      } else {
        alert('Apartment created successfully!');
        resetForm();
        fetchApartments();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this apartment? This will also delete all associated images.')) {
      // First, get apartment to delete images from storage
      const { data: apartment } = await supabase
        .from('apartments')
        .select('image_urls')
        .eq('id', id)
        .single();

      // Delete images from storage
      if (apartment?.image_urls) {
        for (const imageUrl of apartment.image_urls) {
          const filePath = imageUrl.split('/').slice(-2).join('/');
          await supabase.storage.from('apartment-images').remove([filePath]);
        }
      }

      // Delete apartment from database
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting apartment');
      } else {
        alert('Apartment deleted successfully!');
        fetchApartments();
      }
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setFormData({
      title: apartment.title,
      description: apartment.description,
      price_per_night: apartment.price_per_night,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      max_guests: apartment.max_guests,
      amenities: apartment.amenities?.join(', ') || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price_per_night: '',
      bedrooms: '',
      bathrooms: '',
      max_guests: '',
      amenities: []
    });
    setEditingApartment(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add New Apartment'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h2>{editingApartment ? 'Edit Apartment' : 'Add New Apartment'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Price per night ($) *</label>
                <input
                  type="number"
                  name="price_per_night"
                  required
                  value={formData.price_per_night}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  required
                  value={formData.bedrooms}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  required
                  value={formData.bathrooms}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Max Guests *</label>
                <input
                  type="number"
                  name="max_guests"
                  required
                  value={formData.max_guests}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Amenities (comma separated)</label>
                <input
                  type="text"
                  name="amenities"
                  placeholder="WiFi, Pool, Gym, Parking"
                  value={formData.amenities}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.fullWidth}>
                <label>Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn}>
              {editingApartment ? 'Update Apartment' : 'Create Apartment'}
            </button>
          </form>
        </div>
      )}

      {editingApartment && (
        <div style={styles.imageSection}>
          <h3>Manage Apartment Images</h3>
          <ImageUpload 
            apartmentId={editingApartment.id}
            existingImages={editingApartment.image_urls || []}
            onImageUploaded={(images) => {
              setEditingApartment({...editingApartment, image_urls: images});
            }}
          />
        </div>
      )}

      <div style={styles.apartmentsList}>
        <h2>Your Apartments ({apartments.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price/Night</th>
                  <th>Bedrooms</th>
                  <th>Bookings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map(apartment => (
                  <tr key={apartment.id}>
                    <td>
                      <img 
                        src={apartment.image_url || 'https://via.placeholder.com/50'} 
                        alt={apartment.title}
                        style={styles.tableImage}
                      />
                    </td>
                    <td>{apartment.title}</td>
                    <td>${apartment.price_per_night}</td>
                    <td>{apartment.bedrooms}</td>
                    <td>{apartment.bookings_count || 0}</td>
                    <td>
                      <button 
                        onClick={() => handleEdit(apartment)} 
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(apartment.id)} 
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  title: {
    color: '#1a1a2e',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  form: {
    marginTop: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '0.25rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '0.25rem',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
  imageSection: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  apartmentsList: {
    marginTop: '2rem',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tableImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '5px',
  },
  editBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AdminDashboard;