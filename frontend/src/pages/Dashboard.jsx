import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import './Dashboard.css';

function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [purchasing, setPurchasing] = useState({});

  const categories = [
    'Traditional',
    'Chocolate',
    'Milk-based',
    'Dry Fruit',
    'Sugar-free',
    'Seasonal',
    'Other',
  ];

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSweets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await apiClient.get('/sweets', { params });
      if (response.data.success) {
        setSweets(response.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch sweets. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchSweets();
  };

  const handlePurchase = async sweetId => {
    try {
      setPurchasing(prev => ({ ...prev, [sweetId]: true }));

      const response = await apiClient.post(`/sweets/${sweetId}/purchase`, {
        quantity: 1,
      });

      if (response.data.success) {
        // Update the sweet in the list
        setSweets(prevSweets =>
          prevSweets.map(sweet =>
            sweet._id === sweetId
              ? { ...sweet, quantity: response.data.data.quantity }
              : sweet
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Purchase failed. Please try again.'
      );
    } finally {
      setPurchasing(prev => ({ ...prev, [sweetId]: false }));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSweets();
    }
  }, [categoryFilter, minPrice, maxPrice]);

  if (!isAuthenticated()) {
    return (
      <div className="dashboard-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please login or register to view sweets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Sweet Shop Dashboard</h1>
        <p>Browse and purchase your favorite sweets</p>
      </div>

      <div className="search-filters">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>

          <div className="filter-group">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="price-input"
              min="0"
              step="0.01"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="price-input"
              min="0"
              step="0.01"
            />

            <button
              type="button"
              onClick={clearFilters}
              className="clear-button"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading sweets...</div>
      ) : (
        <>
          <div className="sweets-count">
            {sweets.length} {sweets.length === 1 ? 'sweet' : 'sweets'} found
          </div>

          {sweets.length === 0 ? (
            <div className="no-sweets">
              <p>No sweets found. Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="sweets-grid">
              {sweets.map(sweet => (
                <div key={sweet._id} className="sweet-card">
                  <div className="sweet-header">
                    <h3 className="sweet-name">{sweet.name}</h3>
                    <span className="sweet-category">{sweet.category}</span>
                  </div>

                  {sweet.description && (
                    <p className="sweet-description">{sweet.description}</p>
                  )}

                  <div className="sweet-details">
                    <div className="sweet-price">${sweet.price.toFixed(2)}</div>
                    <div
                      className={`sweet-quantity ${
                        sweet.quantity === 0 ? 'out-of-stock' : ''
                      }`}
                    >
                      {sweet.quantity === 0
                        ? 'Out of Stock'
                        : `${sweet.quantity} in stock`}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(sweet._id)}
                    disabled={sweet.quantity === 0 || purchasing[sweet._id]}
                    className={`purchase-button ${
                      sweet.quantity === 0 ? 'disabled' : ''
                    }`}
                  >
                    {purchasing[sweet._id]
                      ? 'Purchasing...'
                      : sweet.quantity === 0
                      ? 'Out of Stock'
                      : 'Purchase'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;

