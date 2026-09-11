import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DisasterReport,
  SosAlert,
  HelpRequest,
  Volunteer,
  ReliefLocation,
  InventoryItem,
  AlertItem,
  NavigationTab,
} from '../types';
import { MONTHLY_TRENDS_DATA, RESOURCE_DISTRIBUTION_DATA } from '../data/mockData';

interface AdminDashboardProps {
  reports: DisasterReport[];
  sosAlerts?: SosAlert[];
  helpRequests?: HelpRequest[];
  volunteers?: Volunteer[];
  keralaLocations?: ReliefLocation[];
  inventory?: InventoryItem[];
  alerts?: AlertItem[];
  onOpenIssueAlertModal: () => void;
  onOpenAddCampModal?: () => void;
  onOpenAddInventoryModal?: () => void;
  onReviewReport: (report: DisasterReport) => void;
  onViewAllReports: () => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  sosAlerts = [],
  helpRequests = [],
  volunteers = [],
  keralaLocations = [],
  inventory = [],
  alerts = [],
  onOpenIssueAlertModal,
  onOpenAddCampModal,
  onOpenAddInventoryModal,
  onReviewReport,
  onViewAllReports,
  onNavigateTab,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [acknowledgedSos, setAcknowledgedSos] = useState<Record<string, boolean>>({});

  const handleAcknowledgeSos = (id?: string) => {
    if (!id) return;
    setAcknowledgedSos((prev) => ({ ...prev, [id]: true }));
  };

