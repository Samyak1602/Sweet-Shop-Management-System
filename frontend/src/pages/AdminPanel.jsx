import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import './Dashboard.css';

function AdminPanel() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Traditional',
    price: '',
    quantity: '',
    description: '',
    image: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    if (isAuthenticated() && isAdmin()) {
      fetchSweets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/sweets');
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

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (formData.quantity === '' || parseInt(formData.quantity) < 0) {
      errors.quantity = 'Quantity must be 0 or greater';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        description: formData.description.trim(),
        image: formData.image.trim(),
      };

      let response;
      if (editingSweet) {
        response = await apiClient.put(`/sweets/${editingSweet._id}`, payload);
      } else {
        response = await apiClient.post('/sweets', payload);
      }

      if (response.data.success) {
        await fetchSweets();
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Operation failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = sweet => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      description: sweet.description || '',
      image: sweet.image || '',
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async sweetId => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/sweets/${sweetId}`);
      if (response.data.success) {
        await fetchSweets();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Failed to delete sweet. Please try again.'
      );
    }
  };

  const handleRestock = async (sweetId, currentQuantity) => {
    const quantity = prompt(
      `Current quantity: ${currentQuantity}\nEnter quantity to add:`
    );

    if (!quantity || parseInt(quantity) <= 0) {
      return;
    }

    try {
      const response = await apiClient.post(`/sweets/${sweetId}/restock`, {
        quantity: parseInt(quantity),
      });
      if (response.data.success) {
        await fetchSweets();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 'Restock failed. Please try again.'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Traditional',
      price: '',
      quantity: '',
      description: '',
      image: '',
    });
    setFormErrors({});
    setEditingSweet(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (!isAuthenticated() || !isAdmin()) {
    return (
      <div className="dashboard-container">
        <div className="auth-required">
          <h2>Admin Access Required</h2>
          <p>You must be an administrator to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Panel</h1>
        <p>Manage sweets inventory</p>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="add-button"
        >
          {showForm ? 'Cancel' : '+ Add New Sweet'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-container">
          <h2>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="Sweet name"
                />
                {formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={formErrors.category ? 'error' : ''}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <span className="error-text">{formErrors.category}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">
                  Price <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={formErrors.price ? 'error' : ''}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
                {formErrors.price && (
                  <span className="error-text">{formErrors.price}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
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

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Sweet description (optional)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg (optional)"
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submit-button"
              >
                {submitting
                  ? 'Saving...'
                  : editingSweet
                  ? 'Update Sweet'
                  : 'Add Sweet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading sweets...</div>
      ) : (
        <>
          <div className="sweets-count">
            {sweets.length} {sweets.length === 1 ? 'sweet' : 'sweets'} in
            inventory
          </div>

          {sweets.length === 0 ? (
            <div className="no-sweets">
              <p>No sweets in inventory. Add your first sweet!</p>
            </div>
          ) : (
            <div className="sweets-grid">
              {sweets.map(sweet => (
                <div key={sweet._id} className="sweet-card admin-card">
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

                  <div className="admin-actions">
                    <button
                      onClick={() => handleEdit(sweet)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRestock(sweet._id, sweet.quantity)}
                      className="restock-button"
                    >
                      Restock
                    </button>
                    <button
                      onClick={() => handleDelete(sweet._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPanel;

