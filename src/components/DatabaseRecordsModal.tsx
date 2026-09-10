import React, { useState } from 'react';
import {
  DisasterReport,
  SosAlert,
  HelpRequest,
  Volunteer,
  ReliefLocation,
  InventoryItem,
} from '../types';
import {
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  runDatabaseHealthCheck,
  uploadMediaToSupabase,
  deleteDisasterReportFromSupabase,
} from '../lib/supabase';

interface DatabaseRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DisasterReport[];
  sosAlerts?: SosAlert[];
  helpRequests?: HelpRequest[];
  volunteers?: Volunteer[];
  reliefCamps?: ReliefLocation[];
  inventory?: InventoryItem[];
  onReviewReport?: (report: DisasterReport) => void;
  onOpenYoloInspector?: (report: DisasterReport) => void;
  onDeleteReport?: (reportId: string) => void;
  onRefreshFromSupabase?: () => Promise<void>;
}

type ActiveTab =
  | 'disaster_reports'
  | 'sos_alerts'
  | 'help_requests'
  | 'volunteers'
  | 'relief_camps'
  | 'inventory'
  | 'diagnostics';

export const DatabaseRecordsModal: React.FC<DatabaseRecordsModalProps> = ({
  isOpen,
  onClose,
  reports,
  sosAlerts = [],
  helpRequests = [],
  volunteers = [],
  reliefCamps = [],
  inventory = [],
  onReviewReport,
  onOpenYoloInspector,
  onDeleteReport,
  onRefreshFromSupabase,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('disaster_reports');
  const [filterWithMediaOnly, setFilterWithMediaOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<string | null>(null);

  // Diagnostics state
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);

  // Test Image Upload state
  const [testUploading, setTestUploading] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState<{
    success: boolean;
    url?: string;
    storageType?: string;
    error?: string;
  } | null>(null);

  const [selectedMediaPreview, setSelectedMediaPreview] = useState<{
    type: 'image' | 'video';
    url: string;
    title: string;
    location: string;
    reportId?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    if (!onRefreshFromSupabase) return;
    setIsRefreshing(true);
    try {
      await onRefreshFromSupabase();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleRunHealthCheck = async () => {
    setHealthLoading(true);
    try {
      const res = await runDatabaseHealthCheck();
      setHealthResult(res);
    } catch (e: any) {
      setHealthResult({ connected: false, error: e?.message });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestUploading(true);
    setTestUploadResult(null);
    try {
      const res = await uploadMediaToSupabase(file, 'images', `test_diagnostic_${Date.now()}`);
      if (res.url) {
        setTestUploadResult({
          success: true,
          url: res.url,
          storageType: res.storageType,
        });
      } else {
        setTestUploadResult({
          success: false,
          error: res.error || 'Failed to upload test image',
        });
      }
    } catch (err: any) {
      setTestUploadResult({
        success: false,
        error: err?.message || 'Upload exception',
      });
    } finally {
      setTestUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(id);
    setTimeout(() => setCopiedUrlIndex(null), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleExportJson = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      supabaseUrl: SUPABASE_URL,
      disasterReports: reports,
      sosAlerts,
      helpRequests,
      volunteers,
      reliefCamps,
      inventory,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resilience_disaster_database_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesMedia = filterWithMediaOnly ? !!(r.imageUrl || r.videoUrl) : true;
    const matchesSearch =
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMedia && matchesSearch;
  });

  const reportsWithImages = reports.filter((r) => !!r.imageUrl);
  const reportsWithVideos = reports.filter((r) => !!r.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200 shrink-0">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  Supabase Disaster Database Hub
                </h3>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Connected to <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[#005f7b] font-bold">{SUPABASE_URL}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {onRefreshFromSupabase && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors border border-gray-300 disabled:opacity-50"
                title="Fetch latest updates from Supabase"
              >
                <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                {isRefreshing ? 'Refreshing...' : 'Refresh DB'}
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJson}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors border border-gray-300"
              title="Export database snapshot as JSON"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export JSON
            </button>

            <a
              href="https://supabase.com/dashboard/project/auazpiwbvsbzrccsqnyf/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Supabase Dashboard
            </a>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 py-2.5 border-b border-gray-100 bg-gray-50/70 -mx-4 px-4 sm:-mx-6 sm:px-6 text-xs">
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold block">Incident Reports</span>
            <span className="text-base font-black text-gray-900">{reports.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">photo_camera</span>
              Photo Evidence
            </span>
            <span className="text-base font-black text-emerald-700">{reportsWithImages.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-red-200">
            <span className="text-[10px] text-red-700 font-bold block flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">videocam</span>
              Video Clips
            </span>
            <span className="text-base font-black text-red-700">{reportsWithVideos.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-purple-200">
            <span className="text-[10px] text-purple-700 font-bold block flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">emergency</span>
              SOS Beacons
            </span>
            <span className="text-base font-black text-purple-700">{sosAlerts.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-blue-200">
            <span className="text-[10px] text-blue-700 font-bold block flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">handshake</span>
              Help Requests
            </span>
            <span className="text-base font-black text-blue-700">{helpRequests.length}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-700 font-bold block flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">cabin</span>
              Relief Camps
            </span>
            <span className="text-base font-black text-amber-700">{reliefCamps.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mt-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('disaster_reports')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'disaster_reports'
                ? 'bg-[#af101a] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">report_problem</span>
            Disaster Reports ({reports.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sos_alerts')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'sos_alerts'
                ? 'bg-red-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sos</span>
            SOS Beacons ({sosAlerts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('help_requests')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'help_requests'
                ? 'bg-[#005f7b] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
            Help Requests ({helpRequests.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relief_camps')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'relief_camps'
                ? 'bg-emerald-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cabin</span>
            Relief Camps ({reliefCamps.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('volunteers')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'volunteers'
                ? 'bg-indigo-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            Volunteers ({volunteers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-amber-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            Inventory ({inventory.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-t-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ml-auto ${
              activeTab === 'diagnostics'
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100 bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
            Storage & DB Diagnostics
          </button>
        </div>

        {/* TAB 1: DISASTER REPORTS TABLE */}
        {activeTab === 'disaster_reports' && (
          <div className="flex-1 flex flex-col min-h-0 pt-2">
            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search reports by disaster type, location, reporter name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#af101a]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterWithMediaOnly(!filterWithMediaOnly)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all ${
                    filterWithMediaOnly
                      ? 'bg-[#af101a] text-white border-[#af101a]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">perm_media</span>
                  {filterWithMediaOnly ? 'Showing Photo/Video Only' : 'Filter: Has Media'}
                </button>
              </div>
            </div>

            {/* Reports Table */}
            <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Report ID / Time</th>
                    <th className="py-2.5 px-3">Disaster Type</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Visual Image Evidence</th>
                    <th className="py-2.5 px-3">Video Clip</th>
                    <th className="py-2.5 px-3">Severity / Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                        No disaster records found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
                      const isStorageUrl = report.imageUrl?.startsWith('http');
                      const isDataUrl = report.imageUrl?.startsWith('data:');

                      return (
                        <tr key={report.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            <div className="font-bold text-gray-800">{report.id}</div>
                            <div className="text-[10px] text-gray-400">{report.timeLogged}</div>
                          </td>

                          <td className="py-2.5 px-3 font-bold text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-[#af101a]">
                                {report.iconName || 'report'}
                              </span>
                              {report.type}
                            </div>
                            <div className="text-[10px] text-gray-500 font-normal truncate max-w-[150px]">
                              {report.reporterName || 'Anonymous'}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-gray-700 font-medium">
                            {report.location}
                          </td>

                          {/* UPLOADED IMAGE CELL */}
                          <td className="py-2.5 px-3">
                            {report.imageUrl ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMediaPreview({
                                      type: 'image',
                                      url: report.imageUrl!,
                                      title: `${report.type} - Incident Visual Evidence`,
                                      location: report.location,
                                      reportId: report.id,
                                    })
                                  }
                                  className="relative group rounded-md overflow-hidden border border-gray-300 shadow-2xs hover:border-[#af101a] transition-all shrink-0 cursor-pointer"
                                  title="Click to view full size"
                                >
                                  <img
                                    src={report.imageUrl}
                                    alt="Evidence proof"
                                    className="w-12 h-12 object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                                  </div>
                                </button>
                                <div className="text-[10px] text-gray-600">
                                  <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                                    {isStorageUrl ? 'Supabase Storage' : isDataUrl ? 'DB Data Stream' : 'Online Image'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUrl(report.imageUrl!, report.id)}
                                    className="text-[9px] text-[#005f7b] hover:underline font-mono block mt-0.5"
                                  >
                                    {copiedUrlIndex === report.id ? '✓ Copied URL!' : 'Copy Image URL'}
                                  </button>
                                </div>
                              </div>
                            ) : report.hasVisualEvidence ? (
                              <div className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                Verified Evidence
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs italic">No image</span>
                            )}
                          </td>

                          {/* UPLOADED VIDEO CELL */}
                          <td className="py-2.5 px-3">
                            {report.videoUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedMediaPreview({
                                    type: 'video',
                                    url: report.videoUrl!,
                                    title: `${report.type} - Video Evidence`,
                                    location: report.location,
                                    reportId: report.id,
                                  })
                                }
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#af101a] border border-red-200 rounded-lg text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">
                                  play_circle
                                </span>
                                Play Clip
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">No video</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                report.severity === 'Critical'
                                  ? 'bg-red-50 text-red-700 border-red-200 font-extrabold'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {report.severity || 'Normal'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {report.imageUrl && onOpenYoloInspector && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenYoloInspector(report);
                                  }}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
                                  title="Analyze Image with AI Disaster Vision"
                                >
                                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                                  AI Vision
                                </button>
                              )}
                              {onReviewReport && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onReviewReport(report);
                                  }}
                                  className="bg-[#4c56af] hover:bg-[#3b438c] text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                                >
                                  Review
                                </button>
                              )}
                              {onDeleteReport && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`Delete record ${report.id} from database?`)) {
                                      await deleteDisasterReportFromSupabase(report.id);
                                      onDeleteReport(report.id);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Delete record from Supabase table"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SOS ALERTS */}
        {activeTab === 'sos_alerts' && (
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">SOS ID</th>
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">GPS Coordinates</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sosAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                      No active SOS emergency beacons in database table <code className="font-mono">sos_alerts</code>.
                    </td>
                  </tr>
                ) : (
                  sosAlerts.map((sos) => (
                    <tr key={sos.id} className="hover:bg-red-50/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">{sos.id}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{sos.full_name || 'Citizen'}</td>
                      <td className="py-2.5 px-3 text-gray-700 font-mono">{sos.phone || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-red-700 font-mono font-bold">
                        {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-800">{sos.message}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {sos.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 font-mono text-[10px]">
                        {sos.created_at ? new Date(sos.created_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: HELP REQUESTS */}
        {activeTab === 'help_requests' && (
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Requester</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Urgent Need</th>
                  <th className="py-2.5 px-3">People Count</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {helpRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                      No citizen help requests in database table <code className="font-mono">help_requests</code>.
                    </td>
                  </tr>
                ) : (
                  helpRequests.map((h) => (
                    <tr key={h.id} className="hover:bg-blue-50/30">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{h.requesterName}</td>
                      <td className="py-2.5 px-3 text-[#005f7b] font-semibold">{h.category}</td>
                      <td className="py-2.5 px-3 text-gray-700">{h.location}</td>
                      <td className="py-2.5 px-3 text-gray-900 font-medium">{h.urgentNeed}</td>
                      <td className="py-2.5 px-3 font-bold">{h.peopleCount} people</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: RELIEF CAMPS */}
        {activeTab === 'relief_camps' && (
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Camp Name</th>
                  <th className="py-2.5 px-3">District / Address</th>
                  <th className="py-2.5 px-3">Capacity & Occupancy</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Supplies Needed</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reliefCamps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                      No relief camps logged in table <code className="font-mono">relief_camps</code>.
                    </td>
                  </tr>
                ) : (
                  reliefCamps.map((camp) => (
                    <tr key={camp.id} className="hover:bg-emerald-50/30">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{camp.name}</td>
                      <td className="py-2.5 px-3 text-gray-700">
                        {camp.district} - {camp.address}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {camp.occupancy} / {camp.capacity} beds (
                        {Math.round((camp.occupancy / camp.capacity) * 100)}%)
                      </td>
                      <td className="py-2.5 px-3 text-gray-800">
                        {camp.contactPerson} ({camp.phone})
                      </td>
                      <td className="py-2.5 px-3 text-xs text-red-700 font-semibold">
                        {camp.suppliesNeeded?.slice(0, 3).join(', ') || 'Fully stocked'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: VOLUNTEERS */}
        {activeTab === 'volunteers' && (
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Volunteer Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Skills</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                      No volunteers in database table <code className="font-mono">volunteers</code>.
                    </td>
                  </tr>
                ) : (
                  volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-indigo-50/30">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{vol.name}</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-semibold">{vol.role}</td>
                      <td className="py-2.5 px-3 text-gray-700">{vol.location}</td>
                      <td className="py-2.5 px-3 text-gray-600">{vol.skills?.join(', ') || 'General'}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{vol.contact}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {vol.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200 min-h-0 bg-white mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Warehouse Location</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                      No resource inventory items in table <code className="font-mono">inventory</code>.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/30">
                      <td className="py-2.5 px-3 font-bold text-gray-900">{item.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{item.category}</td>
                      <td className="py-2.5 px-3 font-bold font-mono">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">{item.location}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 7: DIAGNOSTICS & SETUP HUB */}
        {activeTab === 'diagnostics' && (
          <div className="flex-1 overflow-auto min-h-0 pt-2 space-y-4 text-xs">
            {/* Health check & image test actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test Image Storage Uploader */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">cloud_upload</span>
                    Test Supabase Image Storage Upload
                  </h4>
                  <p className="text-gray-600 text-xs mb-3">
                    Upload an image file directly to verify that Supabase Storage bucket <code>disaster-evidence</code> and database tables are accepting media seamlessly.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                    {testUploading ? 'Uploading to Supabase...' : 'Select & Upload Test Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTestImageUpload}
                      disabled={testUploading}
                      className="hidden"
                    />
                  </label>

                  {testUploadResult && (
                    <div
                      className={`p-3 rounded-lg border ${
                        testUploadResult.success
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-red-50 border-red-300 text-red-950'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          {testUploadResult.success ? 'check_circle' : 'error'}
                        </span>
                        {testUploadResult.success ? 'Upload Succeeded!' : 'Upload Note'}
                      </div>
                      {testUploadResult.storageType && (
                        <p className="text-[11px] mt-1">
                          Storage Delivery:{' '}
                          <span className="font-bold uppercase font-mono">{testUploadResult.storageType}</span>
                        </p>
                      )}
                      {testUploadResult.url && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={testUploadResult.url}
                            alt="Test Upload Result"
                            className="w-12 h-12 object-cover rounded border border-gray-300"
                          />
                          <div className="truncate flex-1 font-mono text-[10px] text-gray-600">
                            {testUploadResult.url.slice(0, 50)}...
                          </div>
                        </div>
                      )}
                      {testUploadResult.error && (
                        <p className="text-[11px] text-red-700 mt-1 font-mono">{testUploadResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Run Database Health Check */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-[#005f7b]">network_check</span>
                    Live Table & Storage Health Check
                  </h4>
                  <p className="text-gray-600 text-xs mb-3">
                    Pings all 8 application tables (<code>disaster_reports</code>, <code>sos_alerts</code>, etc.) and inspects Supabase Storage permissions.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleRunHealthCheck}
                    disabled={healthLoading}
                    className="w-full bg-[#005f7b] hover:bg-[#004d65] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${healthLoading ? 'animate-spin' : ''}`}>
                      sync
                    </span>
                    {healthLoading ? 'Pinging Tables...' : 'Run Database Diagnostics'}
                  </button>

                  {healthResult && (
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-xs space-y-1.5 max-h-36 overflow-auto font-mono">
                      <div className="font-bold flex items-center justify-between text-gray-900">
                        <span>Database Connectivity:</span>
                        <span className={healthResult.connected ? 'text-emerald-700 font-bold' : 'text-red-700'}>
                          {healthResult.connected ? 'ONLINE ✅' : 'FAILED ❌'}
                        </span>
                      </div>
                      {healthResult.tables &&
                        Object.entries(healthResult.tables).map(([tbl, val]: any) => (
                          <div key={tbl} className="flex items-center justify-between text-[11px] text-gray-600">
                            <span>{tbl}:</span>
                            <span className={val.ok ? 'text-emerald-600 font-bold' : 'text-amber-600 font-semibold'}>
                              {val.ok ? 'Ready' : val.error || 'Needs Setup'}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SQL Script Generator */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-white flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    Full Production Supabase SQL Schema (Tables + Storage Bucket)
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Run this in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/auazpiwbvsbzrccsqnyf/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 underline font-bold"
                    >
                      Supabase SQL Editor
                    </a>{' '}
                    to create the <code>disaster-evidence</code> storage bucket and all tables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  {copiedSql ? 'Copied SQL Script!' : 'Copy Schema SQL'}
                </button>
              </div>

              <pre className="bg-black/60 p-3 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed max-h-48 overflow-auto border border-gray-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2 text-xs text-gray-500">
          <div>
            Showing <strong>{activeTab === 'disaster_reports' ? filteredReports.length : reports.length}</strong> records from Supabase database
          </div>
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg font-bold text-xs transition-colors shadow-xs"
          >
            Close Database Hub
          </button>
        </div>
      </div>

      {/* FULL SIZE MEDIA PREVIEW LIGHTBOX */}
      {selectedMediaPreview && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setSelectedMediaPreview(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl max-w-4xl w-full p-4 border border-gray-700 shadow-2xl flex flex-col text-white max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-800">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#af101a] text-[18px]">
                    {selectedMediaPreview.type === 'image' ? 'photo_camera' : 'videocam'}
                  </span>
                  {selectedMediaPreview.title}
                </h4>
                <p className="text-xs text-gray-400">{selectedMediaPreview.location}</p>
              </div>
              <button
                onClick={() => setSelectedMediaPreview(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black rounded-lg min-h-[320px]">
              {selectedMediaPreview.type === 'image' ? (
                <img
                  src={selectedMediaPreview.url}
                  alt={selectedMediaPreview.title}
                  className="max-h-[68vh] w-auto max-w-full object-contain"
                />
              ) : (
                <video
                  src={selectedMediaPreview.url}
                  controls
                  autoPlay
                  className="max-h-[68vh] w-full object-contain"
                />
              )}
            </div>

            <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedMediaPreview.url, 'preview_lightbox')}
                  className="text-gray-300 hover:text-white underline text-[11px] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  {copiedUrlIndex === 'preview_lightbox' ? 'Copied Direct URL!' : 'Copy Media Link'}
                </button>
              </div>
              <button
                onClick={() => setSelectedMediaPreview(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
