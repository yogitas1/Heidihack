import { useState } from 'react';
import apiClient from '../api/client';

export default function FollowUpTab({ patientId, followUps = [], onUpdate }) {
  const [updating, setUpdating] = useState(null);

  const scheduledFollowUps = followUps.filter(f => f.status === 'scheduled');
  const pastFollowUps = followUps.filter(f => f.status !== 'scheduled');

  const updateStatus = async (followUpId, status, notes = '') => {
    try {
      setUpdating(followUpId);
      await apiClient.patch(`/api/patients/${patientId}/follow-ups/${followUpId}`, null, {
        params: { status, notes }
      });
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update follow-up:', err);
      alert('Failed to update follow-up');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'routine': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Follow-ups */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-medical-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Scheduled Follow-ups
          {scheduledFollowUps.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {scheduledFollowUps.length}
            </span>
          )}
        </h3>

        {scheduledFollowUps.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No scheduled follow-ups</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledFollowUps.map((followUp) => (
              <div key={followUp.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{followUp.reason}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">
                        {new Date(followUp.scheduledDate).toLocaleDateString()}
                      </span>
                      {followUp.scheduledTime && <span> at {followUp.scheduledTime}</span>}
                      <span> • {followUp.duration} min</span>
                    </div>
                    {followUp.notes && (
                      <div className="text-sm text-gray-600 mt-1">{followUp.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusStyles(followUp.status)}`}>
                      {followUp.status}
                    </span>
                    <div className={`text-xs font-medium mt-1 ${getPriorityStyles(followUp.priority)}`}>
                      {followUp.priority}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-3">
                  <button
                    onClick={() => updateStatus(followUp.id, 'completed')}
                    disabled={updating === followUp.id}
                    className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => updateStatus(followUp.id, 'cancelled')}
                    disabled={updating === followUp.id}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Follow-ups */}
      {pastFollowUps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Follow-ups</h3>
          <div className="space-y-2">
            {pastFollowUps.map((followUp) => (
              <div key={followUp.id} className="card p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    followUp.status === 'completed' ? 'bg-green-100' :
                    followUp.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <svg className={`h-4 w-4 ${
                      followUp.status === 'completed' ? 'text-green-600' :
                      followUp.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        followUp.status === 'completed' ? 'M5 13l4 4L19 7' :
                        followUp.status === 'cancelled' ? 'M6 18L18 6M6 6l12 12' :
                        'M12 8v4m0 4h.01'
                      } />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{followUp.reason}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(followUp.scheduledDate).toLocaleDateString()}
                      {followUp.completedDate && (
                        <span> • Completed: {new Date(followUp.completedDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${getStatusStyles(followUp.status)}`}>
                  {followUp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
