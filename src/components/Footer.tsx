import React from 'react';
import { NavigationTab, UserProfile } from '../types';

interface FooterProps {
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  onOpenLoginModal?: () => void;
  currentUser?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenLoginModal, 
  currentUser,
}) => {
  return (
    <footer className="bg-[#1c1d1f] text-gray-400 w-full mt-auto border-t-2 border-[#af101a]">
      <div className="w-full py-6 px-6 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6">
          <div className="text-lg font-black text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[24px] fill" data-weight="fill">
              hub
            </span>
            SDMS Kerala
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">
              Control Room Active • 24/7
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <a href="tel:1077" className="text-xs font-bold text-[#10b981] flex items-center gap-1 hover:brightness-110">
              <span className="material-symbols-outlined text-[16px]">call</span> 1077
            </a>
            <a href="tel:112" className="text-xs font-bold text-[#ef4444] flex items-center gap-1 hover:brightness-110">
              <span className="material-symbols-outlined text-[16px]">emergency</span> 112
            </a>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">
            © 2026 SDMS Authority Kerala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
