
import React from 'react';

export interface ProgressData {
  currentText: string;
  currentIndex: number;
  totalStrings: number;
}

export const ProgressTracker: React.FC<ProgressData> = ({ currentText, currentIndex, totalStrings }) => {
  const progressPercentage = totalStrings > 0 ? (currentIndex / totalStrings) * 100 : 0;
  
  // Truncate long strings for display
  const displayText = currentText.length > 70 ? `${currentText.substring(0, 67)}...` : currentText;

  return (
    <div 
      className="my-6 p-4 bg-gray-800 shadow-lg rounded-lg border border-gray-700"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center mb-3">
        <svg 
          className="animate-spin h-6 w-6 text-indigo-400 mr-3" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-lg font-semibold text-indigo-300">
          Translating... ({currentIndex} / {totalStrings})
        </p>
      </div>
      
      {currentText && totalStrings > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-400">Current: 
            <span className="text-gray-200 ml-1 font-mono bg-gray-700 px-2 py-0.5 rounded text-xs" aria-label={`Currently translating: ${currentText}`}>
              "{displayText}"
            </span>
          </p>
        </div>
      )}

      {totalStrings > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={currentIndex}
            aria-valuemin={0}
            aria-valuemax={totalStrings}
            role="progressbar"
            aria-label={`Translation progress: ${Math.round(progressPercentage)}%`}
          ></div>
        </div>
      )}
       {totalStrings === 0 && currentIndex === 0 && (
         <p className="text-sm text-gray-400">Preparing to translate...</p>
       )}
    </div>
  );
};
