import React, { useState } from 'react';
import { IconSearch, IconBell, IconMenu, IconServer, IconCheckCircle, IconAlertTriangle } from './Icons';

export const Navbar = ({ title = "Dashboard", onMenuClick, isBackendLive, searchQuery, setSearchQuery, notificationsCount = 0 }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
      {/* Left: Mobile Menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <IconMenu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      {/* Center: Search Box */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search machines, technicians, tasks..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend Connection Indicator Badge */}
        <div 
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isBackendLive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
          title={isBackendLive ? "Connected to Spring Boot REST Backend (http://localhost:8080)" : "Operating in Standalone / Mock Data Mode"}
        >
          <IconServer className="w-3.5 h-3.5" />
          <span>{isBackendLive ? "Backend Online" : "Demo Mode"}</span>
          <span className={`w-2 h-2 rounded-full ${isBackendLive ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`}></span>
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors relative"
          >
            <IconBell className="w-5 h-5" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-scale-up">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Alerts</h4>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {notificationsCount} New
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                {notificationsCount > 0 ? (
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <IconAlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Equipment Overdue</p>
                        <p className="text-xs text-slate-500">Industrial Conveyor Belt C-50 has exceeded usage limit.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No urgent notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm border border-blue-200">
          MS
        </div>
      </div>
    </header>
  );
};
