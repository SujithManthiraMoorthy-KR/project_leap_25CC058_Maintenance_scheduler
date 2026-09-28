import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/Toast';

import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetails } from './pages/MachineDetails';
import { UsageLogs } from './pages/UsageLogs';
import { MaintenanceTasks } from './pages/MaintenanceTasks';
import { Technicians } from './pages/Technicians';
import { OverdueMachines } from './pages/OverdueMachines';
import { Settings } from './pages/Settings';

import { maintenanceService } from './services/maintenanceService';

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine current page title based on path
  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/machines/')) return 'Machine Equipment Details';
    if (path === '/machines') return 'Equipment Machinery';
    if (path === '/usage-logs') return 'Machine Usage Logs';
    if (path === '/maintenance-tasks') return 'Maintenance Work Orders';
    if (path === '/technicians') return 'Technician Directory';
    if (path === '/overdue-machines') return 'Critical Overdue Equipment';
    if (path === '/settings') return 'Settings & Backend Status';
    return 'MaintainIt Scheduler';
  };

  useEffect(() => {
    checkOverdueAndBackend();
  }, [location.pathname]);

  const checkOverdueAndBackend = async () => {
    try {
      const overdueList = await maintenanceService.getOverdueMachines();
      setOverdueCount(overdueList ? overdueList.length : 0);
      setIsBackendLive(true);
    } catch (err) {
      setIsBackendLive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar 
        overdueCount={overdueCount} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Navbar 
          title={getPageTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
          isBackendLive={isBackendLive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationsCount={overdueCount}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
            <Route path="/machines" element={<Machines searchQuery={searchQuery} />} />
            <Route path="/machines/:id" element={<MachineDetails />} />
            <Route path="/usage-logs" element={<UsageLogs />} />
            <Route path="/maintenance-tasks" element={<MaintenanceTasks searchQuery={searchQuery} />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/overdue-machines" element={<OverdueMachines />} />
            <Route path="/settings" element={<Settings isBackendLive={isBackendLive} setIsBackendLive={setIsBackendLive} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
