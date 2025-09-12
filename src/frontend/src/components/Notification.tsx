import React, { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { hideNotification, clearNotification } from '../store/slices/uiSlice';

export const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (notification && notification.open) {
      const { message, severity } = notification;
      
      switch (severity) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'info':
        default:
          toast.info(message);
          break;
      }
      
      dispatch(hideNotification());
      dispatch(clearNotification());
    }
  }, [notification, dispatch]);

  return (
    <Toaster 
      position="top-right" 
      richColors 
      closeButton 
      duration={6000}
    />
  );
};