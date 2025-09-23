'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type AlertContextType = {
  showAlert: (message: string, severity?: 'success' | 'error') => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  const showAlert = (message: string, severity: 'success' | 'error' = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleClose = () => setAlertOpen(false);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};
