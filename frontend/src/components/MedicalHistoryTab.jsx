import { useState } from 'react';
import apiClient from '../api/client';

export default function MedicalHistoryTab({ patientId, medicalHistory, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState(medicalHistory || {});

  const saveHistory = async () => {
    try {
      setSaving(true);
      await apiClient.post(`/api/patients/${patientId}/medical-history`, {
        medicalHistory: history
      });
      setEditing(null);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save medical history');
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, icon, children, sectionKey }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-medical-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
          {title}
        </h3>
        <button
          onClick={() => setEditing(editing === sectionKey ? null : sectionKey)}
          className="text-sm text-medical-600 hover:text-medical-800"
        >
          {editing === sectionKey ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {children}
      {editing === sectionKey && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={saveHistory}
            disabled={saving}
            className="px-3 py-1.5 text-sm font-medium text-white bg-medical-600 rounded hover:bg-medical-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Chronic Conditions */}
      <Section title="Chronic Conditions" icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" sectionKey="conditions">
        {(history.chronicConditions || []).length === 0 ? (
          <p className="text-sm text-gray-500">No chronic conditions recorded</p>
        ) : (
          <div className="space-y-2">
            {(history.chronicConditions || []).map((c, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">{c.condition}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    c.status === 'active' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>{c.status}</span>
                </div>
                {c.icd10Code && <div className="text-xs font-mono text-gray-500 mt-1">{c.icd10Code}</div>}
                {c.diagnosedDate && <div className="text-xs text-gray-500">Diagnosed: {c.diagnosedDate}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Surgical History */}
      <Section title="Surgical History" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" sectionKey="surgical">
        {(history.surgicalHistory || []).length === 0 ? (
          <p className="text-sm text-gray-500">No surgical history recorded</p>
        ) : (
          <div className="space-y-2">
            {(history.surgicalHistory || []).map((s, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{s.procedure}</div>
                <div className="text-sm text-gray-500">
                  {s.date && <span>{s.date}</span>}
                  {s.hospital && <span> • {s.hospital}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Family History */}
      <Section title="Family History" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" sectionKey="family">
        {(history.familyHistory || []).length === 0 ? (
          <p className="text-sm text-gray-500">No family history recorded</p>
        ) : (
          <div className="space-y-2">
            {(history.familyHistory || []).map((f, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{f.relation}:</span>
                <span className="ml-2">{f.condition}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Social History */}
      <Section title="Social History" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" sectionKey="social">
        {history.socialHistory ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Smoking:</span> <span className="font-medium">{history.socialHistory.smokingStatus}</span></div>
            <div><span className="text-gray-500">Alcohol:</span> <span className="font-medium">{history.socialHistory.alcoholUse}</span></div>
            {history.socialHistory.occupation && (
              <div><span className="text-gray-500">Occupation:</span> <span className="font-medium">{history.socialHistory.occupation}</span></div>
            )}
            {history.socialHistory.exercise && (
              <div><span className="text-gray-500">Exercise:</span> <span className="font-medium">{history.socialHistory.exercise}</span></div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No social history recorded</p>
        )}
      </Section>

      {/* Allergies */}
      <Section title="Allergies" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" sectionKey="allergies">
        {(history.allergies || []).length === 0 ? (
          <p className="text-sm text-green-600 font-medium">No Known Drug Allergies (NKDA)</p>
        ) : (
          <div className="space-y-2">
            {(history.allergies || []).map((a, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                a.severity === 'severe' ? 'bg-red-50' : a.severity === 'moderate' ? 'bg-yellow-50' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between">
                  <span className="font-medium">{a.allergen}</span>
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                    a.severity === 'severe' ? 'bg-red-200 text-red-800' :
                    a.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>{a.severity}</span>
                </div>
                {a.reaction && <div className="text-sm text-gray-600 mt-1">Reaction: {a.reaction}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
