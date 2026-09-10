import React from 'react';
import { NavigationTab, AlertItem, UserProfile } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  alerts: AlertItem[];
  onOpenEmergencyHelpline: () => void;
  onOpenLoginModal: () => void;
  currentUser?: UserProfile | null;
  onTriggerSos?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alerts,
  onOpenEmergencyHelpline,
  onOpenLoginModal,
  currentUser,
  onTriggerSos,
  onSignOut,
}) => {
  return (
    <div className="w-full sticky top-0 z-40 bg-surface shadow-sm">
      {/* Live Alerts Ticker */}
      <div className="bg-[#af101a] text-white py-1 px-4 md:px-6 border-b border-[#d32f2f] z-50 relative overflow-hidden h-10 flex items-center">
        <div className="flex items-center space-x-2 font-semibold shrink-0 mr-4 z-10 bg-[#af101a] h-full pr-4 shadow-[4px_0_8px_rgba(175,16,26,1)]">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span className="text-xs tracking-wider uppercase font-bold">CRITICAL UPDATES</span>
        </div>
        <div className="ticker-wrap flex-1 text-sm font-medium">
          <div className="ticker">
            {alerts.map((a) => (
              <span key={a.id} className="mx-8">
                • {a.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <header className="bg-white border-b border-[#e4beba]/40 w-full">
        <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-[1440px] mx-auto h-16">
          <div className="flex items-center gap-6 md:gap-10">
            <button
              onClick={() => setActiveTab('home')}
              className="text-lg md:text-xl font-black text-[#af101a] flex items-center gap-2 tracking-tight hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[28px] fill" data-weight="fill">
                hub
              </span>
              Smart Disaster Management System
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded font-medium text-sm transition-all ${
                  activeTab === 'home'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setActiveTab('active-alerts')}
                className={`px-3 py-1.5 rounded font-medium text-sm transition-all ${
                  activeTab === 'active-alerts'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Active Alerts
              </button>

              <button
                onClick={() => setActiveTab('kerala-map')}
                className={`px-3 py-1.5 rounded font-bold text-sm transition-all flex items-center gap-1.5 ${
                  activeTab === 'kerala-map'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] bg-[#ffdad6]/40'
                    : 'text-[#005f7b] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#af101a]">map</span>
                Kerala Map
                <span className="bg-[#af101a] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setActiveTab('report-disaster')}
                  className={`px-3 py-1.5 rounded font-medium text-sm transition-all flex items-center gap-1.5 ${
                    activeTab === 'report-disaster'
                      ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                      : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                  }`}
                  title="Official Disaster Incident Reporting"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#af101a]">campaign</span>
                  Report Disaster
                </button>
              )}

              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-3 py-1.5 rounded font-medium text-sm transition-all ${
                  activeTab === 'volunteer'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Volunteer
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 ml-auto">
            {/* Quick SOS Trigger Button in Navbar */}
            <button
              onClick={onTriggerSos}
              className="bg-[#af101a] hover:bg-red-700 text-white font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
              title="Fast SOS Emergency Beacon"
            >
              <span className="material-symbols-outlined text-[16px] text-yellow-300">e911_emergency</span>
              <span className="font-extrabold tracking-wide">SOS</span>
            </button>

            {/* Notification Bell Icon */}
            <button
              onClick={() => setActiveTab('active-alerts')}
              className="p-2 text-gray-700 hover:text-[#af101a] hover:bg-gray-100 rounded-full transition-all relative"
              title="Live Alerts & Notifications"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            </button>

            {/* Community/Volunteers Icon */}
            <button
              onClick={() => setActiveTab('volunteer')}
              className="p-2 text-gray-700 hover:text-[#af101a] hover:bg-gray-100 rounded-full transition-all"
              title="Volunteers & Community Network"
            >
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </button>

            {/* User Profile Avatar / Sign Up Sign In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all text-left"
                  title={`Logged in as ${currentUser.fullName} (${currentUser.role}) - Click to manage`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#af101a] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[110px]">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-[#af101a] font-bold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  className="bg-white hover:bg-[#ffdad6]/40 text-[#af101a] border border-[#af101a] text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-xs"
                  title="Sign Out and switch account"
                >
                  <span className="material-symbols-outlined text-[15px]">logout</span>
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-white text-[#af101a] hover:bg-[#ffdad6]/40 px-3.5 py-1.5 font-bold text-sm transition-colors border border-[#af101a] rounded flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

