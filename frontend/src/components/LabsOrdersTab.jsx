import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function LabsOrdersTab({ patientId, orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', type: 'all' });

  useEffect(() => {
    // Always fetch from API to get latest orders
    fetchOrders();
  }, [patientId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/patients/${patientId}/orders`);
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(o =>
    o.metadata?.status === 'pending' || o.metadata?.status === 'in_progress'
  );

  const completedOrders = orders.filter(o =>
    o.metadata?.status === 'completed' || o.metadata?.status === 'cancelled'
  );

  const filteredCompleted = completedOrders.filter(o => {
    if (filter.status !== 'all' && o.metadata?.status !== filter.status) return false;
    if (filter.type !== 'all' && o.orderDetails?.orderType !== filter.type) return false;
    return true;
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const OrderCard = ({ order }) => (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-gray-900">{order.orderDetails?.orderName}</div>
          <div className="text-sm text-gray-500">
            <span className="capitalize">{order.orderDetails?.orderType}</span>
            {order.orderDetails?.orderCode && (
              <span className="ml-2 font-mono text-xs">{order.orderDetails.orderCode}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Ordered: {new Date(order.metadata?.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusStyles(order.metadata?.status)}`}>
            {order.metadata?.status}
          </span>
          <div className={`mt-1 text-xs font-medium ${
            order.priorityTiming?.priority === 'stat' ? 'text-red-600' :
            order.priorityTiming?.priority === 'urgent' ? 'text-orange-600' :
            'text-gray-500'
          }`}>
            {order.priorityTiming?.priority?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Clinical Indication */}
      {order.clinicalJustification?.indication && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Indication:</span> {order.clinicalJustification.indication}
        </div>
      )}

      {/* ICD-10 Codes */}
      {order.clinicalJustification?.icd10Codes?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {order.clinicalJustification.icd10Codes.map((code, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
              {code.code}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex space-x-3">
        <button className="text-xs text-medical-600 hover:text-medical-800">View Details</button>
        {order.metadata?.status === 'completed' && (
          <button className="text-xs text-green-600 hover:text-green-800">View Results</button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="h-48 skeleton rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Orders Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
          Pending Orders
          {pendingOrders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </h3>

        {pendingOrders.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">No pending orders</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
          <div className="flex space-x-2">
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="lab">Lab</option>
              <option value="imaging">Imaging</option>
              <option value="referral">Referral</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredCompleted.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">No orders in history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCompleted.map((order) => (
              <div key={order.id} className="card p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    order.metadata?.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`h-4 w-4 ${
                      order.metadata?.status === 'completed' ? 'text-green-600' : 'text-red-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        order.metadata?.status === 'completed' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'
                      } />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{order.orderDetails?.orderName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.metadata?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${getStatusStyles(order.metadata?.status)}`}>
                  {order.metadata?.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
