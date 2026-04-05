import React, { useEffect, useState } from 'react';
import { Check, X, OctagonAlert } from 'lucide-react';

//thông báo toast
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const ToastContainer = () => (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}

function Toast({ id, message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount slide in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const styles = {
    success: {
      bg:   ' border-emerald-500/40',
      icon: <Check className="h-4 w-4" />,
      iconCls: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-300',
    },
    error: {
      bg:   ' border-red-500/40',
      icon: <X className="h-4 w-4" />,
      iconCls: 'bg-red-500/20 text-red-400',
      text: 'text-red-300',
    },
    info: {
      bg:   ' border-sky-500/40',
      icon: <OctagonAlert className="h-4 w-4" />,
      iconCls: 'bg-sky-500/20 text-sky-400',
      text: 'text-sky-300',
    },
  };

  const s = styles[type] || styles.success;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl shadow-black/40 min-w-[280px] max-w-sm transition-all duration-300 ${s.bg} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      {/* Icon */}
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${s.iconCls}`}>
        {s.icon}
      </span>

      {/* Message */}
      <p className={`text-sm font-medium flex-1 leading-relaxed ${s.text}`}>{message}</p>

      {/* Close */}
      <button
        onClick={onClose}
        className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5 text-lg leading-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}