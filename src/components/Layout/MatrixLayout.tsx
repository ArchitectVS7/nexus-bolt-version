import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MatrixSidebar from './MatrixSidebar';
import MatrixHeader from './MatrixHeader';
import NotificationSystem from '../UI/NotificationSystem';
import { useGameStore } from '../../store/gameStore';

const MatrixLayout: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useGameStore();

  return (
    <div className="min-h-screen bg-neutral-black text-matrix-green font-mono">
      {/* CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="w-full h-full opacity-10">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-matrix-green to-transparent animate-scan-line"></div>
        </div>
      </div>
  
      {/* Main Layout */}
      <div className="flex h-screen">
        <MatrixSidebar />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <MatrixHeader />
          
          <main className="flex-1 overflow-hidden">
            <div className="h-full crt-screen">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <NotificationSystem />
    </div>
  );
};

export default MatrixLayout;