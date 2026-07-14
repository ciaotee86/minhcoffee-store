import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động ẩn sau 4 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Vùng chứa các thông báo nổi */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-sm
              rounded-md shadow-lg transform transition-all duration-300 animate-slide-in-right
              ${
                toast.type === 'success'
                  ? 'bg-coffee/90 text-cream border border-coffee/20'
                  : toast.type === 'error'
                  ? 'bg-error text-white'
                  : 'bg-beige text-coffee border border-coffee/10'
              }
            `}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="shrink-0" />}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
