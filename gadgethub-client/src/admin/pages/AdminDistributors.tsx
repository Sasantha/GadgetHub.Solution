import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import DataTable from '../components/DataTable';

interface Distributor {
  id: string;
  name: string;
  type: string; // TechWorld, ElectroCom, GadgetCentral
  contactInfo?: string;
  createdAt: string;
}

const AdminDistributors: React.FC = () => {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Distributor>>({
    name: '',
    type: '',
    contactInfo: ''
  });

  useEffect(() => {
    loadDistributors();
  }, []);

  const loadDistributors = async () => {
    try {
      setLoading(true);
      const distributorsData = await AdminService.getAllDistributors();
      setDistributors(distributorsData || []);
    } catch (error) {
      console.error('Failed to load distributors:', error);
      setDistributors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDistributor = async () => {
    if (!selectedDistributor) return;

    try {
      setSaving(true);
      
      // Create complete distributor object with ID
      const updatedDistributor = {
        id: selectedDistributor.id,
        name: formData.name || selectedDistributor.name,
        type: selectedDistributor.type, // Keep original type as it's not editable
        contactInfo: formData.contactInfo || selectedDistributor.contactInfo,
        createdAt: selectedDistributor.createdAt
      };
      
      const success = await AdminService.updateDistributor(selectedDistributor.id, updatedDistributor);
      if (success) {
        setDistributors(distributors.map(d => 
          d.id === selectedDistributor.id ? updatedDistributor : d
        ));
        setSelectedDistributor(null); // Close modal after saving
        setIsEditing(false);
        setFormData({
          name: '',
          type: '',
          contactInfo: ''
        });
        window.alert('Distributor updated successfully!');
      } else {
        window.alert('Failed to update distributor');
      }
    } catch (error) {
      console.error('Error updating distributor:', error);
      window.alert('Failed to update distributor');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setFormData({
      name: distributor.name,
      type: distributor.type,
      contactInfo: distributor.contactInfo || ''
    });
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setSelectedDistributor(null);
    setIsEditing(false);
    setFormData({
      name: '',
      type: '',
      contactInfo: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDistributorTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'techworld': return '🏢';
      case 'electrocom': return '⚡';
      case 'gadgetcentral': return '🔧';
      default: return '🏪';
    }
  };

  const getDistributorStatus = () => {
    // Simulate connection status
    return 'Connected';
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <div className="distributor-type">
          <span className="type-icon">{getDistributorTypeIcon(value)}</span>
          <span className="type-name">{value}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Distributor Name',
      sortable: true
    },
    {
      key: 'contactInfo',
      label: 'Contact Info',
      render: (value: string) => value || 'Not provided'
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="status-badge status-connected">
          {getDistributorStatus()}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      render: (value: string) => formatDate(value)
    }
  ];

  const distributorActions = (distributor: Distributor) => (
    <div className="distributor-actions">
      <button 
        className="btn-edit"
        onClick={() => handleEditDistributor(distributor)}
        disabled={saving}
      >
        Edit Info
      </button>
      <button 
        className="btn-view"
        onClick={() => setSelectedDistributor(distributor)}
        disabled={saving}
      >
        View Details
      </button>
    </div>
  );

  // Mock performance data
  const getDistributorPerformance = (distributor: Distributor) => {
    const mockData = {
      'TechWorld': { orders: 45, avgResponseTime: '2.3 hrs', rating: 4.8 },
      'ElectroCom': { orders: 38, avgResponseTime: '1.8 hrs', rating: 4.6 },
      'GadgetCentral': { orders: 52, avgResponseTime: '3.1 hrs', rating: 4.9 }
    };
    return mockData[distributor.type as keyof typeof mockData] || { orders: 0, avgResponseTime: 'N/A', rating: 0 };
  };

  return (
    <div className="admin-distributors">
      <div className="admin-page-header">
        <h1>Distributors Management</h1>
        <div className="page-actions">
          <button onClick={loadDistributors} className="btn-refresh" disabled={loading}>
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">{distributors.length}</div>
          <div className="stat-label">Total Distributors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{distributors.length}</div>
          <div className="stat-label">Active Connections</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">4.8</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <div className="admin-content">
        <DataTable
          data={distributors}
          columns={columns}
          searchFields={['name', 'type', 'contactInfo']}
          actions={distributorActions}
          loading={loading}
          onRowClick={(distributor) => setSelectedDistributor(distributor)}
        />
      </div>

      {/* Distributor Details/Edit Modal */}
      {selectedDistributor && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content distributor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {isEditing ? 'Edit Distributor' : 'Distributor Details'}
              </h2>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {isEditing ? (
                <form className="distributor-form" onSubmit={(e) => { e.preventDefault(); handleSaveDistributor(); }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Distributor Name</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter distributor name"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Type</label>
                      <input
                        id="type"
                        type="text"
                        value={formData.type || ''}
                        disabled
                        className="readonly-field"
                      />
                      <small>Type cannot be changed</small>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="contactInfo">Contact Information</label>
                      <textarea
                        id="contactInfo"
                        value={formData.contactInfo || ''}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        placeholder="Enter contact information (email, phone, address)"
                        rows={4}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-cancel"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn-save"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Update Distributor'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="distributor-details-grid">
                  {/* Basic Information */}
                  <div className="detail-section">
                    <h3>Basic Information</h3>
                    <div className="detail-row">
                      <span className="label">Distributor ID:</span>
                      <span className="value">{selectedDistributor.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Name:</span>
                      <span className="value">{selectedDistributor.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className="value">
                        {getDistributorTypeIcon(selectedDistributor.type)} {selectedDistributor.type}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span className="value">
                        <span className="status-badge status-connected">Connected</span>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Added:</span>
                      <span className="value">{formatDate(selectedDistributor.createdAt)}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="detail-section">
                    <h3>Contact Information</h3>
                    <div className="contact-info">
                      {selectedDistributor.contactInfo ? (
                        <div className="contact-text">
                          {selectedDistributor.contactInfo}
                        </div>
                      ) : (
                        <div className="no-contact">
                          No contact information provided
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="detail-section performance-section">
                    <h3>Performance Metrics</h3>
                    {(() => {
                      const performance = getDistributorPerformance(selectedDistributor);
                      return (
                        <div className="performance-stats">
                          <div className="performance-item">
                            <span className="performance-label">Total Orders:</span>
                            <span className="performance-value">{performance.orders}</span>
                          </div>
                          <div className="performance-item">
                            <span className="performance-label">Avg Response Time:</span>
                            <span className="performance-value">{performance.avgResponseTime}</span>
                          </div>
                          <div className="performance-item">
                            <span className="performance-label">Rating:</span>
                            <span className="performance-value">
                              ⭐ {performance.rating}/5.0
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="detail-actions">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-edit"
                    >
                      Edit Information
                    </button>
                    <button 
                      onClick={() => window.alert('Test connection feature coming soon')}
                      className="btn-test"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDistributors; 