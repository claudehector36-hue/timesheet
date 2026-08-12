import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        const bg = isSuccess ? 'bg-emerald-900 text-emerald-50 border-emerald-700' :
                   isError ? 'bg-rose-900 text-rose-50 border-rose-700' :
                   isWarning ? 'bg-amber-900 text-amber-50 border-amber-700' :
                   'bg-slate-900 text-slate-50 border-slate-700';

        const Icon = isSuccess ? CheckCircle2 :
                     isError ? XCircle :
                     isWarning ? AlertTriangle : Info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-lg transition-all transform duration-300 animate-in slide-in-from-bottom-5 ${bg}`}
          >
            <Icon className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <div className="flex-1 pr-2">
              <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
