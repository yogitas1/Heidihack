import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function EncountersTab({ patientId }) {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEncounters();
  }, [patientId, page]);

  const fetchEncounters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/patients/${patientId}/encounters`, {
        params: { page, page_size: 10 }
      });
      setEncounters(response.data.encounters || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch encounters:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && encounters.length === 0) {
    return <div className="h-48 skeleton rounded-lg"></div>;
  }

  if (encounters.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No encounters yet</h3>
        <p className="mt-1 text-sm text-gray-500">Encounters will appear here after clinical visits</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Encounter History</h3>
        <span className="text-sm text-gray-500">{total} total encounters</span>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {encounters.map((encounter) => (
          <div key={encounter.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === encounter.id ? null : encounter.id)}
              className="w-full p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-medical-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{encounter.chiefComplaint}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(encounter.date).toLocaleDateString()} • {encounter.provider || 'Provider'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {encounter.icdCodes && encounter.icdCodes.length > 0 && (
                    <span className="text-xs font-mono text-gray-500">
                      {encounter.icdCodes[0].code}
                    </span>
                  )}
                  <svg
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedId === encounter.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedId === encounter.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* SOAP Note */}
                {encounter.clinicalNote && (
                  <div className="mt-4 space-y-3">
                    {encounter.clinicalNote.subjective && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Subjective</h4>
                        <p className="text-sm text-gray-700 mt-1">{encounter.clinicalNote.subjective}</p>
                      </div>
                    )}
                    {encounter.clinicalNote.objective && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Objective</h4>
                        <p className="text-sm text-gray-700 mt-1">{encounter.clinicalNote.objective}</p>
                      </div>
                    )}
                    {encounter.clinicalNote.assessment && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Assessment</h4>
                        <p className="text-sm text-gray-700 mt-1">{encounter.clinicalNote.assessment}</p>
                      </div>
                    )}
                    {encounter.clinicalNote.plan && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Plan</h4>
                        <p className="text-sm text-gray-700 mt-1">{encounter.clinicalNote.plan}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ICD Codes */}
                {encounter.icdCodes && encounter.icdCodes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Diagnosis Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {encounter.icdCodes.map((code, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          <span className="font-mono font-medium">{code.code}</span>
                          {code.description && <span className="text-gray-500 ml-1">- {code.description}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-3">
                  <button className="text-sm text-medical-600 hover:text-medical-800">View Full Details</button>
                  <button className="text-sm text-gray-600 hover:text-gray-800">Print</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center space-x-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 10 >= total}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
