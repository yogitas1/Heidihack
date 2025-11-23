import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import MedicalHistoryTab from './MedicalHistoryTab';
import EncountersTab from './EncountersTab';
import LabsOrdersTab from './LabsOrdersTab';
import FollowUpTab from './FollowUpTab';

/**
 * PatientProfile - Detailed patient view with tabs
 */
export default function PatientProfile({ patientId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [patientId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/patients/${patientId}/profile`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load patient profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'history', label: 'Medical History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'encounters', label: 'Encounters', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'labs', label: 'Labs & Orders', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'followups', label: 'Follow-ups', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 skeleton rounded-lg"></div>
        <div className="h-12 skeleton rounded"></div>
        <div className="h-64 skeleton rounded-lg"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error || 'Patient not found'}</p>
        <button onClick={onBack} className="mt-4 text-sm text-red-600 hover:text-red-800">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { patient, recentOrders } = profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      {/* Patient Header Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-medical-500 flex items-center justify-center text-white text-xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="text-sm text-gray-500 space-x-3">
                <span>MRN: {patient.mrn}</span>
                <span>•</span>
                <span>{patient.age}y {patient.gender}</span>
                <span>•</span>
                <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
              {patient.phone && (
                <div className="text-sm text-gray-500 mt-1">
                  <span>{patient.phone}</span>
                  {patient.email && <span> • {patient.email}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {patient.alerts && patient.alerts.filter(a => a.isActive).length > 0 && (
            <div className="space-y-2">
              {patient.alerts.filter(a => a.isActive).map((alert, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-medical-500 text-medical-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab patient={patient} recentOrders={recentOrders} />
        )}
        {activeTab === 'history' && (
          <MedicalHistoryTab
            patientId={patientId}
            medicalHistory={patient.medicalHistory}
            onUpdate={fetchProfile}
          />
        )}
        {activeTab === 'encounters' && (
          <EncountersTab patientId={patientId} />
        )}
        {activeTab === 'labs' && (
          <LabsOrdersTab patientId={patientId} orders={recentOrders} />
        )}
        {activeTab === 'followups' && (
          <FollowUpTab patientId={patientId} followUps={patient.followUps} onUpdate={fetchProfile} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ patient, recentOrders }) {
  const allergies = patient.medicalHistory?.allergies || [];
  const medications = patient.medicalHistory?.medications || [];
  const conditions = patient.medicalHistory?.chronicConditions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Allergies */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Allergies
        </h3>
        {allergies.length === 0 ? (
          <p className="text-sm text-gray-500">No known allergies (NKDA)</p>
        ) : (
          <div className="space-y-2">
            {allergies.map((allergy, idx) => (
              <div key={idx} className={`p-2 rounded text-sm ${
                allergy.severity === 'severe' ? 'bg-red-50 text-red-700' :
                allergy.severity === 'moderate' ? 'bg-yellow-50 text-yellow-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                <span className="font-medium">{allergy.allergen}</span>
                {allergy.reaction && <span> - {allergy.reaction}</span>}
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  allergy.severity === 'severe' ? 'bg-red-200' :
                  allergy.severity === 'moderate' ? 'bg-yellow-200' :
                  'bg-gray-200'
                }`}>
                  {allergy.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Medications */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2 text-medical-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Current Medications
        </h3>
        {medications.length === 0 ? (
          <p className="text-sm text-gray-500">No current medications</p>
        ) : (
          <div className="space-y-2">
            {medications.map((med, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">{med.name}</span>
                {med.dose && <span className="text-gray-600"> {med.dose}</span>}
                {med.frequency && <span className="text-gray-500"> - {med.frequency}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Conditions */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Active Conditions
        </h3>
        {conditions.length === 0 ? (
          <p className="text-sm text-gray-500">No chronic conditions</p>
        ) : (
          <div className="space-y-2">
            {conditions.filter(c => c.status === 'active' || c.status === 'managed').map((condition, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">{condition.condition}</span>
                {condition.icd10Code && (
                  <span className="ml-2 text-xs font-mono text-gray-500">{condition.icd10Code}</span>
                )}
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  condition.status === 'active' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {condition.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Recent Orders
        </h3>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No recent orders</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((order, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm flex justify-between items-center">
                <div>
                  <span className="font-medium">{order.orderDetails?.orderName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(order.metadata?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  order.metadata?.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.metadata?.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
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
