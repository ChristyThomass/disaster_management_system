import React from 'react';
import { NavigationTab } from '../types';

interface AdminSidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenReportEmergencyModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportEmergencyModal,
}) => {
  const adminProfileImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDuYnQPwA3TK4YGRx95QK5c9SH7vYhJ1rNlNPRdhgJ-sTTeAidJbFw37GVBh6q545K6jwAm83stb2P97yhHKJbssI5YuKw_Tv6aKPjxXKfk8EJNSoGtzLkys0zfoC4vSAU3ORqNVnRE7m97WX_IeiKDrVE2fRSHg76kmE9zuQsxoJbbXQ5q0Y2OHRkFTGO6gNjqs0HEw50qPLvUbpR-F0CcheBnyUZecQwTN3ZsT6TZ0_m_ni1_Em3zlA';

  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'admin-kerala-map', label: 'Kerala Live Map', icon: 'map' },
    { id: 'admin-disaster-reports', label: 'Disaster Reports', icon: 'report_problem' },
    { id: 'admin-volunteers', label: 'Volunteers', icon: 'volunteer_activism' },
    { id: 'admin-inventory', label: 'Resource Inventory', icon: 'inventory_2' },
    { id: 'admin-help-requests', label: 'Help Requests', icon: 'handshake' },
    { id: 'admin-alerts', label: 'Alerts Management', icon: 'notification_important' },
    { id: 'admin-analytics', label: 'Analytics', icon: 'monitoring' },
  ];

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-[#e4beba] flex flex-col py-4 px-2 z-30 shadow-sm overflow-hidden">
      {/* Brand & User Info */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('admin-dashboard')}
            className="text-2xl font-bold text-[#af101a] text-left hover:opacity-90"
          >
            ResilienceNet
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs text-[#4c56af] hover:underline bg-[#e0e0ff] px-2 py-0.5 rounded font-semibold"
            title="Return to Public View"
          >
            Public Site
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-[#e4beba] shrink-0">
            <img
              src={adminProfileImg}
              alt="Admin User Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#1a1c1c]">Admin Command</div>
            <div className="text-xs text-[#5b403d]">Regional Coordinator</div>
          </div>
        </div>
      </div>

      {/* Emergency Trigger Button */}
      <div className="px-3 mb-4">
        <button
          onClick={onOpenReportEmergencyModal}
          className="w-full bg-[#af101a] hover:bg-[#d32f2f] text-white rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] fill" data-weight="fill">
            campaign
          </span>
          Report Emergency
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-1 flex flex-col gap-1 hide-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#959efd]/30 text-[#27308a] border-l-4 border-[#4c56af] translate-x-1 font-bold'
                  : 'text-[#5b403d] hover:bg-[#e8e8e8] hover:text-[#1a1c1c]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                {...(isActive ? { 'data-weight': 'fill' } : {})}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto border-t border-[#e4beba] pt-3 px-1 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('admin-settings')}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'admin-settings'
              ? 'bg-[#959efd]/30 text-[#27308a] font-bold'
              : 'text-[#5b403d] hover:bg-[#e8e8e8]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-[#5b403d] hover:bg-[#e8e8e8] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
