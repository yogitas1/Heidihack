import { useState, useEffect } from 'react';
import OrderForm from './OrderForm';

/**
 * RecommendedActions - Displays AI-generated recommendations with "Place Order" buttons
 *
 * Integrates with the clinical analysis response and opens OrderForm pre-filled
 * with recommendation data when "Place Order" is clicked.
 */
export default function RecommendedActions({
  recommendations,
  patientContext,
  providerContext,
  onOrderSubmit,
}) {
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [submittedOrders, setSubmittedOrders] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState(null);

  // Load submitted orders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('submitted_orders');
    if (saved) {
      try {
        setSubmittedOrders(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load submitted orders:', e);
      }
    }
  }, []);

  // Save submitted orders to localStorage
  useEffect(() => {
    if (Object.keys(submittedOrders).length > 0) {
      localStorage.setItem('submitted_orders', JSON.stringify(submittedOrders));
    }
  }, [submittedOrders]);

  if (!recommendations) return null;

  const { immediate = [], urgent = [], routine = [] } = recommendations;

  const hasRecommendations = immediate.length > 0 || urgent.length > 0 || routine.length > 0;

  if (!hasRecommendations) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommended Actions</h3>
        <p className="text-gray-500 text-sm">No recommendations available for this analysis.</p>
      </div>
    );
  }

  const handlePlaceOrder = (action, priority) => {
    setSelectedAction({
      ...action,
      priority,
      type: getCategoryType(action.category),
    });
    setOrderFormOpen(true);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      // Submit to backend
      await onOrderSubmit?.(orderData);

      // Generate a unique key for this order
      const orderKey = `${orderData.orderDetails.orderName}-${orderData.orderDetails.orderType}`;

      // Mark order as submitted
      setSubmittedOrders(prev => ({
        ...prev,
        [orderKey]: {
          submittedAt: new Date().toISOString(),
          orderName: orderData.orderDetails.orderName,
          priority: orderData.priorityTiming.priority,
        }
      }));

      // Show success feedback
      setLastSubmittedOrder(orderData.orderDetails.orderName);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

      setOrderFormOpen(false);
      setSelectedAction(null);
    } catch (error) {
      console.error('Order submission failed:', error);
      // Extract error message from response
      let errorMsg = 'Order submission failed. Please check the form and try again.';
      const detail = error.response?.data?.detail;
      if (detail) {
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          errorMsg = detail.map(e => e.msg || JSON.stringify(e)).join('\n');
        } else if (typeof detail === 'object' && detail.errors) {
          // Custom validation errors
          errorMsg = detail.errors.join('\n');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        }
      }
      alert(errorMsg);
    }
  };

  // Check if an action has been submitted
  const isOrderSubmitted = (action) => {
    const orderKey = `${action.name}-${getCategoryType(action.category)}`;
    return submittedOrders[orderKey];
  };

  // Map category to order type
  const getCategoryType = (category) => {
    const cat = (category || '').toLowerCase();
    const mapping = {
      'lab': 'lab',
      'laboratory': 'lab',
      'imaging': 'imaging',
      'diagnostic': 'imaging',
      'radiology': 'imaging',
      'medication': 'medication',
      'prescription': 'medication',
      'referral': 'referral',
      'follow-up': 'referral',
      'followup': 'referral',
      'procedure': 'procedure',
      'education': 'referral', // Map to valid type
    };
    return mapping[cat] || 'lab';
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Lab':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'Imaging':
      case 'Diagnostic':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'Medication':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'Referral':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Follow-up':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Render action item
  const ActionItem = ({ action, priority, priorityColor }) => {
    const submitted = isOrderSubmitted(action);

    return (
      <div className={`p-4 rounded-lg border-l-4 ${submitted ? 'border-green-500 bg-green-50' : priorityColor + ' bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              submitted ? 'bg-green-100 text-green-600' :
              priority === 'stat' ? 'bg-red-100 text-red-600' :
              priority === 'urgent' ? 'bg-orange-100 text-orange-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {submitted ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                getCategoryIcon(action.category)
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{action.name}</h4>
              {action.category && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                  submitted ? 'bg-green-100 text-green-800' :
                  action.category === 'Lab' ? 'bg-purple-100 text-purple-800' :
                  action.category === 'Imaging' || action.category === 'Diagnostic' ? 'bg-cyan-100 text-cyan-800' :
                  action.category === 'Medication' ? 'bg-green-100 text-green-800' :
                  action.category === 'Referral' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {action.category}
                </span>
              )}
              {action.details && (
                <p className="text-sm text-gray-600 mt-1">{action.details}</p>
              )}
              {submitted && (
                <p className="text-xs text-green-600 mt-1">
                  Submitted {new Date(submitted.submittedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {submitted ? (
            <span className="ml-4 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submitted
            </span>
          ) : (
            <button
              onClick={() => handlePlaceOrder(action, priority)}
              className={`ml-4 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                priority === 'stat' ? 'bg-red-600 text-white hover:bg-red-700' :
                priority === 'urgent' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                'bg-medical-600 text-white hover:bg-medical-700'
              }`}
            >
              Place Order
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Order Submitted Successfully</p>
              <p className="text-sm text-green-100">{lastSubmittedOrder}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-4 text-green-100 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center mb-4">
          <svg className="h-6 w-6 text-medical-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
        </div>

        <div className="space-y-6">
          {/* STAT/Immediate Actions */}
          {immediate.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                  STAT - Immediate
                </span>
                <span className="ml-2 text-xs text-gray-500">Within 1 hour</span>
              </div>
              <div className="space-y-3">
                {immediate.map((action, idx) => (
                  <ActionItem
                    key={`immediate-${idx}`}
                    action={action}
                    priority="stat"
                    priorityColor="border-red-500"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Urgent Actions */}
          {urgent.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 uppercase tracking-wide">
                  Urgent
                </span>
                <span className="ml-2 text-xs text-gray-500">Within 24 hours</span>
              </div>
              <div className="space-y-3">
                {urgent.map((action, idx) => (
                  <ActionItem
                    key={`urgent-${idx}`}
                    action={action}
                    priority="urgent"
                    priorityColor="border-orange-500"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Routine Actions */}
          {routine.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Routine
                </span>
                <span className="ml-2 text-xs text-gray-500">Within 1-7 days</span>
              </div>
              <div className="space-y-3">
                {routine.map((action, idx) => (
                  <ActionItem
                    key={`routine-${idx}`}
                    action={action}
                    priority="routine"
                    priorityColor="border-blue-500"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Total recommendations: {immediate.length + urgent.length + routine.length}
            </span>
            {immediate.length > 0 && (
              <span className="text-red-600 font-medium">
                {immediate.length} STAT action{immediate.length !== 1 ? 's' : ''} required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={orderFormOpen}
        onClose={() => {
          setOrderFormOpen(false);
          setSelectedAction(null);
        }}
        onSubmit={handleOrderSubmit}
        patientContext={patientContext}
        providerContext={providerContext}
        prefilledData={selectedAction}
      />
    </>
  );
}

// Compact version for inline display
export function RecommendedActionsCompact({ recommendations, onPlaceOrder }) {
  if (!recommendations) return null;

  const { immediate = [], urgent = [], routine = [] } = recommendations;
  const allActions = [
    ...immediate.map(a => ({ ...a, priority: 'stat' })),
    ...urgent.map(a => ({ ...a, priority: 'urgent' })),
    ...routine.map(a => ({ ...a, priority: 'routine' })),
  ];

  if (allActions.length === 0) return null;

  return (
    <div className="space-y-2">
      {allActions.slice(0, 5).map((action, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              action.priority === 'stat' ? 'bg-red-500' :
              action.priority === 'urgent' ? 'bg-orange-500' :
              'bg-blue-500'
            }`} />
            <span className="text-sm text-gray-700">{action.name}</span>
          </div>
          <button
            onClick={() => onPlaceOrder?.(action)}
            className="text-xs text-medical-600 hover:text-medical-800 font-medium"
          >
            Order
          </button>
        </div>
      ))}
      {allActions.length > 5 && (
        <p className="text-xs text-gray-500 text-center">
          +{allActions.length - 5} more recommendations
        </p>
      )}
    </div>
  );
}
