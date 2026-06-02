import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import AdminImageManager from '../components/AdminImageManager';

const AdminDashboard = () => {
  const [apartment, setApartment] = useState(null);
  const [images, setImages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFacility, setUploadingFacility] = useState(false);
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityDesc, setNewFacilityDesc] = useState('');
  const [selectedFacilityImage, setSelectedFacilityImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [inquiryFilter, setInquiryFilter] = useState('all');
  let subscription = null;

  useEffect(() => {
    checkAuth();
    fetchAllData();
    // Set up real-time subscription for inquiries
    setupRealtimeSubscription();
    
    // Cleanup subscription on component unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const checkAuth = () => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      window.location.href = '/admin-login';
    }
  };

  // Fixed real-time subscription setup
  const setupRealtimeSubscription = () => {
    // Create channel first
    const channel = supabase.channel('inquiries_channel');
    
    // Add event listener BEFORE subscribing
    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'inquiries' },
        (payload) => {
          console.log('New inquiry received:', payload);
          showNotification(`📧 New inquiry from ${payload.new.name}!`, 'success');
          fetchAllData(); // Refresh the list
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
    
    subscription = channel;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchAllData = async () => {
    try {
      // Fetch apartment details
      const { data: aptData, error: aptError } = await supabase
        .from('apartment_details')
        .select('*')
        .limit(1)
        .single();

      if (aptError) throw aptError;

      // Fetch images
      const { data: imgData, error: imgError } = await supabase
        .from('apartment_images')
        .select('*')
        .order('display_order');

      if (imgError) throw imgError;

      // Fetch facilities
      const { data: facData, error: facError } = await supabase
        .from('facilities')
        .select('*')
        .order('display_order');

      if (facError) throw facError;

      // Fetch inquiries
      const { data: inqData, error: inqError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (inqError) throw inqError;

      setApartment(aptData);
      setImages(imgData || []);
      setFacilities(facData || []);
      setInquiries(inqData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApartmentUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('apartment_details')
      .update(apartment)
      .eq('id', apartment.id);

    if (error) {
      showNotification('Error updating details: ' + error.message, 'error');
    } else {
      showNotification('Details updated successfully!', 'success');
    }
    setSaving(false);
  };

  const handleInputChange = (e) => {
    setApartment({
      ...apartment,
      [e.target.name]: e.target.value
    });
  };

  const handleAddFacility = async () => {
    if (!newFacilityName.trim()) {
      showNotification('Please enter a facility name', 'error');
      return;
    }

    setUploadingFacility(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedFacilityImage) {
        const fileExt = selectedFacilityImage.name.split('.').pop();
        const fileName = `facilities/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('apartment-images')
          .upload(fileName, selectedFacilityImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('apartment-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert facility into database
      const { error: insertError } = await supabase
        .from('facilities')
        .insert([{ 
          name: newFacilityName,
          description: newFacilityDesc,
          image_url: imageUrl,
          display_order: facilities.length
        }]);

      if (insertError) throw insertError;

      // Reset form
      setNewFacilityName('');
      setNewFacilityDesc('');
      setSelectedFacilityImage(null);
      setShowAddFacilityModal(false);
      
      showNotification('Facility added successfully!', 'success');
      fetchAllData(); // Refresh the list
      
    } catch (error) {
      console.error('Error adding facility:', error);
      showNotification('Error adding facility: ' + error.message, 'error');
    } finally {
      setUploadingFacility(false);
    }
  };

  const deleteFacility = async (id) => {
    if (window.confirm('Delete this facility?')) {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);
      
      if (error) {
        showNotification('Error deleting facility: ' + error.message, 'error');
      } else {
        showNotification('Facility deleted successfully!', 'success');
        fetchAllData();
      }
    }
  };

  const updateInquiryStatus = async (id, status) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      showNotification('Error updating status: ' + error.message, 'error');
    } else {
      showNotification('Status updated successfully!', 'success');
      fetchAllData();
    }
  };

  const deleteInquiry = async (id) => {
    if (window.confirm('Delete this inquiry?')) {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);
      
      if (error) {
        showNotification('Error deleting inquiry: ' + error.message, 'error');
      } else {
        showNotification('Inquiry deleted successfully!', 'success');
        fetchAllData();
      }
    }
  };

  const getFilteredInquiries = () => {
    if (inquiryFilter === 'all') return inquiries;
    return inquiries.filter(i => i.status === inquiryFilter);
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'new': return { backgroundColor: '#ff9800', color: 'white' };
      case 'read': return { backgroundColor: '#2196F3', color: 'white' };
      case 'responded': return { backgroundColor: '#4caf50', color: 'white' };
      default: return { backgroundColor: '#999', color: 'white' };
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336'
        }}>
          {notification.message}
        </div>
      )}

      <h1 style={styles.title}>Admin Dashboard</h1>
      
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('details')}
          style={{...styles.tab, ...(activeTab === 'details' ? styles.activeTab : {})}}
        >
          🏠 Property Details
        </button>
        <button
          onClick={() => setActiveTab('images')}
          style={{...styles.tab, ...(activeTab === 'images' ? styles.activeTab : {})}}
        >
          🖼️ Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          style={{...styles.tab, ...(activeTab === 'facilities' ? styles.activeTab : {})}}
        >
          ✨ Facilities ({facilities.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          style={{...styles.tab, ...(activeTab === 'inquiries' ? styles.activeTab : {})}}
        >
          📧 Inquiries ({inquiries.filter(i => i.status === 'new').length})
        </button>
      </div>

      {/* Property Details Tab */}
      {activeTab === 'details' && apartment && (
        <div style={styles.tabContent}>
          <form onSubmit={handleApartmentUpdate}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label>Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={apartment.title}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={apartment.location}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Price per Night ($)</label>
                <input
                  type="number"
                  name="price_per_night"
                  value={apartment.price_per_night}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Price per Month ($)</label>
                <input
                  type="number"
                  name="price_per_month"
                  value={apartment.price_per_month}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={apartment.bedrooms}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={apartment.bathrooms}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Max Guests</label>
                <input
                  type="number"
                  name="max_guests"
                  value={apartment.max_guests}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Size (sq ft)</label>
                <input
                  type="number"
                  name="size_sqft"
                  value={apartment.size_sqft}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={apartment.contact_email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={apartment.contact_phone}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.fullWidth}>
                <label>Description</label>
                <textarea
                  name="description"
                  rows="6"
                  value={apartment.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                />
              </div>
            </div>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div style={styles.tabContent}>
          <AdminImageManager 
            images={images}
            onImagesUpdate={fetchAllData}
          />
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <div style={styles.tabContent}>
          <button onClick={() => setShowAddFacilityModal(true)} style={styles.addBtn}>
            + Add New Facility
          </button>
          
          <div style={styles.facilitiesList}>
            {facilities.map(facility => (
              <div key={facility.id} style={styles.facilityItem}>
                {facility.image_url ? (
                  <img src={facility.image_url} alt={facility.name} style={styles.facilityImage} />
                ) : (
                  <div style={styles.facilityImagePlaceholder}>🏢</div>
                )}
                <div style={styles.facilityInfo}>
                  <span style={styles.facilityName}>{facility.name}</span>
                  {facility.description && <span style={styles.facilityDesc}>{facility.description}</span>}
                </div>
                <button
                  onClick={() => deleteFacility(facility.id)}
                  style={styles.deleteSmallBtn}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
            {facilities.length === 0 && (
              <p style={styles.noData}>No facilities added yet. Click "Add New Facility" to get started.</p>
            )}
          </div>
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div style={styles.tabContent}>
          <div style={styles.inquiryHeader}>
            <div style={styles.filterGroup}>
              <button
                onClick={() => setInquiryFilter('all')}
                style={{...styles.filterBtn, ...(inquiryFilter === 'all' ? styles.activeFilterBtn : {})}}
              >
                All ({inquiries.length})
              </button>
              <button
                onClick={() => setInquiryFilter('new')}
                style={{...styles.filterBtn, ...(inquiryFilter === 'new' ? styles.activeFilterBtn : {})}}
              >
                🔴 New ({inquiries.filter(i => i.status === 'new').length})
              </button>
              <button
                onClick={() => setInquiryFilter('read')}
                style={{...styles.filterBtn, ...(inquiryFilter === 'read' ? styles.activeFilterBtn : {})}}
              >
                👀 Read ({inquiries.filter(i => i.status === 'read').length})
              </button>
              <button
                onClick={() => setInquiryFilter('responded')}
                style={{...styles.filterBtn, ...(inquiryFilter === 'responded' ? styles.activeFilterBtn : {})}}
              >
                ✅ Responded ({inquiries.filter(i => i.status === 'responded').length})
              </button>
            </div>
          </div>

          <div style={styles.inquiriesList}>
            {getFilteredInquiries().map(inquiry => (
              <div key={inquiry.id} style={styles.inquiryCard}>
                <div style={styles.inquiryHeader}>
                  <div>
                    <strong>{inquiry.name}</strong>
                    <span style={styles.inquiryEmail}> - {inquiry.email}</span>
                    {inquiry.phone && <span style={styles.inquiryPhone}> - 📞 {inquiry.phone}</span>}
                  </div>
                  <div style={styles.inquiryActions}>
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                      style={{...styles.statusSelect, ...getStatusBadgeStyle(inquiry.status)}}
                    >
                      <option value="new">📧 New</option>
                      <option value="read">👀 Mark as Read</option>
                      <option value="responded">✅ Mark as Responded</option>
                    </select>
                    <button
                      onClick={() => deleteInquiry(inquiry.id)}
                      style={styles.deleteInquiryBtn}
                      title="Delete inquiry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {inquiry.check_in && (
                  <div style={styles.inquiryDates}>
                    📅 {new Date(inquiry.check_in).toLocaleDateString()} → {new Date(inquiry.check_out).toLocaleDateString()}
                    {inquiry.guests && ` | 👥 ${inquiry.guests} guests`}
                  </div>
                )}
                
                <p style={styles.inquiryMessage}>{inquiry.message || 'No message provided'}</p>
                
                <div style={styles.inquiryFooter}>
                  <small>Received: {new Date(inquiry.created_at).toLocaleString()}</small>
                  <button
                    onClick={() => window.location.href = `mailto:${inquiry.email}`}
                    style={styles.replyBtn}
                  >
                    📧 Reply via Email
                  </button>
                </div>
              </div>
            ))}
            {getFilteredInquiries().length === 0 && (
              <p style={styles.noData}>No inquiries found</p>
            )}
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAddFacilityModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddFacilityModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Facility</h2>
            
            <div style={styles.formGroup}>
              <label>Facility Name *</label>
              <input
                type="text"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                placeholder="e.g., Swimming Pool, Gym, Spa"
                style={styles.input}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Description (optional)</label>
              <textarea
                value={newFacilityDesc}
                onChange={(e) => setNewFacilityDesc(e.target.value)}
                placeholder="Brief description of this facility"
                style={styles.textarea}
                rows="3"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label>Facility Image</label>
              <div style={styles.imageUploadArea}>
                {selectedFacilityImage ? (
                  <div style={styles.imagePreview}>
                    <img 
                      src={URL.createObjectURL(selectedFacilityImage)} 
                      alt="Preview"
                      style={styles.previewImage}
                    />
                    <button
                      onClick={() => setSelectedFacilityImage(null)}
                      style={styles.removeImageBtn}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label style={styles.uploadImageLabel}>
                    📸 Click to upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFacilityImage(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowAddFacilityModal(false)}
                style={styles.cancelModalBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleAddFacility}
                disabled={uploadingFacility || !newFacilityName.trim()}
                style={styles.submitModalBtn}
              >
                {uploadingFacility ? 'Adding...' : 'Add Facility'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 20px',
    position: 'relative',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    zIndex: 2000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  title: {
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: '2rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  activeTab: {
    borderBottom: '3px solid #e94560',
    color: '#e94560',
  },
  tabContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  formGroup: {
    marginBottom: '0.5rem',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '0.5rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  saveBtn: {
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  addBtn: {
    marginBottom: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  facilitiesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  facilityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  facilityImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  facilityImagePlaceholder: {
    width: '60px',
    height: '60px',
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  facilityInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  facilityName: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  facilityDesc: {
    fontSize: '0.8rem',
    color: '#666',
  },
  deleteSmallBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  inquiryHeader: {
    marginBottom: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  activeFilterBtn: {
    backgroundColor: '#e94560',
    color: 'white',
  },
  inquiriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inquiryCard: {
    padding: '1.25rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    borderLeft: '4px solid #e94560',
  },
  inquiryEmail: {
    color: '#666',
    fontWeight: 'normal',
  },
  inquiryPhone: {
    color: '#666',
    fontWeight: 'normal',
  },
  inquiryActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  inquiryDates: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.75rem',
  },
  inquiryMessage: {
    margin: '0.75rem 0',
    lineHeight: '1.5',
    color: '#333',
  },
  inquiryFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e0e0e0',
    fontSize: '0.8rem',
    color: '#999',
  },
  statusSelect: {
    padding: '0.4rem 0.75rem',
    borderRadius: '20px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  deleteInquiryBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  replyBtn: {
    padding: '0.4rem 0.75rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginBottom: '1.5rem',
    color: '#1a1a2e',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  cancelModalBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  submitModalBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  imageUploadArea: {
    marginTop: '0.5rem',
  },
  uploadImageLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: '#f0f0f0',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  imagePreview: {
    textAlign: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '150px',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  removeImageBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
  },
};

export default AdminDashboard;