  const totalReportsCount = reports.length;
  const criticalCount = reports.filter((r) => r.status === 'Critical' || r.severity === 'Critical').length;
  const pendingRequestsCount = helpRequests.filter((h) => h.status === 'Pending').length || helpRequests.length;
  const activeVolunteersCount = volunteers.filter((v) => v.status === 'Active Field').length || volunteers.length;
  const totalCampCapacity = keralaLocations.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalCampOccupancy = keralaLocations.reduce((sum, c) => sum + (c.occupancy || 0), 0);
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  return (
    <div className="flex-1 min-h-screen bg-[#f9f9f9] flex flex-col font-sans">
      {/* Top Admin Command Header */}
      <header className="bg-white border-b border-[#e4beba] py-3.5 px-4 md:px-6  shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#af101a] text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1a1c1c] tracking-tight">
                  State Disaster Control Room
                </h2>
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-[#5b403d] font-medium">
                Regional Emergency Command • Multi-Agency Dispatch System
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenIssueAlertModal}
              className="bg-[#af101a] hover:bg-[#d32f2f] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              Issue Alert
            </button>

            {onOpenAddCampModal && (
              <button
                onClick={onOpenAddCampModal}
                className="bg-[#005f7b] hover:bg-[#00485d] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
                Add Relief Camp
              </button>
            )}

            {onOpenAddInventoryModal && (
              <button
                onClick={onOpenAddInventoryModal}
                className="bg-[#4c56af] hover:bg-[#3b438c] text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                Add Inventory
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-[#5b403d]"
                title="Live Dispatch Alerts"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#af101a] rounded-full border-2 border-white animate-ping" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#af101a] rounded-full border-2 border-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#e4beba] p-3 text-xs z-50 animate-in fade-in">
                  <div className="font-bold text-sm text-[#1a1c1c] mb-2 border-b pb-1.5 flex items-center justify-between">
                    <span>System Alerts & Logs</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">ONLINE</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-2 bg-[#ffdad6]/40 rounded border border-[#ffb3ac]">
                      <strong>Critical Incident:</strong> Landslide hazard flagged in Meppadi sector.
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                      <strong>Volunteer Sync:</strong> 12 new field rescue volunteers active.
                    </div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong>Warehouse Stock:</strong> Central hub replenished with 1,200 emergency rations.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="p-4 md:p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">

        {/* STATS BENTO GRID (6 Metric Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {/* Card 1: Total Disaster Reports */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-disaster-reports')}
            className="bg-white rounded-xl border border-[#e4beba] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#af101a] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-[#af101a]/10 rounded-lg text-[#af101a] group-hover:bg-[#af101a] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">report_problem</span>
              </div>
              <span className="text-[10px] font-extrabold text-[#af101a] bg-[#af101a]/10 px-1.5 py-0.5 rounded">
                {criticalCount} Critical
              </span>
            </div>
            <div>
              <p className="text-xs text-[#5b403d] font-semibold mb-0.5">Disaster Reports</p>
              <p className="text-2xl md:text-3xl font-black text-[#1a1c1c]">{totalReportsCount}</p>
            </div>
          </div>

          {/* Card 2: SOS Emergency Dispatches */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-kerala-map')}
            className="bg-white rounded-xl border-2 border-[#af101a] p-3.5 flex flex-col justify-between shadow-2xs bg-gradient-to-br from-red-50/50 to-white hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-[#af101a] text-white rounded-lg animate-pulse">
                <span className="material-symbols-outlined text-[22px]">sos</span>
              </div>
              <span className="text-[10px] font-extrabold text-[#af101a] uppercase tracking-wider">
                Live Dispatches
              </span>
            </div>
            <div>
              <p className="text-xs text-[#af101a] font-bold mb-0.5">Emergency SOS Alerts</p>
              <p className="text-2xl md:text-3xl font-black text-[#af101a]">
                {sosAlerts.length > 0 ? sosAlerts.length : 12}
              </p>
            </div>
          </div>

          {/* Card 3: Pending Help Requests */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-help-requests')}
            className="bg-white rounded-xl border border-[#e4beba] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#4c56af] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-[#4c56af]/10 rounded-lg text-[#4c56af] group-hover:bg-[#4c56af] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">handshake</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Pending
              </span>
            </div>
            <div>
              <p className="text-xs text-[#5b403d] font-semibold mb-0.5">Help Requests</p>
              <p className="text-2xl md:text-3xl font-black text-[#1a1c1c]">{pendingRequestsCount}</p>
            </div>
          </div>

          {/* Card 4: Active Volunteers */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-volunteers')}
            className="bg-white rounded-xl border border-[#e4beba] p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#005f7b] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-[#005f7b]/10 rounded-lg text-[#005f7b] group-hover:bg-[#005f7b] group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">volunteer_activism</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                On Field
              </span>
            </div>
            <div>
              <p className="text-xs text-[#5b403d] font-semibold mb-0.5">Active Volunteers</p>
              <p className="text-2xl md:text-3xl font-black text-[#1a1c1c]">{activeVolunteersCount}</p>
            </div>
          </div>

          {/* Card 5: Relief Camps */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-kerala-map')}
            className="bg-white rounded-xl border border-[#e4beba] p-3.5 flex flex-col justify-between shadow-2xs hover:border-emerald-600 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">other_houses</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                {keralaLocations.length} Camps
              </span>
            </div>
            <div>
              <p className="text-xs text-[#5b403d] font-semibold mb-0.5">Relief Capacity</p>
              <p className="text-2xl md:text-3xl font-black text-[#1a1c1c]">
                {totalCampOccupancy}/{totalCampCapacity || 15000}
              </p>
            </div>
          </div>

          {/* Card 6: Inventory Health */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('admin-inventory')}
            className="bg-white rounded-xl border border-[#e4beba] p-3.5 flex flex-col justify-between shadow-2xs hover:border-amber-600 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                {lowStockCount} Low
              </span>
            </div>
            <div>
              <p className="text-xs text-[#5b403d] font-semibold mb-0.5">Supply Items</p>
              <p className="text-2xl md:text-3xl font-black text-[#1a1c1c]">{inventory.length || 18}</p>
            </div>
          </div>
        </div>

        {/* SUB-MODULE QUICK ACCESS CARDS */}
        {onNavigateTab && (
          <div className="bg-white rounded-xl border border-[#e4beba] p-4 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5b403d] mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#af101a]">grid_view</span>
              Control Room Quick Navigation & Sub-Panels
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { id: 'admin-kerala-map', label: 'Live GIS Map', icon: 'map', color: 'text-[#005f7b]' },
                { id: 'admin-disaster-reports', label: 'Disaster Queue', icon: 'report_problem', color: 'text-[#af101a]' },
                { id: 'admin-help-requests', label: 'Help Requests', icon: 'handshake', color: 'text-[#4c56af]' },
                { id: 'admin-volunteers', label: 'Volunteers', icon: 'volunteer_activism', color: 'text-emerald-700' },
                { id: 'admin-inventory', label: 'Resource Stock', icon: 'inventory_2', color: 'text-amber-700' },
                { id: 'admin-alerts', label: 'Broadcast Alerts', icon: 'campaign', color: 'text-red-700' },
                { id: 'admin-analytics', label: 'AI Analytics', icon: 'monitoring', color: 'text-purple-700' },
                { id: 'admin-settings', label: 'Settings', icon: 'settings', color: 'text-gray-700' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id as NavigationTab)}
                  className="p-3 bg-[#f9f9f9] hover:bg-[#ffdad6]/20 border border-gray-200 hover:border-[#af101a]/30 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                >
                  <span className={`material-symbols-outlined text-[24px] ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-bold text-gray-800 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LIVE SOS DISPATCH STREAM SECTION */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 border-b border-red-100 bg-red-50/60 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#af101a] animate-pulse">
                emergency
              </span>
              <h3 className="text-sm font-extrabold text-[#af101a] uppercase tracking-wide">
                Live SOS Emergency Dispatches Queue
              </h3>
            </div>
            <span className="text-xs text-red-900 font-bold bg-white px-2.5 py-1 rounded-full border border-red-200 shadow-2xs">
              {sosAlerts.length} Active GPS Transmissions
            </span>
          </div>

          <div className="p-3 overflow-x-auto">
            {sosAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                ✓ No active SOS emergency dispatches currently pending.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-[#5b403d] font-bold">
                    <th className="p-2.5">Reporter</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">GPS Location</th>
                    <th className="p-2.5">Time Logged</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {sosAlerts.map((sos, idx) => {
                    const isAck = acknowledgedSos[sos.id || `sos-${idx}`];
                    return (
                      <tr key={sos.id || `sos-${idx}`} className="hover:bg-red-50/30 transition-colors">
                        <td className="p-2.5 font-bold flex items-center gap-1.5 text-[#af101a]">
                          <span className="material-symbols-outlined text-[16px]">person_pin</span>
                          {sos.full_name || 'Emergency Reporter'}
                        </td>
                        <td className="p-2.5 font-mono">{sos.phone || 'Contact Logged'}</td>
                        <td className="p-2.5 font-mono text-[11px]">
                          {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                        </td>
                        <td className="p-2.5 text-gray-500">
                          {sos.created_at ? new Date(sos.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </td>
                        <td className="p-2.5">
                          {isAck ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              ✓ Dispatched & Ack
                            </span>
                          ) : (
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
                              🚨 Urgent Dispatch
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleAcknowledgeSos(sos.id || `sos-${idx}`)}
                            disabled={isAck}
                            className={`px-3 py-1 rounded text-[11px] font-bold transition-all shadow-2xs ${
                              isAck
                                ? 'bg-gray-200 text-gray-500 cursor-default'
                                : 'bg-[#af101a] hover:bg-[#d32f2f] text-white'
                            }`}
                          >
                            {isAck ? 'Acknowledged' : 'Dispatch Control Unit'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart: Disaster Trends */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#e4beba] p-5 flex flex-col shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#1a1c1c]">Disaster Incident Trends (Monthly)</h3>
              <span className="text-xs text-gray-500 font-mono">Statistical Analysis</span>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_TRENDS_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#8f6f6c" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8f6f6c" fontSize={12} tickLine={false} domain={[0, 35]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4beba',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incidents"
                    stroke="#4c56af"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#4c56af', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Resource Distribution */}
          <div className="bg-white rounded-xl border border-[#e4beba] p-5 flex flex-col shadow-2xs">
            <h3 className="text-base font-bold text-[#1a1c1c] mb-4">Emergency Supply Allocation</h3>
            <div className="w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RESOURCE_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {RESOURCE_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RECENT DISASTER REPORTS QUEUE TABLE */}
        <div className="bg-white rounded-xl border border-[#e4beba] flex flex-col overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#e4beba] flex justify-between items-center bg-[#f9f9f9]">
            <div>
              <h3 className="text-base font-bold text-[#1a1c1c]">Incident Control Queue</h3>
              <p className="text-xs text-gray-500">Active reports needing review, unit assignment, and dispatch</p>
            </div>
            <button
              onClick={onViewAllReports}
              className="text-[#4c56af] font-bold text-xs hover:underline flex items-center gap-1 bg-[#4c56af]/10 px-3 py-1.5 rounded-lg"
            >
              View Full Incident Queue ({reports.length})
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e4beba] bg-[#eeeeee] text-[#5b403d] font-bold text-xs">
                  <th className="py-3 px-4">Disaster Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Uploaded Media</th>
                  <th className="py-3 px-4">Time Logged</th>
                  <th className="py-3 px-4">Severity / Status</th>
                  <th className="py-3 px-4">Assigned Unit</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#1a1c1c] divide-y divide-[#e4beba] font-medium">
                {reports.slice(0, 6).map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#af101a] bg-[#af101a]/10 p-1 rounded text-[18px]">
                        {rep.iconName}
                      </span>
                      {rep.type}
                    </td>

                    <td className="py-3 px-4 text-[#5b403d] font-medium">{rep.location}</td>

                    {/* UPLOADED MEDIA COLUMN */}
                    <td className="py-3 px-4">
                      {rep.imageUrl ? (
                        <div
                          className="flex items-center gap-2 cursor-pointer group/photo"
                          onClick={() => onReviewReport(rep)}
                          title="Click to view full photo evidence & dispatch"
                        >
                          <img
                            src={rep.imageUrl}
                            alt="Incident Evidence"
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-md object-cover border border-gray-300 shadow-2xs group-hover/photo:scale-105 group-hover/photo:border-[#af101a] transition-all"
                          />
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded group-hover/photo:bg-emerald-100 transition-colors">
                            Photo Evidence
                          </span>
                        </div>
                      ) : rep.videoUrl ? (
                        <div
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#af101a] bg-red-50 border border-red-200 px-2 py-0.5 rounded cursor-pointer"
                          onClick={() => onReviewReport(rep)}
                          title="Click to play video evidence"
                        >
                          <span className="material-symbols-outlined text-[14px]">videocam</span>
                          Video Clip
                        </div>
                      ) : rep.hasVisualEvidence ? (
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Evidence Logged
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#5b403d] font-mono">
                      {rep.timeLogged}
                    </td>

                    <td className="py-3 px-4">
                      {rep.status === 'Critical' || rep.severity === 'Critical' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#af101a]/10 text-[#af101a] border border-[#af101a]/20 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#af101a] animate-pulse" /> Critical
                        </span>
                      ) : rep.status === 'Investigating' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Investigating
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4c56af]/10 text-[#4c56af] border border-[#4c56af]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4c56af]" /> {rep.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      {rep.assignedUnit || 'Unassigned'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onReviewReport(rep)}
                        className="bg-[#4c56af] text-white hover:bg-[#3b438c] px-3 py-1 rounded font-bold text-[11px] transition-colors shadow-2xs"
                      >
                        Review & Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

