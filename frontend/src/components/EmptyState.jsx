import React from 'react';

export const EmptyState = ({ title = "No records found", description = "There are no items to display at this time.", icon: Icon, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm w-full my-4">
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {Icon ? <Icon className="w-8 h-8" /> : (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
