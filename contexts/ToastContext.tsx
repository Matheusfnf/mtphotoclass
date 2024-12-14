import React, { createContext, useContext, useState } from 'react';
import { CustomToast } from '@/components/ui/CustomToast';

interface ToastContextData {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setMessage(message);
    setType(type);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CustomToast
        visible={visible}
        message={message}
        type={type}
        onHide={() => setVisible(false)}
      />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
