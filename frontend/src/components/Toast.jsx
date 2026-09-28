import React, { createContext, useContext, useState } from 'react';
import { IconCheckCircle, IconAlertTriangle, IconX } from './Icons';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border transition-all duration-300 transform animate-slide-up ${
              toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? (
                <IconAlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : toast.type === 'warning' ? (
                <IconAlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <IconCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
