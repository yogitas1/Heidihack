import { useState, useRef } from 'react';
import { OrderSectionSummary } from './OrderSectionApproval';

/**
 * OrderConfirmation - Final review modal with digital signature before submission
 *
 * Shows complete order summary and requires digital signature/PIN confirmation
 * before final submission.
 */
export default function OrderConfirmation({
  isOpen,
  onClose,
  onConfirm,
  orderData,
  isSubmitting,
}) {
  const [signature, setSignature] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  if (!isOpen || !orderData) return null;

  // Canvas drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleConfirm = () => {
    if (!hasDrawnSignature && !signature) {
      setSignatureError('Please provide a digital signature or type your name');
      return;
    }

    setSignatureError('');

    // Get signature data
    let signatureData = signature;
    if (hasDrawnSignature && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    onConfirm({ signature: signatureData });
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-medical-100 rounded-lg">
                  <svg className="h-6 w-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Confirm Order Submission</h2>
                  <p className="text-sm text-gray-500">Review and sign to complete</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Order Summary */}
            <div className="space-y-4">
              {/* Patient & Provider */}
              <div className="grid grid-cols-2 gap-4">
                <OrderSectionSummary title="Patient" isApproved>
                  <div><strong>{orderData.patientInfo.patientName}</strong></div>
                  <div>MRN: {orderData.patientInfo.mrn}</div>
                  <div>DOB: {orderData.patientInfo.dateOfBirth || 'N/A'}</div>
                </OrderSectionSummary>

                <OrderSectionSummary title="Provider" isApproved>
                  <div><strong>{orderData.providerInfo.orderingProvider}</strong></div>
                  <div>NPI: {orderData.providerInfo.npi || 'N/A'}</div>
                  <div>{orderData.providerInfo.facility || 'N/A'}</div>
                </OrderSectionSummary>
              </div>

              {/* Order Details */}
              <OrderSectionSummary title="Order Details" isApproved>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{orderData.orderDetails.orderName}</div>
                    <div className="text-gray-500">
                      {orderData.orderDetails.orderType} | Code: {orderData.orderDetails.orderCode || 'N/A'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    orderData.priorityTiming.priority === 'stat' ? 'bg-red-100 text-red-800' :
                    orderData.priorityTiming.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {orderData.priorityTiming.priority.toUpperCase()}
                  </span>
                </div>
                {orderData.orderDetails.specialInstructions && (
                  <div className="mt-2 text-gray-600">
                    <strong>Instructions:</strong> {orderData.orderDetails.specialInstructions}
                  </div>
                )}
              </OrderSectionSummary>

              {/* Clinical Justification */}
              <OrderSectionSummary title="Clinical Justification" isApproved>
                <div><strong>Indication:</strong> {orderData.clinicalJustification.indication}</div>
                <div className="mt-1">
                  <strong>ICD-10:</strong>{' '}
                  {orderData.clinicalJustification.icd10Codes.map(c => c.code).join(', ')}
                </div>
              </OrderSectionSummary>

              {/* Safety Checks */}
              <OrderSectionSummary title="Safety Checks" isApproved>
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Allergies reviewed and safety confirmed</span>
                </div>
                {orderData.safetyChecks.allergies.length > 0 && (
                  <div className="mt-1 text-amber-600">
                    <strong>Known allergies:</strong> {orderData.safetyChecks.allergies.join(', ')}
                  </div>
                )}
              </OrderSectionSummary>

              {/* Timing */}
              <OrderSectionSummary title="Timing" isApproved>
                <div className="flex items-center justify-between">
                  <span>
                    {orderData.priorityTiming.requestedDate
                      ? `Scheduled: ${orderData.priorityTiming.requestedDate}`
                      : 'As soon as possible'}
                  </span>
                  {orderData.collectionInstructions.fasting && (
                    <span className="text-amber-600">Fasting required</span>
                  )}
                </div>
              </OrderSectionSummary>
            </div>

            {/* Digital Signature Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Digital Signature</h4>

              {/* Signature Canvas */}
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Draw your signature:</label>
                <div className="relative border-2 border-gray-300 rounded-lg bg-white">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={100}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasDrawnSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
                      Sign here
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>

              {/* Or type signature */}
              <div className="text-center text-xs text-gray-500 my-2">— or —</div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Type your full name:</label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your name as signature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 text-sm"
                />
              </div>

              {signatureError && (
                <p className="mt-2 text-sm text-red-600">{signatureError}</p>
              )}
            </div>

            {/* Legal Notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Legal Notice:</strong> By signing this order, I certify that I am the ordering provider or am authorized to place orders on behalf of the ordering provider. I attest that this order is medically necessary, appropriate for the patient's condition, and complies with all applicable regulations including HIPAA. This signature constitutes a legally binding electronic signature.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Order ID will be assigned upon submission
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting || (!hasDrawnSignature && !signature)}
                  className={`px-6 py-2 text-sm font-medium rounded-lg ${
                    !isSubmitting && (hasDrawnSignature || signature)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <svg className="inline-block -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Sign & Submit Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
