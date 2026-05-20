import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ toast: showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full sm:w-96">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgClass = "bg-white border-gray-100 text-gray-800";
            let IconComponent = Info;
            let iconColorClass = "text-blue-500";
            
            if (t.type === 'success') {
              bgClass = "bg-emerald-50 border-emerald-100 text-emerald-900";
              IconComponent = CheckCircle;
              iconColorClass = "text-emerald-500";
            } else if (t.type === 'error') {
              bgClass = "bg-rose-50 border-rose-100 text-rose-900";
              IconComponent = AlertCircle;
              iconColorClass = "text-rose-500";
            } else if (t.type === 'warning') {
              bgClass = "bg-amber-50 border-amber-100 text-amber-900";
              IconComponent = AlertTriangle;
              iconColorClass = "text-amber-500";
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl ${bgClass}`}
                role="alert"
              >
                <div className={`mt-0.5 flex-shrink-0 ${iconColorClass}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <div className="flex-1 text-xs font-semibold leading-normal">
                  {t.message}
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 rounded-full p-0.5 hover:bg-black/5 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
