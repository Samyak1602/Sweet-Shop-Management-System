import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './AdminPanel.css';

function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Traditional',
    price: '',
    quantity: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Restock state
  const [restockSweetId, setRestockSweetId] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockLoading, setRestockLoading] = useState(false);

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
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchSweets();
  }, [isAdmin, navigate]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/sweets');
      if (response.data.success) {
        setSweets(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = message => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Traditional',
      price: '',
      quantity: '',
    });
    setFormErrors({});
    setEditingSweet(null);
    setShowAddForm(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSweet = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await apiClient.post('/sweets', {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      });

      if (response.data.success) {
        showSuccess('Sweet added successfully!');
        fetchSweets();
        resetForm();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add sweet';
      setFormErrors({ submit: message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSweet = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const response = await apiClient.put(`/sweets/${editingSweet._id}`, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      });

      if (response.data.success) {
        showSuccess('Sweet updated successfully!');
        fetchSweets();
        resetForm();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update sweet';
      setFormErrors({ submit: message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSweet = async sweetId => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/sweets/${sweetId}`);
      if (response.data.success) {
        showSuccess('Sweet deleted successfully!');
        fetchSweets();
      }
    } catch (err) {
      setError('Failed to delete sweet');
    }
  };

  const startEdit = sweet => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      description: sweet.description || '',
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
    });
    setShowAddForm(true);
    setFormErrors({});
  };

  const handleRestock = async sweetId => {
    const quantity = parseInt(restockQuantity);

    if (!quantity || quantity <= 0) {
      setFormErrors({ restock: 'Please enter a valid quantity' });
      return;
    }

    try {
      setRestockLoading(true);
      setFormErrors({});
      const response = await apiClient.post(`/sweets/${sweetId}/restock`, {
        quantity,
      });

      if (response.data.success) {
        showSuccess(`Successfully restocked ${quantity} items!`);
        fetchSweets();
        setRestockSweetId(null);
        setRestockQuantity('');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restock';
      setFormErrors({ restock: message });
    } finally {
      setRestockLoading(false);
    }
  };

  if (!isAdmin()) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel - Sweet Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="add-button"
        >
          + Add New Sweet
        </button>
      </div>

      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="form-modal">
          <div className="form-content">
            <div className="form-header">
              <h3>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</h3>
              <button onClick={resetForm} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={editingSweet ? handleEditSweet : handleAddSweet}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="e.g., Gulab Jamun"
                />
                {formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the sweet"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={formErrors.price ? 'error' : ''}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {formErrors.price && (
                    <span className="error-text">{formErrors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className={formErrors.quantity ? 'error' : ''}
                    placeholder="0"
                    min="0"
                  />
                  {formErrors.quantity && (
                    <span className="error-text">{formErrors.quantity}</span>
                  )}
                </div>
              </div>

              {formErrors.submit && (
                <div className="error-banner">{formErrors.submit}</div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="submit-button"
                >
                  {formLoading
                    ? 'Saving...'
                    : editingSweet
                    ? 'Update Sweet'
                    : 'Add Sweet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sweets Table */}
      <div className="sweets-table-container">
        <table className="sweets-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map(sweet => (
              <tr key={sweet._id}>
                <td>
                  <div className="sweet-name-cell">
                    <strong>{sweet.name}</strong>
                    {sweet.description && (
                      <small>{sweet.description}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`category-badge ${sweet.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {sweet.category}
                  </span>
                </td>
                <td className="price-cell">₹{sweet.price.toFixed(2)}</td>
                <td className="quantity-cell">{sweet.quantity}</td>
                <td>
                  {sweet.quantity === 0 ? (
                    <span className="status-badge out">Out of Stock</span>
                  ) : sweet.quantity < 10 ? (
                    <span className="status-badge low">Low Stock</span>
                  ) : (
                    <span className="status-badge in">In Stock</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => startEdit(sweet)}
                      className="action-btn edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        setRestockSweetId(sweet._id);
                        setRestockQuantity('');
                        setFormErrors({});
                      }}
                      className="action-btn restock-btn"
                      title="Restock"
                    >
                      📦
                    </button>
                    <button
                      onClick={() => handleDeleteSweet(sweet._id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>

                  {restockSweetId === sweet._id && (
                    <div className="restock-inline">
                      <input
                        type="number"
                        value={restockQuantity}
                        onChange={e => {
                          setRestockQuantity(e.target.value);
                          setFormErrors({});
                        }}
                        placeholder="Qty"
                        min="1"
                        className="restock-input"
                      />
                      <button
                        onClick={() => handleRestock(sweet._id)}
                        disabled={restockLoading}
                        className="restock-submit"
                      >
                        {restockLoading ? '...' : '✓'}
                      </button>
                      <button
                        onClick={() => {
                          setRestockSweetId(null);
                          setRestockQuantity('');
                          setFormErrors({});
                        }}
                        className="restock-cancel"
                      >
                        ✕
                      </button>
                      {formErrors.restock && (
                        <span className="error-text inline-error">
                          {formErrors.restock}
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sweets.length === 0 && (
          <div className="no-data">
            <p>No sweets available. Add your first sweet to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
