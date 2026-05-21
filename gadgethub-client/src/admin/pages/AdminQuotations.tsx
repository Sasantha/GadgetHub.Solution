// Clean Admin Quotations Page - Following Database Schema Exactly
import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

interface QuotationRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'completed';
  requestedAt: string;
  responseCount: number;
}

interface AddResponseForm {
  requestId: string;
  distributorId: string;
  pricePerUnit: string;
  availableQuantity: string;
  estimatedDeliveryDays: string;
}

interface Distributor {
  id: string;
  name: string;
  type: string;
}

const AdminQuotations: React.FC = () => {
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [availableDistributors, setAvailableDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'pending', 'completed'
  const [responseForm, setResponseForm] = useState<AddResponseForm>({
    requestId: '',
    distributorId: '',
    pricePerUnit: '',
    availableQuantity: '',
    estimatedDeliveryDays: ''
  });

  useEffect(() => {
    loadPendingRequests();
    loadDistributors();
  }, []);

  useEffect(() => {
    // Filter requests based on calculated status
    let filtered = requests;
    if (statusFilter !== 'all') {
      filtered = requests.filter(req => getCalculatedStatus(req) === statusFilter);
    }
    setFilteredRequests(filtered);
  }, [requests, statusFilter]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/quotations/admin/pending'));
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Failed to load quotation requests');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await fetch(getApiUrl('/distributors'));
      if (response.ok) {
        const data = await response.json();
        setDistributors(data);
      }
    } catch (err: any) {
      console.error('Failed to load distributors:', err);
    }
  };

  const loadAvailableDistributors = async (requestId: string) => {
    try {
      const response = await fetch(getApiUrl(`/quotations/admin/request/${requestId}/available-distributors`));
      if (response.ok) {
        const data = await response.json();
        setAvailableDistributors(data);
      } else {
        // Fallback to all distributors if endpoint fails
        setAvailableDistributors(distributors);
      }
    } catch (err: any) {
      console.error('Failed to load available distributors:', err);
      // Fallback to all distributors
      setAvailableDistributors(distributors);
    }
  };



  const handleAddResponse = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setResponseForm({
      requestId: request.id,
      distributorId: '',
      pricePerUnit: '',
      availableQuantity: '',
      estimatedDeliveryDays: ''
    });
    setShowAddForm(true);
    // Load available distributors for this request
    loadAvailableDistributors(request.id);
  };

  const submitResponse = async () => {
    if (!selectedRequest) return;

    try {
      const responseData = {
        requestId: responseForm.requestId,
        distributorId: responseForm.distributorId,
        productId: selectedRequest.productId,
        pricePerUnit: parseFloat(responseForm.pricePerUnit),
        availableQuantity: parseInt(responseForm.availableQuantity),
        estimatedDeliveryDays: parseInt(responseForm.estimatedDeliveryDays)
      };

      const response = await fetch(getApiUrl('/quotations/admin/response'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowAddForm(false);
        setSelectedRequest(null);
        loadPendingRequests(); // Refresh the list
        alert(`✅ Distributor response added successfully!\n\nDistributor: ${availableDistributors.find(d => d.id === responseForm.distributorId)?.name}\nPrice: $${responseForm.pricePerUnit}\nQuantity: ${responseForm.availableQuantity}\nDelivery: ${responseForm.estimatedDeliveryDays} days`);
      } else {
        const errorData = await response.text();
        alert(`❌ Failed to add response: ${errorData}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getCalculatedStatus = (request: QuotationRequest) => {
    return request.responseCount >= 3 ? 'completed' : 'pending';
  };

  const getStatusBadgeClass = (request: QuotationRequest) => {
    const status = getCalculatedStatus(request);
    switch (status) {
      case 'pending': return 'status-badge pending';
      case 'completed': return 'status-badge completed';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="admin-quotations-loading">
        <div className="loading-spinner"></div>
        <p>Loading quotation requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-quotations">
      <div className="admin-quotations-header">
        <h1>📋 Quotation Management</h1>
        <p>Manage customer quotation requests and add distributor responses</p>
        <div className="header-actions">
          <div className="filter-section">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select 
              id="statusFilter"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={loadPendingRequests}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="quotations-table">
        <h2>🔍 Quotation Requests ({filteredRequests.length})</h2>
        {filteredRequests.length === 0 ? (
          <p>No quotation requests found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Response Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div>
                      <strong>{request.customerName}</strong>
                      <br />
                      <small>ID: {request.customerId}</small>
                      <br />
                      <small>{request.customerEmail}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{request.productName}</strong>
                      <br />
                      <small>ID: {request.productId}</small>
                    </div>
                  </td>
                  <td>{request.quantity}</td>
                  <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusBadgeClass(request)}>
                      {getCalculatedStatus(request)}
                    </span>
                  </td>
                  <td>
                    <div className="response-progress">
                      <div className="response-progress-bar">
                        <div 
                          className="response-progress-fill" 
                          style={{ 
                            width: `${Math.min(request.responseCount / 3 * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="response-progress-text">
                        {request.responseCount}/3 responses
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAddResponse(request)}
                      disabled={request.responseCount >= 3}
                    >
                      ➕ Add Response
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Response Form Modal */}
      {showAddForm && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>➕ Add Distributor Response</h3>
            <p><strong>Request:</strong> {selectedRequest.productName} (Qty: {selectedRequest.quantity})</p>
            <p><strong>Customer:</strong> {selectedRequest.customerName}</p>

            <div className="form-group">
              <label>Distributor:</label>
              <select 
                value={responseForm.distributorId}
                onChange={(e) => setResponseForm({...responseForm, distributorId: e.target.value})}
              >
                <option value="">Select Distributor</option>
                {availableDistributors.map(dist => (
                  <option key={dist.id} value={dist.id}>{dist.name} ({dist.type})</option>
                ))}
              </select>
              {availableDistributors.length === 0 && (
                <small className="text-muted">All distributors have already responded to this request.</small>
              )}
            </div>

            <div className="form-group">
              <label>Price per Unit ($):</label>
              <input 
                type="number" 
                step="0.01"
                value={responseForm.pricePerUnit}
                onChange={(e) => setResponseForm({...responseForm, pricePerUnit: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Available Quantity:</label>
              <input 
                type="number"
                value={responseForm.availableQuantity}
                onChange={(e) => setResponseForm({...responseForm, availableQuantity: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Estimated Delivery (Days):</label>
              <input 
                type="number"
                value={responseForm.estimatedDeliveryDays}
                onChange={(e) => setResponseForm({...responseForm, estimatedDeliveryDays: e.target.value})}
                placeholder="7"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={submitResponse}>
                ✅ Add Response
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotations; 
