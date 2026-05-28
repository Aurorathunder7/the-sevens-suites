import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import ApartmentCard from '../components/ApartmentCard';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    guests: ''
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    filterApartments();
  }, [filters, apartments]);

  const fetchApartments = async () => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*');
    
    if (error) {
      console.error('Error fetching apartments:', error);
    } else {
      setApartments(data);
      setFilteredApartments(data);
    }
    setLoading(false);
  };

  const filterApartments = () => {
    let filtered = [...apartments];
    
    if (filters.minPrice) {
      filtered = filtered.filter(a => a.price_per_night >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(a => a.price_per_night <= parseInt(filters.maxPrice));
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(a => a.bedrooms >= parseInt(filters.bedrooms));
    }
    if (filters.guests) {
      filtered = filtered.filter(a => a.max_guests >= parseInt(filters.guests));
    }
    
    setFilteredApartments(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      guests: ''
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterSidebar}>
        <h3>Filter Apartments</h3>
        <div style={styles.filterGroup}>
          <label>Min Price ($)</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            style={styles.input}
            placeholder="Any"
          />
        </div>
        <div style={styles.filterGroup}>
          <label>Max Price ($)</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            style={styles.input}
            placeholder="Any"
          />
        </div>
        <div style={styles.filterGroup}>
          <label>Bedrooms</label>
          <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} style={styles.input}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label>Guests</label>
          <select name="guests" value={filters.guests} onChange={handleFilterChange} style={styles.input}>
            <option value="">Any</option>
            <option value="2">2+</option>
            <option value="4">4+</option>
            <option value="6">6+</option>
          </select>
        </div>
        <button onClick={clearFilters} style={styles.clearBtn}>
          Clear Filters
        </button>
      </div>

      <div style={styles.apartmentsGrid}>
        <h2 style={styles.title}>All Apartments ({filteredApartments.length})</h2>
        {loading ? (
          <p style={styles.loading}>Loading apartments...</p>
        ) : filteredApartments.length === 0 ? (
          <p style={styles.noResults}>No apartments match your filters</p>
        ) : (
          <div style={styles.grid}>
            {filteredApartments.map(apartment => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 20px',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  filterSidebar: {
    width: '280px',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '80px',
  },
  filterGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginTop: '0.25rem',
  },
  clearBtn: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  apartmentsGrid: {
    flex: 1,
  },
  title: {
    marginBottom: '2rem',
    color: '#1a1a2e',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
    padding: '2rem',
  },
};

export default Apartments;