import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Notification } from './Notification';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar width={sidebarWidth} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
        }}
      >
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: theme.palette.background.default,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Notification Snackbar */}
      <Notification />
    </Box>
  );
};