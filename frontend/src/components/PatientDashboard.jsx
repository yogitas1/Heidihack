import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * PatientDashboard - Main view listing all doctor's patients
 * Features: search/filter, patient cards with status indicators
 */
export default function PatientDashboard({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAlert, setFilterAlert] = useState('all');

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/patients');
      setPatients(response.data.patients || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAlert = filterAlert === 'all' || patient.alertLevel === filterAlert;

    return matchesSearch && matchesAlert;
  });

  // Get status indicator styles
  const getAlertStyles = (alertLevel) => {
    switch (alertLevel) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-green-500 bg-white';
    }
  };

  const getAlertBadge = (alertLevel) => {
    switch (alertLevel) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800">CRITICAL</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-800">ALERT</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">Stable</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 skeleton rounded w-full"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 skeleton rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
          <p className="text-sm text-gray-500">
            {patients.length} patients • {filteredPatients.filter(p => p.alertLevel !== 'stable').length} need attention
          </p>
        </div>
        <button
          onClick={fetchPatients}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filterAlert}
          onChange={(e) => setFilterAlert(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500"
        >
          <option value="all">All Status</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="stable">Stable</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`card p-4 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getAlertStyles(patient.alertLevel)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    patient.alertLevel === 'critical' ? 'bg-red-500' :
                    patient.alertLevel === 'warning' ? 'bg-yellow-500' :
                    'bg-medical-500'
                  }`}>
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      {getAlertBadge(patient.alertLevel)}
                    </div>
                    <div className="text-sm text-gray-500">
                      MRN: {patient.mrn} • {patient.age}y {patient.gender}
                    </div>
                  </div>
                </div>

                {/* Right side info */}
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    {/* Pending Orders Badge */}
                    {patient.pendingOrdersCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {patient.pendingOrdersCount} orders
                      </span>
                    )}

                    {/* Alerts Badge */}
                    {patient.activeAlertsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {patient.activeAlertsCount}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {patient.lastVisitDate && (
                      <span>Last visit: {new Date(patient.lastVisitDate).toLocaleDateString()}</span>
                    )}
                  </div>

                  {patient.nextAppointmentDate && (
                    <div className="text-xs text-medical-600 font-medium">
                      Next: {new Date(patient.nextAppointmentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <svg className="h-5 w-5 text-gray-400 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {patients.filter(p => p.alertLevel === 'critical').length}
          </div>
          <div className="text-xs text-gray-500">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {patients.filter(p => p.alertLevel === 'warning').length}
          </div>
          <div className="text-xs text-gray-500">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {patients.filter(p => p.alertLevel === 'stable').length}
          </div>
          <div className="text-xs text-gray-500">Stable</div>
        </div>
      </div>
    </div>
  );
}
