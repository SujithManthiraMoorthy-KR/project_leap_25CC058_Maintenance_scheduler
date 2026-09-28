import React from 'react';
import { Modal } from './Modal';
import { IconAlertTriangle } from './Icons';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmText = "Delete", cancelText = "Cancel", isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full flex-shrink-0 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
          <IconAlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 font-normal">{message}</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors ${
            isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
