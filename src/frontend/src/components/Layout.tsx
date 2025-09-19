import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

import AppBreadcrumb from './AppBreadcrumb';

export const Layout: React.FC = () => {
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


    </div>
  );
};