import { useState, useEffect } from 'react';
import { NavigationTab, AlertItem, InventoryItem, DisasterReport, ReliefLocation, HelpRequest, Volunteer, UserProfile, SosAlert } from './types';
import {
  INITIAL_ALERTS,
  INITIAL_INVENTORY,
  INITIAL_DISASTER_REPORTS,
  INITIAL_HELP_REQUESTS,
  INITIAL_VOLUNTEERS,
  INITIAL_KERALA_RELIEF_LOCATIONS,
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { AdminTopNav } from './components/AdminTopNav';
import { Footer } from './components/Footer';

import { EmergencyModal } from './components/EmergencyModal';
import { IssueAlertModal } from './components/IssueAlertModal';
import { AddInventoryModal } from './components/AddInventoryModal';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { AddKeralaCampModal } from './components/AddKeralaCampModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { DatabaseRecordsModal } from './components/DatabaseRecordsModal';
import { YoloAiInspectorModal } from './components/YoloAiInspectorModal';
import { AuthModal } from './components/AuthModal';
import { SosButton } from './components/SosButton';

import { ProfileSettingsModal } from './components/ProfileSettingsModal';

import { PublicHome } from './views/PublicHome';
import { ReportDisaster } from './views/ReportDisaster';
import { AdminDashboard } from './views/AdminDashboard';
import { ResourceInventory } from './views/ResourceInventory';
import { ActiveAlertsView } from './views/ActiveAlertsView';
import { VolunteersView } from './views/VolunteersView';
import { HelpRequestsView } from './views/HelpRequestsView';
import { KeralaMapView } from './views/KeralaMapView';

import {
  saveDisasterReportToSupabase,
  saveReliefCampToSupabase,
  saveAlertToSupabase,
  saveInventoryItemToSupabase,
  deleteInventoryItemFromSupabase,
  fetchDisasterReportsFromSupabase,
  fetchHelpRequestsFromSupabase,
  fetchVolunteersFromSupabase,
  fetchReliefCampsFromSupabase,
  fetchAlertsFromSupabase,
  fetchInventoryFromSupabase,
  fetchSosAlertsFromSupabase,
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('kerala-map');

  // Shared application state
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [reports, setReports] = useState<DisasterReport[]>(() => {
    try {
      const saved = localStorage.getItem('resilience_disaster_reports_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, DisasterReport>();
          INITIAL_DISASTER_REPORTS.forEach((r) => map.set(r.id, r));
          parsed.forEach((r: DisasterReport) => {
            const ex = map.get(r.id);
            map.set(r.id, {
              ...ex,
              ...r,
              imageUrl: r.imageUrl || ex?.imageUrl,
              videoUrl: r.videoUrl || ex?.videoUrl,
              hasVisualEvidence: !!(r.imageUrl || ex?.imageUrl || r.videoUrl || ex?.videoUrl || r.hasVisualEvidence),
            });
          });
          return Array.from(map.values());
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_DISASTER_REPORTS;
  });
  const [keralaLocations, setKeralaLocations] = useState<ReliefLocation[]>(
    INITIAL_KERALA_RELIEF_LOCATIONS
  );
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>(INITIAL_HELP_REQUESTS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);

  // Automatically persist disaster reports & images to localStorage
  useEffect(() => {
    try {
      if (reports && reports.length > 0) {
        localStorage.setItem('resilience_disaster_reports_v2', JSON.stringify(reports));
      }
    } catch (err) {
      console.warn('Local reports caching note:', err);
    }
  }, [reports]);

  // User Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('resilience_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modal states
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyModalTab, setEmergencyModalTab] = useState<'call' | 'request'>('call');

  const [isIssueAlertModalOpen, setIsIssueAlertModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isAddKeralaCampModalOpen, setIsAddKeralaCampModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<DisasterReport | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] = useState(false);
  const [profileSettingsInitialTab, setProfileSettingsInitialTab] = useState<'edit-profile' | 'photo' | 'settings'>('edit-profile');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isDatabaseRecordsModalOpen, setIsDatabaseRecordsModalOpen] = useState(false);
  const [isYoloInspectorOpen, setIsYoloInspectorOpen] = useState(false);
  const [yoloTargetReport, setYoloTargetReport] = useState<DisasterReport | null>(null);

  const handleOpenYoloInspector = (report?: DisasterReport) => {
    setYoloTargetReport(report || (reports.find((r) => r.imageUrl) || reports[0] || null));
    setIsYoloInspectorOpen(true);
  };

  const handleApplyYoloVerification = async (reportId: string, updatedData: Partial<DisasterReport>) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updated = { ...r, ...updatedData };
          // Persist verified metadata back to Supabase
          saveDisasterReportToSupabase(updated).catch((err) =>
            console.warn('Supabase save verification note:', err)
          );
          if (selectedReport && selectedReport.id === reportId) {
            setSelectedReport(updated);
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleExitAdmin = () => {
    setCurrentUser(null);
    localStorage.removeItem('resilience_user');
    setActiveTab('home');
    setIsLoginModalOpen(false);
  };

  const handleSignOutGlobal = () => {
    setCurrentUser(null);
    localStorage.removeItem('resilience_user');
    setActiveTab('home');
    setIsLoginModalOpen(false);
  };

  // Load live Supabase backend records on launch, login & admin view transitions
  const syncSupabaseData = async () => {
    try {
      const dbReports = await fetchDisasterReportsFromSupabase();
      if (dbReports && dbReports.length > 0) {
        setReports((prev) => {
          const map = new Map<string, DisasterReport>();
          // 1. First populate with current local reports
          prev.forEach((r) => map.set(r.id, r));
          // 2. Layer and merge database reports, preserving image URLs & metadata
          dbReports.forEach((dbR) => {
            const ex = map.get(dbR.id);
            map.set(dbR.id, {
              ...ex,
              ...dbR,
              imageUrl: dbR.imageUrl || ex?.imageUrl,
              videoUrl: dbR.videoUrl || ex?.videoUrl,
              hasVisualEvidence: !!(
                dbR.imageUrl ||
                ex?.imageUrl ||
                dbR.videoUrl ||
                ex?.videoUrl ||
                dbR.hasVisualEvidence ||
                ex?.hasVisualEvidence
              ),
            });
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('resilience_disaster_reports_v2', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      const dbCamps = await fetchReliefCampsFromSupabase();
      if (dbCamps && dbCamps.length > 0) {
        setKeralaLocations((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const fresh = dbCamps.filter((c) => !existingIds.has(c.id));
          return [...fresh, ...prev];
        });
      }

      const dbHelp = await fetchHelpRequestsFromSupabase();
      if (dbHelp && dbHelp.length > 0) {
        setHelpRequests((prev) => {
          const existingIds = new Set(prev.map((h) => h.id));
          const fresh = dbHelp.filter((h) => !existingIds.has(h.id));
          return [...fresh, ...prev];
        });
      }

      const dbVols = await fetchVolunteersFromSupabase();
      if (dbVols && dbVols.length > 0) {
        setVolunteers((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const fresh = dbVols.filter((v) => !existingIds.has(v.id));
          return [...fresh, ...prev];
        });
      }

      const dbAlerts = await fetchAlertsFromSupabase();
      if (dbAlerts && dbAlerts.length > 0) {
        setAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = dbAlerts.filter((a) => !existingIds.has(a.id));
          return [...fresh, ...prev];
        });
      }

      const dbInv = await fetchInventoryFromSupabase();
      if (dbInv && dbInv.length > 0) {
        setInventory((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const fresh = dbInv.filter((i) => !existingIds.has(i.id));
          return [...fresh, ...prev];
        });
      }

      const dbSos = await fetchSosAlertsFromSupabase();
      if (dbSos && dbSos.length > 0) {
        setSosAlerts(dbSos);
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  };

  useEffect(() => {
    syncSupabaseData();
  }, []);

  // Whenever user signs in (especially Admin) or switches to Admin views, guarantee instant sync
  useEffect(() => {
    if (currentUser?.role === 'Administrator' || activeTab.startsWith('admin-')) {
      syncSupabaseData();
    }
  }, [currentUser, activeTab]);

  const loadSosAlerts = async () => {
    const dbSos = await fetchSosAlertsFromSupabase();
    if (dbSos) setSosAlerts(dbSos);
  };

  // Handlers with automatic Supabase persistence
  const handleAddAlert = (newAlert: AlertItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
    saveAlertToSupabase(newAlert);
  };

  const handleAddKeralaLocation = (newLoc: ReliefLocation) => {
    setKeralaLocations((prev) => [newLoc, ...prev]);
    saveReliefCampToSupabase(newLoc);
  };

  const handleSaveInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [item, ...prev];
    });
    saveInventoryItemToSupabase(item);
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    deleteInventoryItemFromSupabase(itemId);
  };

  const handleAddDisasterReport = (newReport: DisasterReport) => {
    setReports((prev) => [newReport, ...prev]);
    saveDisasterReportToSupabase(newReport);
  };

  const handleUpdateReport = (updatedReport: DisasterReport) => {
    setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
    saveDisasterReportToSupabase(updatedReport);
  };

  const handleSosSubmitted = (helpReq: HelpRequest, report?: DisasterReport) => {
    setHelpRequests((prev) => [helpReq, ...prev]);
    if (report) {
      setReports((prev) => [report, ...prev]);
    }
  };

  useEffect(() => {
    if (activeTab === 'volunteer' && !currentUser) {
      setActiveTab('home');
    }
  }, [activeTab, currentUser]);

  const isAdminView = activeTab.startsWith('admin-');

  const triggerGlobalSos = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const sosBtn = document.getElementById('global-sos-button');
    if (sosBtn) {
      sosBtn.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans flex flex-col selection:bg-[#ffdad6] selection:text-[#93000a]">
      {/* GLOBAL NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        onOpenEmergencyHelpline={() => setIsEmergencyModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        onTriggerSos={triggerGlobalSos}
        onSignOut={handleSignOutGlobal}
        onOpenProfileSettings={(tab) => {
          setProfileSettingsInitialTab(tab);
          setIsProfileSettingsModalOpen(true);
        }}
      />

      {/* ADMIN TOP SUBNAVBAR (when in Admin mode) */}
      {isAdminView && (
        <AdminTopNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onExitAdmin={handleExitAdmin}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col w-full">
        {/* PUBLIC VIEWS */}
        {activeTab === 'home' && (
          <PublicHome
            setActiveTab={setActiveTab}
            onOpenHelpModal={() => {
              setEmergencyModalTab('request');
              setIsEmergencyModalOpen(true);
            }}
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'active-alerts' && (
          <ActiveAlertsView
            alerts={alerts}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'kerala-map' && (
          <KeralaMapView
            locations={keralaLocations}
            onOpenAddModal={() => setIsAddKeralaCampModalOpen(true)}
            onRequestHelpForCamp={() => setIsEmergencyModalOpen(true)}
            sosAlerts={sosAlerts}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'report-disaster' && (
          <ReportDisaster
            onAddReport={handleAddDisasterReport}
            onOpenEmergencyHelpline={() => setIsEmergencyModalOpen(true)}
            currentUser={currentUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'volunteer' && (
          <VolunteersView
            volunteers={volunteers}
            currentUser={currentUser}
          />
        )}

        {/* ADMIN VIEWS */}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            reports={reports}
            sosAlerts={sosAlerts}
            helpRequests={helpRequests}
            volunteers={volunteers}
            keralaLocations={keralaLocations}
            inventory={inventory}
            alerts={alerts}
            onOpenIssueAlertModal={() => setIsIssueAlertModalOpen(true)}
            onOpenAddCampModal={() => setIsAddKeralaCampModalOpen(true)}
            onOpenAddInventoryModal={() => {
              setEditingInventoryItem(null);
              setIsAddInventoryModalOpen(true);
            }}
            onReviewReport={(rep) => setSelectedReport(rep)}
            onViewAllReports={() => setActiveTab('admin-disaster-reports')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'admin-kerala-map' && (
          <KeralaMapView
            locations={keralaLocations}
            onOpenAddModal={() => setIsAddKeralaCampModalOpen(true)}
            onRequestHelpForCamp={() => setIsEmergencyModalOpen(true)}
            isAdmin={true}
            sosAlerts={sosAlerts}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin-inventory' && (
          <ResourceInventory
            items={inventory}
            onOpenAddItemModal={() => {
              setEditingInventoryItem(null);
              setIsAddInventoryModalOpen(true);
            }}
            onEditItem={(item) => {
              setEditingInventoryItem(item);
              setIsAddInventoryModalOpen(true);
            }}
            onDeleteItem={handleDeleteInventoryItem}
          />
        )}

        {activeTab === 'admin-disaster-reports' && (
          <div className="p-6 max-w-[1440px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1a1c1c]">
                  Disaster Incident Reports
                </h1>
                <p className="text-xs text-[#5b403d]">
                  Control Room Queue, AI YOLO Damage Verification & Response Dispatch
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenYoloInspector()}
                  className="bg-gradient-to-r from-red-800 to-[#af101a] hover:from-red-900 hover:to-red-800 text-white px-3.5 py-2 rounded font-semibold text-sm flex items-center gap-1.5 transition-all shadow-2xs border border-red-700/40"
                  title="Open OpenAI YOLO AI Vision Inspector & Report Generator"
                >
                  <span className="material-symbols-outlined text-[18px]">search_insights</span>
                  OpenAI YOLO AI Hub
                </button>
                <button
                  onClick={() => setActiveTab('report-disaster')}
                  className="bg-[#af101a] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-[#d32f2f] transition-all"
                >
                  + Submit New Report
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#e4beba] overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eeeeee] border-b border-[#e4beba]">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Media Evidence</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Unit</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4beba]">
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#af101a]">{r.iconName}</span>
                        {r.type}
                      </td>
                      <td className="p-3">{r.location}</td>
                      <td className="p-3">
                        {r.imageUrl ? (
                          <div
                            className="flex items-center gap-1.5 cursor-pointer group/item"
                            onClick={() => handleOpenYoloInspector(r)}
                            title="Click to inspect photo with OpenAI YOLO & OpenCV AI"
                          >
                            <img
                              src={r.imageUrl}
                              alt="Report proof"
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-md object-cover border border-gray-300 shadow-2xs group-hover/item:scale-105 group-hover/item:border-[#af101a] transition-all"
                            />
                            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded group-hover/item:bg-emerald-100 transition-colors">
                              Photo
                            </span>
                          </div>
                        ) : r.videoUrl ? (
                          <div
                            className="flex items-center gap-1 text-[11px] text-[#af101a] font-semibold bg-red-50 px-2 py-1 rounded w-max border border-red-200 cursor-pointer"
                            onClick={() => setSelectedReport(r)}
                          >
                            <span className="material-symbols-outlined text-[14px]">videocam</span>
                            Video
                          </div>
                        ) : r.hasVisualEvidence ? (
                          <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-200">
                            Verified Evidence
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 border">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs">{r.assignedUnit || 'Unassigned'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.imageUrl && (
                            <button
                              onClick={() => handleOpenYoloInspector(r)}
                              className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs ${
                                r.aiVerified
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-red-50 text-[#af101a] border border-red-300 hover:bg-red-100'
                              }`}
                              title="Verify damage with OpenAI YOLO AI Vision"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {r.aiVerified ? 'verified' : 'search_insights'}
                              </span>
                              {r.aiVerified ? `Verified (${r.aiConfidence}%)` : 'AI YOLO'}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="text-[#4c56af] hover:underline font-semibold text-xs px-2 py-1"
                          >
                            Review & Dispatch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admin-help-requests' && (
          <HelpRequestsView 
            helpRequests={helpRequests} 
            currentUser={currentUser} 
          />
        )}

        {activeTab === 'admin-volunteers' && (
          <VolunteersView 
            volunteers={volunteers} 
            isAdmin={true} 
            currentUser={currentUser} 
          />
        )}

        {activeTab === 'admin-alerts' && (
          <ActiveAlertsView
            alerts={alerts}
            onOpenIssueAlertModal={() => setIsIssueAlertModalOpen(true)}
            isAdmin={true}
            currentUser={currentUser}
          />
        )}

        {(activeTab === 'admin-analytics' || activeTab === 'admin-settings') && (
          <div className="p-8 max-w-xl mx-auto w-full">
            <div className="bg-white p-6 rounded-xl border border-[#e4beba] shadow-xs space-y-4">
              <h2 className="text-xl font-bold">
                {activeTab === 'admin-analytics' 
                  ? 'Regional Analytics & Intelligence'
                  : 'Command System Settings'}
              </h2>
              <p className="text-sm text-[#5b403d]">
                {activeTab === 'admin-analytics'
                  ? 'Automated predictive modeling for flood plain overflow, heat waves, and emergency resource depletion.'
                  : 'Configure regional coordination thresholds, GIS data layers, and automated broadcast channels.'}
              </p>
              <div className="p-3 bg-[#e0e0ff] text-[#27308a] rounded text-xs font-semibold">
                ✓ Operational Node Status: Online & Synchronized
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL FOOTER (Includes dedicated Admin Portal section) */}
      <Footer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {currentUser && (
        <ProfileSettingsModal
          isOpen={isProfileSettingsModalOpen}
          onClose={() => setIsProfileSettingsModalOpen(false)}
          currentUser={currentUser}
          initialTab={profileSettingsInitialTab}
          onUpdateProfile={(updatedUser) => {
            setCurrentUser(updatedUser);
            try {
              localStorage.setItem('resilience_user', JSON.stringify(updatedUser));
            } catch {}
          }}
        />
      )}

      {/* GLOBAL MODALS */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        initialTab={emergencyModalTab}
        onHelpRequestSubmitted={(newReq) => {
          setHelpRequests((prev) => [newReq, ...prev]);
        }}
      />

      <IssueAlertModal
        isOpen={isIssueAlertModalOpen}
        onClose={() => setIsIssueAlertModalOpen(false)}
        onAddAlert={handleAddAlert}
      />

      <AddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => {
          setIsAddInventoryModalOpen(false);
          setEditingInventoryItem(null);
        }}
        onSave={handleSaveInventoryItem}
        initialItem={editingInventoryItem}
      />

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateReport={handleUpdateReport}
        onOpenYoloAiInspector={(rep) => handleOpenYoloInspector(rep)}
      />

      <YoloAiInspectorModal
        isOpen={isYoloInspectorOpen}
        onClose={() => setIsYoloInspectorOpen(false)}
        report={yoloTargetReport}
        onApplyVerification={handleApplyYoloVerification}
      />

      <AddKeralaCampModal
        isOpen={isAddKeralaCampModalOpen}
        onClose={() => setIsAddKeralaCampModalOpen(false)}
        onAddLocation={handleAddKeralaLocation}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <DatabaseRecordsModal
        isOpen={isDatabaseRecordsModalOpen}
        onClose={() => setIsDatabaseRecordsModalOpen(false)}
        reports={reports}
        sosAlerts={sosAlerts}
        helpRequests={helpRequests}
        volunteers={volunteers}
        reliefCamps={keralaLocations}
        inventory={inventory}
        onReviewReport={(report) => {
          setIsDatabaseRecordsModalOpen(false);
          setSelectedReport(report);
        }}
        onOpenYoloInspector={(report) => {
          setIsDatabaseRecordsModalOpen(false);
          handleOpenYoloInspector(report);
        }}
        onDeleteReport={(reportId) => {
          setReports((prev) => prev.filter((r) => r.id !== reportId));
        }}
        onRefreshFromSupabase={syncSupabaseData}
      />

      {/* GLOBAL PERSISTENT SOS BUTTON */}
      <SosButton
        currentUser={currentUser}
        onSosSubmitted={handleSosSubmitted}
        onSosAlertCreated={loadSosAlerts}
      />

      {/* AUTHENTICATION (SIGN UP & SIGN IN) MODAL */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onNavigateToAdmin={() => setActiveTab('admin-dashboard')}
        onNavigateToPublic={() => setActiveTab('kerala-map')}
        onSignInSuccess={syncSupabaseData}
      />
    </div>
  );
}
