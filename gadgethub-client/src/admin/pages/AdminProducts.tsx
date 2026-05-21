import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import DataTable from '../components/DataTable';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  createdAt: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    brand: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await AdminService.getAllProducts();
      setProducts(productsData || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    // Basic validation
    if (!formData.name?.trim()) {
      window.alert('Product name is required');
      return;
    }

    try {
      setSaving(true);
      
      if (isCreating) {
        const newProduct = await AdminService.createProduct(formData);
        if (newProduct && typeof newProduct === 'object') {
          // Reload products from server to ensure we have the latest data
          await loadProducts();
        }
      } else if (selectedProduct) {
        console.log('🔄 Sending update for product:', selectedProduct.id);
        console.log('📝 Form data being sent:', formData);
        
        // Create complete product object with ID for backend
        const completeProductData = {
          id: selectedProduct.id,
          ...formData
        };
        console.log('📦 Complete product data:', completeProductData);
        
        const updateSuccess = await AdminService.updateProduct(selectedProduct.id, completeProductData);
        console.log('✅ Update success:', updateSuccess);
        if (updateSuccess) {
          // Reload products from server to ensure we have the latest data
          await loadProducts();
        } else {
          console.error('❌ Update failed - no success response');
        }
      }

      window.alert(isCreating ? 'Product created successfully!' : 'Product updated successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      window.alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const success = await AdminService.deleteProduct(product.id);
      if (success) {
        // Reload products from server to ensure we have the latest data
        await loadProducts();
        window.alert('Product deleted successfully!');
      } else {
        window.alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      window.alert('Error deleting product');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      imageUrl: product.imageUrl || ''
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      imageUrl: ''
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      imageUrl: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filter products by category
  const filteredProducts = products.filter(product => 
    categoryFilter === 'all' || product.category === categoryFilter
  );

  const columns = [
    {
      key: 'imageUrl',
      label: 'Image',
      render: (_: any, row: Product) => (
        <div className="product-image">
          {row.imageUrl ? (
            <img 
              src={row.imageUrl} 
              alt={row.name}
              className="product-thumbnail"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          ) : (
            <div className="no-image">📷</div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="product-name-cell">
          <div className="product-title">{value}</div>
          {row.description && (
            <div className="product-description">{row.description.substring(0, 60)}...</div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: string) => value || 'Uncategorized'
    },
    {
      key: 'brand',
      label: 'Brand',
      sortable: true,
      render: (value: string) => value || 'No brand'
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const productActions = (product: Product) => (
    <div className="product-actions">
      <button 
        className="btn-edit"
        onClick={() => handleEditProduct(product)}
        disabled={saving || deleting}
      >
        Edit
      </button>
      <button 
        className="btn-delete"
        onClick={() => handleDeleteProduct(product)}
        disabled={saving || deleting}
      >
        {deleting ? '⟳' : 'Delete'}
      </button>
    </div>
  );

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <h1>Products Management</h1>
        <div className="page-actions">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button 
            onClick={handleCreateProduct}
            className="btn-create"
            disabled={saving || deleting}
          >
            + Add Product
          </button>
          <button onClick={loadProducts} className="btn-refresh" disabled={loading}>
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      <div className="admin-content">
        <DataTable
          data={filteredProducts}
          columns={columns}
          searchFields={['name', 'description', 'category', 'brand']}
          actions={productActions}
          loading={loading}
        />
      </div>

      {/* Product Form Modal */}
      {(isEditing || isCreating) && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isCreating ? 'Add New Product' : 'Edit Product'}</h2>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form className="product-form" onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand</label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Enter brand name"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                      id="category"
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Enter category"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Enter image URL"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={4}
                      disabled={saving}
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="form-group full-width">
                      <label>Image Preview</label>
                      <div className="image-preview">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-cancel"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-save"
                    disabled={saving || !formData.name?.trim()}
                  >
                    {saving ? 'Saving...' : (isCreating ? 'Create Product' : 'Update Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 