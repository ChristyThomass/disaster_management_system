import React, { useState, useRef, useEffect } from 'react';
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
  onOpenProfileSettings?: (tab: 'edit-profile' | 'photo' | 'settings') => void;
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
  onOpenProfileSettings,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50 bg-white shadow-md">
      {/* Live Alerts Ticker */}
      <div className="bg-[#af101a] text-white py-1 px-4 md:px-6 border-b border-[#d32f2f] relative overflow-hidden h-10 flex items-center">
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
        <div className="flex justify-between items-center w-full px-3 md:px-4 lg:px-6 max-w-[1440px] mx-auto h-16">
          <div className="flex items-center gap-2 md:gap-4 lg:gap-10 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="text-lg md:text-xl font-black text-[#af101a] flex items-center gap-2 tracking-tight hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[28px] fill shrink-0" data-weight="fill">
                hub
              </span>
              <span className="hidden lg:inline">Smart Disaster Management System</span>
              <span className="hidden md:inline lg:hidden">Disaster System</span>
              <span className="inline md:hidden">SDMS</span>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-3 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-2 lg:px-3 py-1.5 rounded font-medium text-xs lg:text-sm transition-all ${
                  activeTab === 'home'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setActiveTab('active-alerts')}
                className={`px-2 lg:px-3 py-1.5 rounded font-medium text-xs lg:text-sm transition-all ${
                  activeTab === 'active-alerts'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Active Alerts
              </button>

              <button
                onClick={() => setActiveTab('kerala-map')}
                className={`px-2 lg:px-3 py-1.5 rounded font-bold text-xs lg:text-sm transition-all flex items-center gap-1 lg:gap-1.5 ${
                  activeTab === 'kerala-map'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] bg-[#ffdad6]/40'
                    : 'text-[#005f7b] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] lg:text-[18px] text-[#af101a]">map</span>
                Kerala Map
                <span className="bg-[#af101a] text-white text-[9px] lg:text-[10px] font-extrabold px-1 lg:px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setActiveTab('report-disaster')}
                  className={`px-2 lg:px-3 py-1.5 rounded font-medium text-xs lg:text-sm transition-all flex items-center gap-1 lg:gap-1.5 ${
                    activeTab === 'report-disaster'
                      ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                      : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                  }`}
                  title="Official Disaster Incident Reporting"
                >
                  <span className="material-symbols-outlined text-[16px] lg:text-[17px] text-[#af101a]">campaign</span>
                  Report Disaster
                </button>
              )}

              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-2 lg:px-3 py-1.5 rounded font-medium text-xs lg:text-sm transition-all ${
                  activeTab === 'volunteer'
                    ? 'text-[#af101a] border-b-2 border-[#af101a] font-bold bg-[#f9f9f9]'
                    : 'text-[#5b403d] hover:text-[#af101a] hover:bg-gray-100'
                }`}
              >
                Volunteer
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 ml-auto shrink-0">
            {/* Notification Bell Icon */}
            <button
              onClick={() => setActiveTab('active-alerts')}
              className="p-1.5 md:p-2 text-gray-700 hover:text-[#af101a] hover:bg-gray-100 rounded-full transition-all relative shrink-0"
              title="Live Alerts & Notifications"
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-600 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-600" />
            </button>

            {/* Community/Volunteers Icon */}
            <button
              onClick={() => setActiveTab('volunteer')}
              className="p-1.5 md:p-2 text-gray-700 hover:text-[#af101a] hover:bg-gray-100 rounded-full transition-all shrink-0"
              title="Volunteers & Community Network"
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">groups</span>
            </button>

            {/* User Profile Avatar / Sign Up Sign In Button */}
            {currentUser ? (
              <div className="relative flex items-center shrink-0" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all text-left whitespace-nowrap"
                  title={`Logged in as ${currentUser?.fullName}`}
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#af101a] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                    {currentUser?.photoUrl ? (
                      <img 
                        src={`${currentUser.photoUrl}${currentUser.photoUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`} 
                        alt={currentUser.fullName} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[110px]">
                      {currentUser?.fullName}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-500 text-[18px]">
                    arrow_drop_down
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                      <span className="block text-xs font-bold text-gray-800 truncate">
                        {currentUser?.fullName}
                      </span>
                    </div>
                    
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#af101a] flex items-center gap-2 transition-colors"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenProfileSettings) onOpenProfileSettings('edit-profile');
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Edit Profile
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#af101a] flex items-center gap-2 transition-colors"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenProfileSettings) onOpenProfileSettings('photo');
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      Profile Photo
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#af101a] flex items-center gap-2 transition-colors"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onOpenProfileSettings) onOpenProfileSettings('settings');
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Settings
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-[#af101a] hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-white text-[#af101a] hover:bg-[#ffdad6]/40 px-2 py-1.5 md:px-3.5 md:py-1.5 font-bold text-xs md:text-sm transition-colors border border-[#af101a] rounded flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">login</span>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

