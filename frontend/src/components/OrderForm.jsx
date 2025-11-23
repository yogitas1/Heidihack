import { useState, useEffect, useCallback } from 'react';
import OrderSectionApproval from './OrderSectionApproval';
import OrderConfirmation from './OrderConfirmation';
import { searchMedicalCodes, ICD10_CODES } from '../data/medicalCodes';
import { ORDER_PRIORITIES, getTemplateById } from '../data/orderTemplates';

const STORAGE_KEY = 'order_form_draft';

// Initial form state
const initialFormState = {
  // Section 1: Patient Information
  patientInfo: {
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    mrn: '',
    gender: '',
    phone: '',
    address: '',
    insuranceId: '',
  },
  // Section 2: Provider Information
  providerInfo: {
    orderingProvider: '',
    providerId: '',
    npi: '',
    facility: '',
    department: '',
    contactPhone: '',
    contactFax: '',
  },
  // Section 3: Order Details
  orderDetails: {
    orderType: '', // lab, imaging, referral, medication
    orderName: '',
    orderCode: '',
    quantity: 1,
    frequency: 'once',
    duration: '',
    specialInstructions: '',
  },
  // Section 4: Clinical Justification
  clinicalJustification: {
    indication: '',
    icd10Codes: [],
    clinicalHistory: '',
    relevantFindings: '',
  },
  // Section 5: Priority and Timing
  priorityTiming: {
    priority: 'routine',
    requestedDate: '',
    requestedTime: '',
    expirationDate: '',
    recurring: false,
    recurringSchedule: '',
  },
  // Section 6: Collection Instructions
  collectionInstructions: {
    fasting: false,
    fastingHours: '',
    specimen: '',
    collectionSite: '',
    specialHandling: '',
    transportInstructions: '',
  },
  // Section 7: Safety Checks
  safetyChecks: {
    allergies: [],
    allergyNotes: '',
    contraindications: [],
    contraindicationNotes: '',
    pregnancyStatus: '',
    renalFunction: '',
    safetyConfirmed: false,
  },
  // Section 8: Attachments
  attachments: {
    documents: [],
    notes: '',
    priorAuthRequired: false,
    priorAuthNumber: '',
  },
  // Section 9: Authentication
  authentication: {
    authenticationId: '',
    digitalSignature: '',
    signatureTimestamp: '',
    attestation: false,
  },
};

// Section approval state
const initialApprovalState = {
  patientInfo: false,
  providerInfo: false,
  orderDetails: false,
  clinicalJustification: false,
  priorityTiming: false,
  collectionInstructions: false,
  safetyChecks: false,
  attachments: false,
  authentication: false,
};

// Section editing state
const initialEditingState = {
  patientInfo: true,
  providerInfo: true,
  orderDetails: true,
  clinicalJustification: true,
  priorityTiming: true,
  collectionInstructions: true,
  safetyChecks: true,
  attachments: true,
  authentication: true,
};

