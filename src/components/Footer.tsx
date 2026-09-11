import React from 'react';
import { NavigationTab, UserProfile } from '../types';

interface FooterProps {
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  onOpenLoginModal?: () => void;
  currentUser?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, onOpenLoginModal, currentUser }) => {
  const isAdmin = currentUser?.role === 'Administrator' || currentUser?.role === 'Admin' || currentUser?.role === 'System Administrator';

  return (
    <footer className="bg-[#1c1d1f] text-gray-300 w-full mt-auto border-t-4 border-[#af101a]">
      <div className="w-full py-12 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[32px] fill" data-weight="fill">
              hub
            </span>
            Smart Disaster Management System
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Statewide disaster response, emergency shelter tracking, and rapid resource logistics network for Kerala.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs font-semibold text-gray-300">
              State Control Room Signal Active • 24/7 Monitored
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            © 2026 Smart Disaster Management System Authority.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 lg:gap-16">
          {/* Quick Nav */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            <h4 className="font-bold text-xs text-gray-100 uppercase tracking-wider mb-1">
              Public Portal
            </h4>
            <button
              onClick={() => setActiveTab?.('home')}
              className="text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home Overview
            </button>
            <button
              onClick={() => setActiveTab?.('kerala-map')}
              className="text-left text-sm text-gray-400 hover:text-white transition-colors font-semibold flex items-center gap-1 text-[#af101a]"
            >
              📍 Kerala Live Relief Map
            </button>
            <button
              onClick={() => setActiveTab?.('active-alerts')}
              className="text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              Active Crisis Alerts
            </button>
            <button
              onClick={() => setActiveTab?.('report-disaster')}
              className="text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              Report Incident / Emergency
            </button>
            <button
              onClick={() => setActiveTab?.('volunteer')}
              className="text-left text-sm text-gray-400 hover:text-white transition-colors"
            >
              Volunteer Enrollment
            </button>
          </div>

          {/* Legal & Helpline */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            <h4 className="font-bold text-xs text-gray-100 uppercase tracking-wider mb-1">
              Helplines & Legal
            </h4>
            <a href="tel:1077" className="text-sm font-bold text-[#10b981] hover:underline">
              📞 Collectorate: 1077
            </a>
            <a href="tel:112" className="text-sm font-bold text-[#ef4444] hover:underline">
              🚨 Emergency: 112
            </a>
            <a href="#privacy" className="text-xs text-gray-400 hover:text-white transition-colors mt-2">
              Privacy & Data Policy
            </a>
            <a href="#terms" className="text-xs text-gray-400 hover:text-white transition-colors">
              Terms of Emergency Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

