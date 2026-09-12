import React from 'react';
import { NavigationTab } from '../types';

interface AdminTopNavProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onExitAdmin?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  activeTab,
  setActiveTab,
  onExitAdmin,
}) => {
  const adminNavItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'admin-kerala-map', label: 'Kerala Live Map', icon: 'map' },
    { id: 'admin-disaster-reports', label: 'Disaster Reports', icon: 'report_problem' },
    { id: 'admin-volunteers', label: 'Volunteers', icon: 'volunteer_activism' },
    { id: 'admin-inventory', label: 'Resource Inventory', icon: 'inventory_2' },
    { id: 'admin-help-requests', label: 'Help Requests', icon: 'handshake' },
    { id: 'admin-alerts', label: 'Alerts', icon: 'notification_important' },
    { id: 'admin-analytics', label: 'Analytics', icon: 'monitoring' },
    { id: 'admin-settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="bg-[#1a1c1c] text-white border-b border-[#af101a] sticky top-[104px] z-40 shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Admin Command Banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#af101a] px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider text-white">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Admin Command Center
          </div>

          <span className="text-xs text-gray-300 hidden sm:inline">
            Logged in as <strong className="text-white">Regional Disaster Officer</strong>
          </span>
        </div>

        {/* Right: Exit Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onExitAdmin) {
                onExitAdmin();
              } else {
                setActiveTab('home');
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-all cursor-pointer"
            title="Exit Admin and Sign Out"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Exit Admin
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-[#242628] border-t border-gray-800 px-4 md:px-6 overflow-x-auto hide-scrollbar">
        <div className="max-w-[1440px] mx-auto flex items-center space-x-1 py-1 min-w-max">
          {adminNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f9f9f9] text-[#af101a] border-t-2 border-[#af101a]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
