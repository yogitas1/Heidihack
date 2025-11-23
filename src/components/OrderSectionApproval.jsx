import { useState } from 'react';

/**
 * OrderSectionApproval - Reusable wrapper component for order form sections
 *
 * Provides:
 * - View/Edit mode toggle
 * - Approval checkbox
 * - Visual states (blue=default, yellow=editing, green=approved, red=error)
 * - Collapsible content
 */
export default function OrderSectionApproval({
  title,
  icon,
  isApproved,
  onApprovalChange,
  isEditing,
  onEditToggle,
  hasErrors,
  errorMessage,
  children,
  required = false,
  helpText,
  sectionId,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine border and background colors based on state
  const getBorderClass = () => {
    if (hasErrors) return 'border-red-400 bg-red-50';
    if (isApproved) return 'border-green-400 bg-green-50';
    if (isEditing) return 'border-yellow-400 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const getHeaderBgClass = () => {
    if (hasErrors) return 'bg-red-100';
    if (isApproved) return 'bg-green-100';
    if (isEditing) return 'bg-yellow-100';
    return 'bg-gray-50';
  };

  const getStatusIcon = () => {
    if (hasErrors) {
      return (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (isApproved) {
      return (
        <svg className="h-5 w-5 text-green-500 animate-bounce-once" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-lg border-2 transition-all duration-300 ${getBorderClass()}`}
      id={sectionId}
    >
      {/* Section Header */}
      <div className={`px-4 py-3 ${getHeaderBgClass()} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Section Icon */}
            {icon && (
              <span className="text-medical-600">{icon}</span>
            )}

            {/* Section Title */}
            <h3 className="text-base font-semibold text-gray-900">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>

            {/* Status Icon */}
            {getStatusIcon()}
          </div>

          <div className="flex items-center space-x-3">
            {/* Edit Toggle Button */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => onEditToggle?.(true)}
                className="text-sm px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onEditToggle?.(false)}
                className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Done
              </button>
            )}

            {/* Approval Checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => onApprovalChange?.(e.target.checked)}
                disabled={hasErrors}
                className={`h-5 w-5 rounded border-2 focus:ring-2 focus:ring-offset-1 transition-colors ${
                  isApproved
                    ? 'text-green-600 border-green-500 focus:ring-green-500'
                    : 'text-gray-400 border-gray-300 focus:ring-medical-500'
                } ${hasErrors ? 'cursor-not-allowed opacity-50' : ''}`}
              />
              <span className={`text-sm font-medium ${isApproved ? 'text-green-700' : 'text-gray-600'}`}>
                {isApproved ? 'Approved' : 'Approve'}
              </span>
            </label>
          </div>
        </div>

        {/* Help Text */}
        {helpText && (
          <p className="mt-1 text-xs text-gray-500 ml-8">{helpText}</p>
        )}

        {/* Error Message */}
        {hasErrors && errorMessage && (
          <p className="mt-2 text-sm text-red-600 ml-8" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className={`p-4 ${isEditing ? '' : 'bg-gray-50'}`}>
          {isEditing ? (
            // Edit Mode - Show full form controls
            <div className="space-y-4">
              {children}
            </div>
          ) : (
            // View Mode - Show read-only summary
            <div className="text-sm text-gray-700">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for displaying in confirmation modal
export function OrderSectionSummary({ title, children, isApproved }) {
  return (
    <div className={`p-3 rounded-lg border ${isApproved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {isApproved && (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="text-xs text-gray-600">{children}</div>
    </div>
  );
}

// CSS for bounce animation (add to index.css if not present)
const styles = `
  @keyframes bounce-once {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  .animate-bounce-once {
    animation: bounce-once 0.3s ease-in-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
