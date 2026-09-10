import React, { useState } from 'react';
import { AlertItem, KERALA_DISTRICTS } from '../types';

interface ActiveAlertsViewProps {
  alerts: AlertItem[];
  onOpenIssueAlertModal?: () => void;
  isAdmin?: boolean;
}

export const ActiveAlertsView: React.FC<ActiveAlertsViewProps> = ({
  alerts,
  onOpenIssueAlertModal,
  isAdmin = false,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // STRICT KERALA FILTER FUNCTION
  // Ensures ONLY alerts explicitly related to Kerala or Kerala districts are returned,
  // and completely excludes alerts belonging to other states.
  const isKeralaStrictAlert = (a: AlertItem) => {
    const combinedText = `${a.title} ${a.description || ''} ${a.region} ${a.state || ''}`.toLowerCase();

    // Explicitly reject any alert that belongs to non-Kerala states
    const nonKeralaStates = [
      'tamil nadu', 'karnataka', 'maharashtra', 'andhra pradesh', 'telangana',
      'odisha', 'west bengal', 'assam', 'bihar', 'gujarat', 'rajasthan',
      'uttar pradesh', 'delhi', 'chennai', 'bengaluru', 'mumbai', 'hyderabad',
      'pune', 'kolkata', 'goa'
    ];
    
    // If it contains a non-Kerala state and does NOT mention Kerala, exclude it
    const mentionsNonKeralaState = nonKeralaStates.some(
      (st) => combinedText.includes(st) && !combinedText.includes('kerala')
    );
    if (mentionsNonKeralaState) return false;

    // Accept if state is Kerala or mentions Kerala/Kerala districts
    if (a.state && a.state.toLowerCase() === 'kerala') return true;

    const keralaKeywords = [
      'kerala', 'wayanad', 'idukki', 'ernakulam', 'thrissur', 'alappuzha',
      'kozhikode', 'thiruvananthapuram', 'trivandrum', 'malappuram', 'pathanamthitta',
      'palakkad', 'kottayam', 'kollam', 'kannur', 'kasaragod', 'chooralmala',
      'meppadi', 'munnar', 'aluva', 'chalakudy', 'kuttanad', 'ksdma', 'periyar',
      'pamba', 'kabini', 'kl-alt'
    ];
    return keralaKeywords.some((kw) => combinedText.includes(kw));
  };

  // Filter pipeline
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Strict Kerala State Check
    if (!isKeralaStrictAlert(alert)) return false;

    // 2. Severity Filter
    if (severityFilter === 'Code Red' && alert.severity !== 'code-red') return false;
    if (severityFilter === 'Warning' && alert.severity !== 'warning') return false;
    if (severityFilter === 'Info' && alert.severity !== 'info') return false;

    // 3. District Filter
    if (selectedDistrict !== 'All') {
      const matchDistrict = alert.region.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        (alert.description || '').toLowerCase().includes(selectedDistrict.toLowerCase());
      if (!matchDistrict) return false;
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery = alert.title.toLowerCase().includes(q) ||
        alert.region.toLowerCase().includes(q) ||
        (alert.description || '').toLowerCase().includes(q) ||
        (alert.agency || '').toLowerCase().includes(q);
      if (!matchQuery) return false;
    }

    return true;
  });

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6 font-sans">
      
      {/* PAGE TITLE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e4beba] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#af101a]/20">
              KERALA EMERGENCY BULLETIN
            </span>
            <span className="text-xs text-gray-500 font-mono">Updated {lastRefreshedTime}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Kerala Emergency Alerts & Advisories
          </h1>
          <p className="text-xs md:text-sm text-[#5b403d] mt-1">
            Live disaster warnings, weather bulletins, and emergency alerts synchronized across Kerala districts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 transition-all flex items-center gap-1.5"
            title="Refresh Feed"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            {isRefreshing ? 'Syncing...' : 'Refresh Feed'}
          </button>

          {isAdmin && onOpenIssueAlertModal && (
            <button
              onClick={onOpenIssueAlertModal}
              className="bg-[#af101a] hover:bg-[#d32f2f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_alert</span>
              Issue Alert
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROL TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-[#e4beba] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
          {['All', 'Code Red', 'Warning', 'Info'].map((sev) => {
            const isActive = severityFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#af101a] text-white shadow-2xs'
                    : 'bg-gray-100 text-[#5b403d] hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {sev === 'All' ? 'All Severities' : sev}
              </button>
            );
          })}
        </div>

        {/* District Selector & Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-gray-500 text-[18px] pointer-events-none">
              location_on
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#af101a]/20 cursor-pointer"
            >
              <option value="All">All Kerala Districts</option>
              {KERALA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-gray-400 text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search Kerala alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-2 focus:ring-[#af101a]/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ALERT FEED CONTAINER */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-gray-400">check_circle</span>
          <h3 className="text-lg font-extrabold text-gray-800">No Active Emergency Alerts Match Filter</h3>
          <p className="text-xs text-gray-500 max-w-md">
            No active disaster warnings or advisories match your selected district/severity criteria for Kerala.
          </p>
          <button
            onClick={() => {
              setSeverityFilter('All');
              setSelectedDistrict('All');
              setSearchQuery('');
            }}
            className="mt-2 text-xs text-[#af101a] font-bold underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredAlerts.map((alert) => {
            const isCodeRed = alert.severity === 'code-red';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl bg-white border-2 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md transition-all ${
                  isCodeRed
                    ? 'border-[#af101a] bg-gradient-to-br from-red-50/50 to-white'
                    : isWarning
                    ? 'border-amber-500 bg-gradient-to-br from-amber-50/40 to-white'
                    : 'border-blue-300 bg-white'
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Top Agency & Severity Badge Header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-extrabold text-[#005f7b] bg-[#e9f7ff] border border-[#005f7b]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      {alert.agency || 'Disaster Control / KSDMA'}
                    </span>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isCodeRed
                          ? 'bg-[#af101a] text-white animate-pulse'
                          : isWarning
                          ? 'bg-amber-500 text-gray-950 font-bold'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isCodeRed ? '🚨 CODE RED' : isWarning ? '⚠️ WARNING' : 'ℹ️ ADVISORY'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-[#1a1c1c] leading-snug">
                    {alert.title}
                  </h3>

                  {/* Location Tag */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#af101a] bg-[#af101a]/5 px-2.5 py-1 rounded-lg border border-[#af101a]/15 w-fit">
                    <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                    <span>{alert.region} (Kerala)</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#5b403d] leading-relaxed mt-1">
                    {alert.description}
                  </p>

                  {/* Recommended Safety Actions (if available) */}
                  {alert.recommendedActions && alert.recommendedActions.length > 0 && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 block mb-1">
                        🛡️ Recommended Safety Actions:
                      </span>
                      <ul className="space-y-1">
                        {alert.recommendedActions.map((act, i) => (
                          <li key={i} className="text-[11px] text-gray-800 flex items-start gap-1">
                            <span className="text-[#af101a] font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs font-semibold text-gray-600">
                  <span className="font-mono text-[11px] text-gray-500">{alert.timeAgo}</span>
                  <a
                    href={alert.sourceUrl || 'https://sdma.kerala.gov.in/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#af101a] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Source: Official Bulletin</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KERALA EMERGENCY TOLL-FREE CONTACTS BAR */}
      <div className="bg-white p-5 rounded-2xl border border-[#e4beba] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#1a1c1c] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#af101a]">phone_in_talk</span>
            Kerala State Emergency Control Rooms & Helplines
          </h3>
          <p className="text-xs text-[#5b403d] mt-0.5">
            Free 24/7 emergency dispatch helpline numbers for all 14 districts in Kerala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="tel:1077"
            className="bg-[#af101a] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>District Control Room:</span> <strong>1077</strong>
          </a>
          <a
            href="tel:1070"
            className="bg-[#005f7b] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>State SDMA Control:</span> <strong>1070</strong>
          </a>
          <a
            href="tel:112"
            className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            <span>National Emergency:</span> <strong>112</strong>
          </a>
        </div>
      </div>
    </main>
  );
};

