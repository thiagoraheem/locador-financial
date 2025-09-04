import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { hideNotification, clearNotification } from '../store/slices/uiSlice';

export const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state: RootState) => state.ui);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  const handleExited = () => {
    dispatch(clearNotification());
  };

  if (!notification) {
    return null;
  }

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{
        onExited: handleExited,
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};