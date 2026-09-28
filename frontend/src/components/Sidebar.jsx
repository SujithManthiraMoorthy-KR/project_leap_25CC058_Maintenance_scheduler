import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IconDashboard, 
  IconCog, 
  IconActivity, 
  IconWrench, 
  IconUsers, 
  IconAlertTriangle, 
  IconSettings, 
  IconUser,
  IconX
} from './Icons';

export const Sidebar = ({ overdueCount = 0, isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: IconDashboard },
    { label: 'Machines', path: '/machines', icon: IconCog },
    { label: 'Usage Logs', path: '/usage-logs', icon: IconActivity },
    { label: 'Maintenance Tasks', path: '/maintenance-tasks', icon: IconWrench },
    { label: 'Technicians', path: '/technicians', icon: IconUsers },
    { 
      label: 'Overdue Machines', 
      path: '/overdue-machines', 
      icon: IconAlertTriangle,
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <IconWrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-wide">MaintainIt</h1>
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Scheduler Pro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Profile / Settings */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <IconSettings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold border border-slate-600">
                <IconUser className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Plant Supervisor</p>
                <p className="text-[10px] text-slate-400">admin@workshop.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
