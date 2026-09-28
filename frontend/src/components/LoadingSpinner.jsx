import React from 'react';

export const LoadingSpinner = ({ label = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center w-full">
      <div className="relative w-12 h-12 mb-3">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};
