import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import './Dashboard.css';

function Dashboard() {
  const { isAuthenticated, isAdmin } = useAuth();

  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Purchase state
  const [purchaseQuantities, setPurchaseQuantities] = useState({});
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [purchaseErrors, setPurchaseErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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
    fetchSweets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sweets, searchQuery, selectedCategory, minPrice, maxPrice, showInStockOnly]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/sweets');
      if (response.data.success) {
        setSweets(response.data.data);
        setFilteredSweets(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch sweets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sweets];

    // Search by name
    if (searchQuery.trim()) {
      filtered = filtered.filter(sweet =>
        sweet.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(sweet => sweet.category === selectedCategory);
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter(sweet => sweet.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(sweet => sweet.price <= parseFloat(maxPrice));
    }

    // Filter by stock availability
    if (showInStockOnly) {
      filtered = filtered.filter(sweet => sweet.quantity > 0 && sweet.inStock);
    }

    setFilteredSweets(filtered);
  };

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setShowInStockOnly(false);
  };

  const handleQuantityChange = (sweetId, value) => {
    setPurchaseQuantities(prev => ({
      ...prev,
      [sweetId]: value,
    }));
    // Clear error for this sweet
    if (purchaseErrors[sweetId]) {
      setPurchaseErrors(prev => ({
        ...prev,
        [sweetId]: '',
      }));
    }
  };

  const handlePurchase = async sweetId => {
    const quantity = parseInt(purchaseQuantities[sweetId] || 1);

    if (!quantity || quantity <= 0) {
      setPurchaseErrors(prev => ({
        ...prev,
        [sweetId]: 'Please enter a valid quantity',
      }));
      return;
    }

    try {
      setPurchaseLoading(prev => ({ ...prev, [sweetId]: true }));
      setPurchaseErrors(prev => ({ ...prev, [sweetId]: '' }));

      const response = await apiClient.post(`/sweets/${sweetId}/purchase`, {
        quantity,
      });

      if (response.data.success) {
        setSuccessMessage(`Successfully purchased ${quantity} item(s)!`);
        setTimeout(() => setSuccessMessage(''), 3000);

        // Update sweet in local state
        setSweets(prev =>
          prev.map(sweet =>
            sweet._id === sweetId ? response.data.data : sweet
          )
        );

        // Clear quantity input
        setPurchaseQuantities(prev => ({
          ...prev,
          [sweetId]: '',
        }));
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Purchase failed. Please try again.';
      setPurchaseErrors(prev => ({
        ...prev,
        [sweetId]: message,
      }));
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [sweetId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading sweets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchSweets} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Sweet Shop Inventory</h2>
        <button onClick={fetchSweets} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search sweets by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="filter-input"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Max Price</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="filter-input"
              min="0"
            />
          </div>

          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={e => setShowInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        <button onClick={clearFilters} className="clear-filters">
          Clear Filters
        </button>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredSweets.length} of {sweets.length} sweets
      </div>

      {/* Sweets Grid */}
      {filteredSweets.length === 0 ? (
        <div className="no-results">
          <p>No sweets found matching your criteria.</p>
        </div>
      ) : (
        <div className="sweets-grid">
          {filteredSweets.map(sweet => (
            <div key={sweet._id} className="sweet-card">
              <div className="sweet-header">
                <h3>{sweet.name}</h3>
                <span className={`category-badge ${sweet.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {sweet.category}
                </span>
              </div>

              {sweet.description && (
                <p className="sweet-description">{sweet.description}</p>
              )}

              <div className="sweet-details">
                <div className="price">₹{sweet.price.toFixed(2)}</div>
                <div className={`stock ${sweet.quantity === 0 ? 'out-of-stock' : ''}`}>
                  {sweet.quantity === 0 ? (
                    <span className="stock-badge out">Out of Stock</span>
                  ) : sweet.quantity < 10 ? (
                    <span className="stock-badge low">
                      Low Stock ({sweet.quantity})
                    </span>
                  ) : (
                    <span className="stock-badge in">
                      In Stock ({sweet.quantity})
                    </span>
                  )}
                </div>
              </div>

              {isAuthenticated() && (
                <div className="purchase-section">
                  <input
                    type="number"
                    min="1"
                    max={sweet.quantity}
                    value={purchaseQuantities[sweet._id] || ''}
                    onChange={e =>
                      handleQuantityChange(sweet._id, e.target.value)
                    }
                    placeholder="Qty"
                    className="quantity-input"
                    disabled={sweet.quantity === 0}
                  />
                  <button
                    onClick={() => handlePurchase(sweet._id)}
                    disabled={
                      sweet.quantity === 0 || purchaseLoading[sweet._id]
                    }
                    className="purchase-button"
                  >
                    {purchaseLoading[sweet._id] ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              )}

              {purchaseErrors[sweet._id] && (
                <div className="purchase-error">
                  {purchaseErrors[sweet._id]}
                </div>
              )}

              {!isAuthenticated() && (
                <div className="login-prompt">Login to purchase</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
