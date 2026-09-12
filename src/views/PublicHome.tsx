import React from 'react';
import { NavigationTab, UserProfile } from '../types';

interface PublicHomeProps {
  setActiveTab: (tab: NavigationTab) => void;
  onOpenHelpModal: () => void;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  setActiveTab,
  onOpenHelpModal,
  currentUser,
  onOpenLoginModal,
}) => {
  const heroBgImage =
    'https://images.unsplash.com/photo-1596277028974-958a8a47de02?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col gap-8 md:gap-10">
      {/* Hero Section */}
      <section className="relative w-full rounded-xl overflow-hidden shadow-sm border border-[#e4beba] bg-white min-h-[520px] lg:h-[580px] flex items-center">
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full opacity-90"
            style={{ backgroundImage: `url('${heroBgImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f9f9f9] via-[#f9f9f9]/85 to-transparent" />
        </div>

        <div className="relative z-10 w-full md:w-3/5 lg:w-1/2 p-6 md:p-12 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-3 py-1 rounded-full text-xs font-semibold w-fit border border-[#af101a]/20">
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            Live Monitoring Active
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-[48px] font-extrabold text-[#1a1c1c] leading-tight tracking-tight">
            Rapid Response.<br />Resilient Communities.
          </h1>

          <p className="text-base md:text-lg text-[#5b403d] max-w-md">
            Coordinating real-time disaster intelligence to empower first responders and protect vulnerable populations when seconds matter most.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => setActiveTab('kerala-map')}
              className="bg-[#af101a] text-white px-6 py-3 font-semibold text-sm rounded shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 border border-[#af101a]"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              Kerala Live Relief Map
            </button>

            {currentUser ? (
              <button
                onClick={() => setActiveTab('report-disaster')}
                className="bg-white text-[#af101a] border-2 border-[#af101a] px-5 py-3 font-semibold text-sm rounded hover:bg-[#ffdad6]/30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                Report a Disaster
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-white text-[#5b403d] border border-gray-300 px-5 py-3 font-semibold text-sm rounded hover:border-[#af101a] hover:text-[#af101a] transition-all flex items-center justify-center gap-2 group"
                title="Sign in to submit verified disaster incident reports"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-500 group-hover:text-[#af101a]">lock</span>
                Sign In to Report Incident
              </button>
            )}

            <button
              onClick={onOpenHelpModal}
              className="bg-white text-[#4c56af] border-2 border-[#4c56af] px-5 py-3 font-semibold text-sm rounded hover:bg-[#959efd]/20 hover:text-[#27308a] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">live_help</span>
              Request Help
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => setActiveTab('kerala-map')}
          className="bg-white border-2 border-[#af101a] p-6 rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-[#af101a] text-[32px] group-hover:scale-110 transition-transform">
                map
              </span>
              <span className="bg-[#af101a] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse">
                Live Kerala Map
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1a1c1c] mt-3">15+ Relief Camps</h3>
            <p className="text-xs text-[#5b403d] mt-1">
              Real-time shelters & disaster posts across Wayanad, Ernakulam, Thrissur, Alappuzha & Idukki.
            </p>
          </div>
          <span className="text-xs font-bold text-[#af101a] flex items-center gap-1 mt-3">
            Open Map View →
          </span>
        </div>

        <div className="bg-white border border-[#e4beba] p-6 rounded-xl shadow-sm flex flex-col gap-2 border-t-4 border-t-[#ba1a1a]">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[32px]">warning</span>
            <span className="bg-[#ffdad6] text-[#93000a] text-xs px-2 py-1 rounded font-semibold">Live</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mt-2">12</h3>
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Active Alerts</p>
        </div>

        {currentUser && (
          <div className="bg-white border border-[#e4beba] p-6 rounded-xl shadow-sm flex flex-col gap-2 border-t-4 border-t-[#4c56af]">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-[#4c56af] text-[32px]">group</span>
              <span className="bg-[#959efd]/30 text-[#27308a] text-xs px-2 py-1 rounded font-semibold">Last 24h</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mt-2">1,248</h3>
            <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Volunteers Mobilized</p>
          </div>
        )}

        <div className="bg-white border border-[#e4beba] p-6 rounded-xl shadow-sm flex flex-col gap-2 border-t-4 border-t-[#005f7b]">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#005f7b] text-[32px]">inventory_2</span>
            <span className="bg-[#e9f7ff] text-[#004d65] text-xs px-2 py-1 rounded font-semibold">Verified</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mt-2">8.5k</h3>
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Resources Distributed</p>
        </div>
      </section>

      {/* Volunteering Information Section */}
      <section className="bg-[#f0f4f8] rounded-xl border border-[#d1d9e0] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#4c56af] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[32px]">volunteer_activism</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#1a1c1c] mb-2">Join the Volunteer Network</h3>
          <p className="text-sm text-[#5b403d] leading-relaxed">
            Our community depends on the selfless contribution of volunteers like you. Whether it's field rescue, logistics coordination, or remote data entry, your skills can save lives.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={() => {
              if (currentUser) {
                setActiveTab('volunteer');
              } else if (onOpenLoginModal) {
                onOpenLoginModal();
              } else {
                setActiveTab('volunteer');
              }
            }}
            className="w-full md:w-auto bg-[#4c56af] hover:bg-[#27308a] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Register Volunteer
          </button>
        </div>
      </section>
    </main>
  );
};
