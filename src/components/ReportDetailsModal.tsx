import React, { useState } from 'react';
import { DisasterReport } from '../types';

interface ReportDetailsModalProps {
  report: DisasterReport | null;
  onClose: () => void;
  onUpdateReport: (updated: DisasterReport) => void;
  onOpenYoloAiInspector?: (report: DisasterReport) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onUpdateReport,
  onOpenYoloAiInspector,
}) => {
  if (!report) return null;

  const [status, setStatus] = useState<DisasterReport['status']>(report.status);
  const [assignedUnit, setAssignedUnit] = useState(report.assignedUnit || '');
  const [activeMediaZoom, setActiveMediaZoom] = useState<'image' | 'video' | null>(null);

  const handleSave = () => {
    onUpdateReport({
      ...report,
      status,
      assignedUnit,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#e4beba] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#ffdad6] flex items-center justify-center text-[#af101a]">
              <span className="material-symbols-outlined text-[24px]">{report.iconName}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1c]">{report.type} Incident Report</h3>
              <p className="text-xs text-[#5b403d]">{report.location} • Logged {report.timeLogged}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-[#f9f9f9] border border-[#e4beba] p-3 rounded-lg text-sm text-[#1a1c1c]">
            <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider mb-1">
              Situation Description
            </p>
            {report.description}
          </div>

          {/* Visual Media Evidence & OpenAI YOLO + OpenCV AI Verification Section */}
          {(report.imageUrl || report.videoUrl || report.hasVisualEvidence) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#af101a]">perm_media</span>
                  Attached Visual Evidence
                </p>
                {report.imageUrl && onOpenYoloAiInspector && (
                  <button
                    type="button"
                    onClick={() => onOpenYoloAiInspector(report)}
                    className="bg-gradient-to-r from-red-800 via-[#af101a] to-indigo-900 hover:opacity-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">search_insights</span>
                    YOLO & OpenCV AI Verify
                  </button>
                )}
              </div>

              {/* YOLO & OpenCV AI Verification Badge & Findings (if verified) */}
              {report.aiVerified && (
                <div className={`border rounded-lg p-2.5 text-xs flex flex-col gap-1.5 ${
                  report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene
                    ? 'bg-emerald-950/20 border-emerald-500 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold flex items-center gap-1">
                      <span className={`material-symbols-outlined text-[18px] ${
                        report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene ? 'verified' : 'warning'}
                      </span>
                      {report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene
                        ? 'YOLO & OpenCV: Verified Safe (No Disaster Detected)'
                        : 'YOLO & OpenCV AI Damage Assessment Verified'}
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {report.aiConfidence}% Match
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span>Damage Severity: <strong>{report.aiDamageSeverity || 'None (Safe)'}</strong></span>
                    {report.aiVerificationTimestamp && <span>• Analyzed: {report.aiVerificationTimestamp}</span>}
                  </div>
                  {report.aiDetectedHazards && report.aiDetectedHazards.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {report.aiDetectedHazards.map((haz, idx) => (
                        <span key={idx} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          report.aiDamageSeverity === 'None (Safe)' || report.aiIsSafeScene
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-white border-amber-300 text-amber-900'
                        }`}>
                          {haz}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.imageUrl && (
                  <div
                    onClick={() => setActiveMediaZoom('image')}
                    className="rounded-lg overflow-hidden border border-gray-300 bg-black cursor-pointer group relative shadow-2xs"
                    title="Click to view full-resolution image"
                  >
                    <img
                      src={report.imageUrl}
                      alt="Disaster visual evidence"
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[22px]">zoom_in</span>
                    </div>
                    <div className="p-1.5 text-center bg-gray-900 text-[10px] text-white font-mono flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                      Incident Photo (Click to Zoom)
                    </div>
                  </div>
                )}
                {report.videoUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-300 bg-black shadow-2xs">
                    <video
                      src={report.videoUrl}
                      controls
                      className="w-full h-36 object-contain"
                    />
                    <div className="p-1.5 text-center bg-gray-900 text-[10px] text-white font-mono flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">videocam</span>
                      Incident Video Clip
                    </div>
                  </div>
                )}
                {!report.imageUrl && !report.videoUrl && report.hasVisualEvidence && (
                  <div className="col-span-2 p-3 bg-white border border-gray-200 rounded flex items-center gap-2 text-xs text-gray-700">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                    Visual evidence recorded by on-site civilian unit.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[#5b403d] block font-semibold">Reporter Name</span>
              <span className="text-[#1a1c1c] font-medium">{report.reporterName || 'Anonymous Civilian'}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[#5b403d] block font-semibold">Contact Phone</span>
              <span className="text-[#1a1c1c] font-medium">{report.contact || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Dispatch Response Unit
              </label>
              <input
                type="text"
                value={assignedUnit}
                onChange={(e) => setAssignedUnit(e.target.value)}
                placeholder="e.g., USAR Rescue 1, Fire Engine 4"
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Incident Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="Investigating">Investigating</option>
                <option value="En Route">En Route</option>
                <option value="Dispatching">Dispatching</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#e4beba] text-sm font-semibold text-[#5b403d] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#4c56af] hover:bg-[#27308a] text-white text-sm font-bold rounded shadow-sm"
            >
              Update Dispatch Status
            </button>
          </div>
        </div>
      </div>

      {/* FULL RESOLUTION MEDIA LIGHTBOX */}
      {activeMediaZoom && report.imageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveMediaZoom(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl max-w-4xl w-full p-4 border border-gray-700 shadow-2xl flex flex-col text-white max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-800">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#af101a] text-[18px]">
                    photo_camera
                  </span>
                  {report.type} - Full Photographic Evidence
                </h4>
                <p className="text-xs text-gray-400">{report.location} • {report.timeLogged}</p>
              </div>
              <button
                onClick={() => setActiveMediaZoom(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black rounded-lg min-h-[320px]">
              <img
                src={report.imageUrl}
                alt="Enlarged disaster proof"
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
              <span>Database visual proof record</span>
              <button
                onClick={() => setActiveMediaZoom(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
