import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Notification } from './Notification';
import AppBreadcrumb from './AppBreadcrumb';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { cn } from '@/lib/utils';

export const Layout: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const sidebarWidth = 280;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar width={sidebarWidth} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <div className="flex-1 p-6 bg-background overflow-auto">
          <AppBreadcrumb />
          <Outlet />
        </div>
      </main>

      {/* Notification Snackbar */}
      <Notification />
    </div>
  );
};