export default function OrderForm({
  isOpen,
  onClose,
  onSubmit,
  patientContext,
  providerContext,
  prefilledData,
  templateId,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [approvals, setApprovals] = useState(initialApprovalState);
  const [editing, setEditing] = useState(initialEditingState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [icd10Search, setIcd10Search] = useState('');
  const [icd10Results, setIcd10Results] = useState([]);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Prefill from patient context
  useEffect(() => {
    if (patientContext) {
      setFormData(prev => ({
        ...prev,
        patientInfo: {
          ...prev.patientInfo,
          patientId: String(patientContext.id || ''),
          patientName: patientContext.name || '',
          mrn: patientContext.mrn || '',
          gender: patientContext.gender || '',
          dateOfBirth: patientContext.dateOfBirth || '',
        },
        safetyChecks: {
          ...prev.safetyChecks,
          allergies: patientContext.allergies || [],
        },
      }));
    }
  }, [patientContext]);

  // Prefill from provider context
  useEffect(() => {
    if (providerContext) {
      setFormData(prev => ({
        ...prev,
        providerInfo: {
          ...prev.providerInfo,
          orderingProvider: providerContext.name || '',
          providerId: providerContext.id || '',
          npi: providerContext.npi || '',
          facility: providerContext.facility || '',
          department: providerContext.department || '',
        },
      }));
    }
  }, [providerContext]);

  // Prefill from template
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          orderDetails: {
            ...prev.orderDetails,
            orderType: template.type,
            orderName: template.name,
            orderCode: template.orderDetails?.testCode || template.orderDetails?.cptCode || '',
            specialInstructions: template.orderDetails?.instructions || '',
          },
          priorityTiming: {
            ...prev.priorityTiming,
            priority: template.priority || 'routine',
          },
          collectionInstructions: {
            ...prev.collectionInstructions,
            fasting: template.collectionInstructions?.fasting || false,
            specimen: template.orderDetails?.specimen || '',
            specialHandling: template.collectionInstructions?.specialInstructions || '',
          },
          clinicalJustification: {
            ...prev.clinicalJustification,
            icd10Codes: template.clinicalJustification?.icd10Suggestions?.map(code => {
              const found = ICD10_CODES.find(c => c.code === code);
              return found || { code, description: '' };
            }) || [],
          },
        }));
      }
    }
  }, [templateId]);

  // Prefill from recommendation data
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        orderDetails: {
          ...prev.orderDetails,
          orderType: prefilledData.type || prev.orderDetails.orderType,
          orderName: prefilledData.name || prev.orderDetails.orderName,
          specialInstructions: prefilledData.details || prev.orderDetails.specialInstructions,
        },
        clinicalJustification: {
          ...prev.clinicalJustification,
          indication: prefilledData.reason || prev.clinicalJustification.indication,
        },
        priorityTiming: {
          ...prev.priorityTiming,
          priority: prefilledData.priority || prev.priorityTiming.priority,
        },
      }));
    }
  }, [prefilledData]);

  // Auto-save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
    }, 2000);
    return () => clearTimeout(timeout);
  }, [formData]);

  // ICD-10 search
  useEffect(() => {
    if (icd10Search.length >= 2) {
      const results = searchMedicalCodes(icd10Search, 'icd10');
      setIcd10Results(results.slice(0, 10));
    } else {
      setIcd10Results([]);
    }
  }, [icd10Search]);

  // Check if all sections are approved
  const allApproved = Object.values(approvals).every(v => v);

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};

    // Patient info validation
    if (!formData.patientInfo.patientName) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.patientInfo.mrn) {
      newErrors.mrn = 'MRN is required';
    }

    // Provider info validation
    if (!formData.providerInfo.orderingProvider) {
      newErrors.orderingProvider = 'Ordering provider is required';
    }

    // Order details validation
    if (!formData.orderDetails.orderName) {
      newErrors.orderName = 'Order name is required';
    }
    if (!formData.orderDetails.orderType) {
      newErrors.orderType = 'Order type is required';
    }

    // Clinical justification validation
    if (!formData.clinicalJustification.indication) {
      newErrors.indication = 'Clinical indication is required';
    }
    if (formData.clinicalJustification.icd10Codes.length === 0) {
      newErrors.icd10Codes = 'At least one ICD-10 code is required';
    }

    // Safety checks validation
    if (!formData.safetyChecks.safetyConfirmed) {
      newErrors.safetyConfirmed = 'Safety check confirmation is required';
    }

    // Authentication validation
    if (!formData.authentication.authenticationId) {
      newErrors.authenticationId = 'Authentication ID is required';
    }
    if (!formData.authentication.attestation) {
      newErrors.attestation = 'Attestation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Update form field
  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    // Clear approval when editing
    setApprovals(prev => ({ ...prev, [section]: false }));

    // Clear errors for the fields in this section so user can re-approve
    setErrors(prev => {
      const newErrors = { ...prev };
      // Map section to its error fields
      const sectionErrorFields = {
        patientInfo: ['patientName', 'mrn'],
        providerInfo: ['orderingProvider'],
        orderDetails: ['orderName', 'orderType'],
        clinicalJustification: ['indication', 'icd10Codes'],
        safetyChecks: ['safetyConfirmed'],
        authentication: ['authenticationId', 'attestation'],
      };

      const fieldsToRemove = sectionErrorFields[section] || [];
      fieldsToRemove.forEach(errorField => {
        delete newErrors[errorField];
      });

      return newErrors;
    });
  };

  // Update approval
  const updateApproval = (section, approved) => {
    if (approved) {
      // Validate section before approving
      const sectionErrors = validateSection(section);
      if (sectionErrors.length > 0) {
        // Set errors for this section
        const newErrors = {};
        sectionErrors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
        return; // Don't approve if there are errors
      }
    }

    setApprovals(prev => ({ ...prev, [section]: approved }));
    if (approved) {
      setEditing(prev => ({ ...prev, [section]: false }));
    }
  };

  // Validate a specific section
  const validateSection = (section) => {
    const errors = [];

    switch (section) {
      case 'patientInfo':
        if (!formData.patientInfo.patientName?.trim()) {
          errors.push({ field: 'patientName', message: 'Patient name is required' });
        }
        if (!formData.patientInfo.mrn?.trim()) {
          errors.push({ field: 'mrn', message: 'MRN is required' });
        }
        break;
      case 'providerInfo':
        if (!formData.providerInfo.orderingProvider?.trim()) {
          errors.push({ field: 'orderingProvider', message: 'Ordering provider is required' });
        }
        break;
      case 'orderDetails':
        if (!formData.orderDetails.orderName?.trim()) {
          errors.push({ field: 'orderName', message: 'Order name is required' });
        }
        if (!formData.orderDetails.orderType) {
          errors.push({ field: 'orderType', message: 'Order type is required' });
        }
        break;
      case 'clinicalJustification':
        if (!formData.clinicalJustification.indication?.trim()) {
          errors.push({ field: 'indication', message: 'Clinical indication is required' });
        }
        if (formData.clinicalJustification.icd10Codes.length === 0) {
          errors.push({ field: 'icd10Codes', message: 'At least one ICD-10 code is required' });
        }
        break;
      case 'safetyChecks':
        if (!formData.safetyChecks.safetyConfirmed) {
          errors.push({ field: 'safetyConfirmed', message: 'Safety check confirmation is required' });
        }
        break;
      case 'authentication':
        if (!formData.authentication.authenticationId?.trim()) {
          errors.push({ field: 'authenticationId', message: 'Authentication ID is required' });
        }
        if (!formData.authentication.attestation) {
          errors.push({ field: 'attestation', message: 'Attestation is required' });
        }
        break;
      default:
        break;
    }

    return errors;
  };

  // Update editing state
  const updateEditing = (section, isEditing) => {
    setEditing(prev => ({ ...prev, [section]: isEditing }));
    if (isEditing) {
      setApprovals(prev => ({ ...prev, [section]: false }));
    }
  };

  // Add ICD-10 code
  const addIcd10Code = (code) => {
    if (!formData.clinicalJustification.icd10Codes.find(c => c.code === code.code)) {
      updateField('clinicalJustification', 'icd10Codes', [
        ...formData.clinicalJustification.icd10Codes,
        { code: code.code, description: code.description },
      ]);
    }
    setIcd10Search('');
    setIcd10Results([]);
  };

  // Remove ICD-10 code
  const removeIcd10Code = (code) => {
    updateField('clinicalJustification', 'icd10Codes',
      formData.clinicalJustification.icd10Codes.filter(c => c.code !== code)
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    if (!allApproved) {
      alert('Please approve all sections before submitting');
      return;
    }

    setShowConfirmation(true);
  };

  // Sanitize data to ensure no null values for strings
  const sanitizeData = (obj) => {
    if (obj === null || obj === undefined) return '';
    if (typeof obj === 'boolean' || typeof obj === 'number') return obj;
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeData);
    if (typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        result[key] = sanitizeData(obj[key]);
      }
      return result;
    }
    return obj;
  };

  // Final submission after confirmation
  const handleConfirmedSubmit = async (signatureData) => {
    setIsSubmitting(true);

    const orderData = sanitizeData({
      ...formData,
      authentication: {
        ...formData.authentication,
        digitalSignature: signatureData.signature || '',
        signatureTimestamp: new Date().toISOString(),
      },
      metadata: {
        createdAt: new Date().toISOString(),
        status: 'pending',
        version: 1,
      },
    });

    // Debug: log the order data being sent
    console.log('Order data being submitted:', JSON.stringify(orderData, null, 2));

    try {
      await onSubmit?.(orderData);
      localStorage.removeItem(STORAGE_KEY);
      setShowConfirmation(false);
      onClose?.();
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-xl">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Clinical Order Form</h2>
                  <p className="text-sm text-gray-500">
                    Complete all sections and approve each before submission
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Sections Approved: {Object.values(approvals).filter(v => v).length} / 9
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(Object.values(approvals).filter(v => v).length / 9) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="p-6 space-y-6">
            {/* Section 1: Patient Information */}
            <OrderSectionApproval
              title="Patient Information"
              sectionId="section-patient"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              isApproved={approvals.patientInfo}
              onApprovalChange={(v) => updateApproval('patientInfo', v)}
              isEditing={editing.patientInfo}
              onEditToggle={(v) => updateEditing('patientInfo', v)}
              hasErrors={!!(errors.patientName || errors.mrn)}
              errorMessage={errors.patientName || errors.mrn}
              required
            >
              {editing.patientInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={formData.patientInfo.patientName}
                      onChange={(e) => updateField('patientInfo', 'patientName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRN *</label>
                    <input
                      type="text"
                      value={formData.patientInfo.mrn}
                      onChange={(e) => updateField('patientInfo', 'mrn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.patientInfo.dateOfBirth}
                      onChange={(e) => updateField('patientInfo', 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.patientInfo.gender}
                      onChange={(e) => updateField('patientInfo', 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.patientInfo.phone}
                      onChange={(e) => updateField('patientInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ID</label>
                    <input
                      type="text"
                      value={formData.patientInfo.insuranceId}
                      onChange={(e) => updateField('patientInfo', 'insuranceId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Name:</strong> {formData.patientInfo.patientName || 'Not specified'}</div>
                  <div><strong>MRN:</strong> {formData.patientInfo.mrn || 'Not specified'}</div>
                  <div><strong>DOB:</strong> {formData.patientInfo.dateOfBirth || 'Not specified'}</div>
                  <div><strong>Gender:</strong> {formData.patientInfo.gender || 'Not specified'}</div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 2: Provider Information */}
            <OrderSectionApproval
              title="Provider Information"
              sectionId="section-provider"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              isApproved={approvals.providerInfo}
              onApprovalChange={(v) => updateApproval('providerInfo', v)}
              isEditing={editing.providerInfo}
              onEditToggle={(v) => updateEditing('providerInfo', v)}
              hasErrors={!!errors.orderingProvider}
              errorMessage={errors.orderingProvider}
              required
            >
              {editing.providerInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordering Provider *</label>
                    <input
                      type="text"
                      value={formData.providerInfo.orderingProvider}
                      onChange={(e) => updateField('providerInfo', 'orderingProvider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NPI</label>
                    <input
                      type="text"
                      value={formData.providerInfo.npi}
                      onChange={(e) => updateField('providerInfo', 'npi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                    <input
                      type="text"
                      value={formData.providerInfo.facility}
                      onChange={(e) => updateField('providerInfo', 'facility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.providerInfo.department}
                      onChange={(e) => updateField('providerInfo', 'department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.providerInfo.contactPhone}
                      onChange={(e) => updateField('providerInfo', 'contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Fax</label>
                    <input
                      type="tel"
                      value={formData.providerInfo.contactFax}
                      onChange={(e) => updateField('providerInfo', 'contactFax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Provider:</strong> {formData.providerInfo.orderingProvider || 'Not specified'}</div>
                  <div><strong>NPI:</strong> {formData.providerInfo.npi || 'Not specified'}</div>
                  <div><strong>Facility:</strong> {formData.providerInfo.facility || 'Not specified'}</div>
                  <div><strong>Department:</strong> {formData.providerInfo.department || 'Not specified'}</div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 3: Order Details */}
            <OrderSectionApproval
              title="Order Details"
              sectionId="section-order"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              isApproved={approvals.orderDetails}
              onApprovalChange={(v) => updateApproval('orderDetails', v)}
              isEditing={editing.orderDetails}
              onEditToggle={(v) => updateEditing('orderDetails', v)}
              hasErrors={!!(errors.orderName || errors.orderType)}
              errorMessage={errors.orderName || errors.orderType}
              required
            >
              {editing.orderDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
                      <select
                        value={formData.orderDetails.orderType}
                        onChange={(e) => updateField('orderDetails', 'orderType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      >
                        <option value="">Select type...</option>
                        <option value="lab">Laboratory</option>
                        <option value="imaging">Imaging</option>
                        <option value="referral">Referral</option>
                        <option value="medication">Medication</option>
                        <option value="procedure">Procedure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Name *</label>
                      <input
                        type="text"
                        value={formData.orderDetails.orderName}
                        onChange={(e) => updateField('orderDetails', 'orderName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., CBC with Differential"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Code</label>
                      <input
                        type="text"
                        value={formData.orderDetails.orderCode}
                        onChange={(e) => updateField('orderDetails', 'orderCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="LOINC/CPT code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.orderDetails.quantity}
                        onChange={(e) => updateField('orderDetails', 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                    <textarea
                      value={formData.orderDetails.specialInstructions}
                      onChange={(e) => updateField('orderDetails', 'specialInstructions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      placeholder="Any special instructions for this order..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div><strong>Type:</strong> {formData.orderDetails.orderType || 'Not specified'}</div>
                  <div><strong>Name:</strong> {formData.orderDetails.orderName || 'Not specified'}</div>
                  <div><strong>Code:</strong> {formData.orderDetails.orderCode || 'Not specified'}</div>
                  {formData.orderDetails.specialInstructions && (
                    <div><strong>Instructions:</strong> {formData.orderDetails.specialInstructions}</div>
                  )}
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 4: Clinical Justification */}
            <OrderSectionApproval
              title="Clinical Justification"
              sectionId="section-justification"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              isApproved={approvals.clinicalJustification}
              onApprovalChange={(v) => updateApproval('clinicalJustification', v)}
              isEditing={editing.clinicalJustification}
              onEditToggle={(v) => updateEditing('clinicalJustification', v)}
              hasErrors={!!(errors.indication || errors.icd10Codes)}
              errorMessage={errors.indication || errors.icd10Codes}
              required
            >
              {editing.clinicalJustification ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Indication *</label>
                    <textarea
                      value={formData.clinicalJustification.indication}
                      onChange={(e) => updateField('clinicalJustification', 'indication', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      placeholder="Reason for ordering this test/procedure..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Codes *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={icd10Search}
                        onChange={(e) => setIcd10Search(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="Search ICD-10 codes..."
                      />
                      {icd10Results.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {icd10Results.map((code) => (
                            <button
                              key={code.code}
                              type="button"
                              onClick={() => addIcd10Code(code)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              <span className="font-medium">{code.code}</span> - {code.description}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Selected codes */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.clinicalJustification.icd10Codes.map((code) => (
                        <span
                          key={code.code}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                        >
                          {code.code}
                          <button
                            type="button"
                            onClick={() => removeIcd10Code(code.code)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Clinical History</label>
                    <textarea
                      value={formData.clinicalJustification.clinicalHistory}
                      onChange={(e) => updateField('clinicalJustification', 'clinicalHistory', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div><strong>Indication:</strong> {formData.clinicalJustification.indication || 'Not specified'}</div>
                  <div>
                    <strong>ICD-10:</strong>{' '}
                    {formData.clinicalJustification.icd10Codes.length > 0
                      ? formData.clinicalJustification.icd10Codes.map(c => c.code).join(', ')
                      : 'None selected'}
                  </div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 5: Priority and Timing */}
            <OrderSectionApproval
              title="Priority and Timing"
              sectionId="section-priority"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              isApproved={approvals.priorityTiming}
              onApprovalChange={(v) => updateApproval('priorityTiming', v)}
              isEditing={editing.priorityTiming}
              onEditToggle={(v) => updateEditing('priorityTiming', v)}
            >
              {editing.priorityTiming ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priorityTiming.priority}
                      onChange={(e) => updateField('priorityTiming', 'priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    >
                      {ORDER_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label} - {p.description}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                    <input
                      type="date"
                      value={formData.priorityTiming.requestedDate}
                      onChange={(e) => updateField('priorityTiming', 'requestedDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Time</label>
                    <input
                      type="time"
                      value={formData.priorityTiming.requestedTime}
                      onChange={(e) => updateField('priorityTiming', 'requestedTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={formData.priorityTiming.expirationDate}
                      onChange={(e) => updateField('priorityTiming', 'expirationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Priority:</strong>{' '}
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      formData.priorityTiming.priority === 'stat' ? 'bg-red-100 text-red-800' :
                      formData.priorityTiming.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {formData.priorityTiming.priority.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Date:</strong> {formData.priorityTiming.requestedDate || 'Not specified'}</div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 6: Collection Instructions */}
            <OrderSectionApproval
              title="Collection Instructions"
              sectionId="section-collection"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
              isApproved={approvals.collectionInstructions}
              onApprovalChange={(v) => updateApproval('collectionInstructions', v)}
              isEditing={editing.collectionInstructions}
              onEditToggle={(v) => updateEditing('collectionInstructions', v)}
            >
              {editing.collectionInstructions ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.collectionInstructions.fasting}
                        onChange={(e) => updateField('collectionInstructions', 'fasting', e.target.checked)}
                        className="h-4 w-4 text-medical-600 border-gray-300 rounded focus:ring-medical-500"
                      />
                      <span className="text-sm text-gray-700">Fasting Required</span>
                    </label>
                    {formData.collectionInstructions.fasting && (
                      <input
                        type="text"
                        value={formData.collectionInstructions.fastingHours}
                        onChange={(e) => updateField('collectionInstructions', 'fastingHours', e.target.value)}
                        className="w-32 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-medical-500"
                        placeholder="Hours (e.g., 8-12)"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specimen Type</label>
                      <input
                        type="text"
                        value={formData.collectionInstructions.specimen}
                        onChange={(e) => updateField('collectionInstructions', 'specimen', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., Serum, Whole Blood"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Collection Site</label>
                      <input
                        type="text"
                        value={formData.collectionInstructions.collectionSite}
                        onChange={(e) => updateField('collectionInstructions', 'collectionSite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="e.g., Lab, Bedside"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Handling</label>
                    <textarea
                      value={formData.collectionInstructions.specialHandling}
                      onChange={(e) => updateField('collectionInstructions', 'specialHandling', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div><strong>Fasting:</strong> {formData.collectionInstructions.fasting ? `Yes (${formData.collectionInstructions.fastingHours || 'hours not specified'})` : 'No'}</div>
                  <div><strong>Specimen:</strong> {formData.collectionInstructions.specimen || 'Not specified'}</div>
                  {formData.collectionInstructions.specialHandling && (
                    <div><strong>Special Handling:</strong> {formData.collectionInstructions.specialHandling}</div>
                  )}
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 7: Safety Checks */}
            <OrderSectionApproval
              title="Safety Checks"
              sectionId="section-safety"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              isApproved={approvals.safetyChecks}
              onApprovalChange={(v) => updateApproval('safetyChecks', v)}
              isEditing={editing.safetyChecks}
              onEditToggle={(v) => updateEditing('safetyChecks', v)}
              hasErrors={!!errors.safetyConfirmed}
              errorMessage={errors.safetyConfirmed}
              required
            >
              {editing.safetyChecks ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      {formData.safetyChecks.allergies.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {formData.safetyChecks.allergies.map((allergy, idx) => (
                            <li key={idx}>{allergy}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No known drug allergies (NKDA)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraindications</label>
                    <textarea
                      value={formData.safetyChecks.contraindicationNotes}
                      onChange={(e) => updateField('safetyChecks', 'contraindicationNotes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      placeholder="Any contraindications to this order..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Status</label>
                      <select
                        value={formData.safetyChecks.pregnancyStatus}
                        onChange={(e) => updateField('safetyChecks', 'pregnancyStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      >
                        <option value="">Not applicable</option>
                        <option value="not_pregnant">Not pregnant</option>
                        <option value="pregnant">Pregnant</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Renal Function</label>
                      <input
                        type="text"
                        value={formData.safetyChecks.renalFunction}
                        onChange={(e) => updateField('safetyChecks', 'renalFunction', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                        placeholder="GFR/Creatinine"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.safetyChecks.safetyConfirmed}
                        onChange={(e) => updateField('safetyChecks', 'safetyConfirmed', e.target.checked)}
                        className="mt-1 h-4 w-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-sm text-yellow-800">
                        I confirm that I have reviewed patient allergies, contraindications, and potential interactions. This order is appropriate for this patient.
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Allergies:</strong>{' '}
                    {formData.safetyChecks.allergies.length > 0
                      ? formData.safetyChecks.allergies.join(', ')
                      : 'NKDA'}
                  </div>
                  <div>
                    <strong>Safety Confirmed:</strong>{' '}
                    {formData.safetyChecks.safetyConfirmed ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No - Required</span>
                    )}
                  </div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 8: Attachments */}
            <OrderSectionApproval
              title="Attachments"
              sectionId="section-attachments"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              }
              isApproved={approvals.attachments}
              onApprovalChange={(v) => updateApproval('attachments', v)}
              isEditing={editing.attachments}
              onEditToggle={(v) => updateEditing('attachments', v)}
            >
              {editing.attachments ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={formData.attachments.notes}
                      onChange={(e) => updateField('attachments', 'notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      placeholder="Any additional notes or context..."
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.attachments.priorAuthRequired}
                        onChange={(e) => updateField('attachments', 'priorAuthRequired', e.target.checked)}
                        className="h-4 w-4 text-medical-600 border-gray-300 rounded focus:ring-medical-500"
                      />
                      <span className="text-sm text-gray-700">Prior Authorization Required</span>
                    </label>
                  </div>
                  {formData.attachments.priorAuthRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prior Auth Number</label>
                      <input
                        type="text"
                        value={formData.attachments.priorAuthNumber}
                        onChange={(e) => updateField('attachments', 'priorAuthNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  {formData.attachments.notes && (
                    <div><strong>Notes:</strong> {formData.attachments.notes}</div>
                  )}
                  <div>
                    <strong>Prior Auth:</strong>{' '}
                    {formData.attachments.priorAuthRequired
                      ? `Required (${formData.attachments.priorAuthNumber || 'pending'})`
                      : 'Not required'}
                  </div>
                </div>
              )}
            </OrderSectionApproval>

            {/* Section 9: Authentication */}
            <OrderSectionApproval
              title="Authentication"
              sectionId="section-auth"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
              isApproved={approvals.authentication}
              onApprovalChange={(v) => updateApproval('authentication', v)}
              isEditing={editing.authentication}
              onEditToggle={(v) => updateEditing('authentication', v)}
              hasErrors={!!(errors.authenticationId || errors.attestation)}
              errorMessage={errors.authenticationId || errors.attestation}
              required
            >
              {editing.authentication ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Authentication ID / PIN *</label>
                    <input
                      type="password"
                      value={formData.authentication.authenticationId}
                      onChange={(e) => updateField('authentication', 'authenticationId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
                      placeholder="Enter your authentication ID"
                    />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.authentication.attestation}
                        onChange={(e) => updateField('authentication', 'attestation', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-800">
                        I attest that all information in this order is accurate and complete. I am the ordering provider or acting under the supervision of the ordering provider. This order is medically necessary and appropriate.
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Authentication:</strong>{' '}
                    {formData.authentication.authenticationId ? 'Entered' : 'Not entered'}
                  </div>
                  <div>
                    <strong>Attestation:</strong>{' '}
                    {formData.authentication.attestation ? (
                      <span className="text-green-600">Confirmed</span>
                    ) : (
                      <span className="text-red-600">Required</span>
                    )}
                  </div>
                </div>
              )}
            </OrderSectionApproval>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {lastSaved && `Auto-saved ${lastSaved.toLocaleTimeString()}`}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allApproved || isSubmitting}
                  className={`px-6 py-2 text-sm font-medium rounded-lg ${
                    allApproved && !isSubmitting
                      ? 'bg-medical-600 text-white hover:bg-medical-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Review & Submit'}
                </button>
              </div>
            </div>
            {!allApproved && (
              <p className="mt-2 text-sm text-amber-600">
                Please approve all sections before submitting. Sections remaining:{' '}
                {Object.entries(approvals)
                  .filter(([, v]) => !v)
                  .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <OrderConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmedSubmit}
          orderData={formData}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
