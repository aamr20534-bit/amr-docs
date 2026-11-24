import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 end-4 z-[60] flex flex-col gap-2 max-w-[90vw] sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-card border text-sm font-medium pointer-events-auto animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-navy-800 text-white border-navy-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
