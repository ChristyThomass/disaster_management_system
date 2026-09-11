import React, { useState, useEffect, useRef } from 'react';
import { DisasterReport, YoloBoundingBox } from '../types';
import { runYoloDisasterDetection, DetailedYoloAnalysis } from '../lib/yoloAiService';
import {
  OpenCvFilterMode,
  OpenCvAnalysisMetrics,
  applyOpenCvFilter,
} from '../lib/openCvAiService';

interface YoloAiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: DisasterReport | null;
  onApplyVerification?: (reportId: string, updatedData: Partial<DisasterReport>) => void;
}

export const YoloAiInspectorModal: React.FC<YoloAiInspectorModalProps> = ({
  isOpen,
  onClose,
  report,
  onApplyVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'opencv' | 'metrics' | 'report'>('vision');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetailedYoloAnalysis | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.5);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [customImageInput, setCustomImageInput] = useState('');
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // OpenCV AI Vision State
  const [openCvMode, setOpenCvMode] = useState<OpenCvFilterMode>('original');
  const [edgeThreshold, setEdgeThreshold] = useState<number>(50);
  const [openCvMetrics, setOpenCvMetrics] = useState<OpenCvAnalysisMetrics | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default image
  const defaultImage =
    report?.imageUrl ||
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80';

  useEffect(() => {
    if (isOpen) {
      const targetImg = report?.imageUrl || defaultImage;
      setActiveImageUrl(targetImg);
      handleRunDetection(targetImg, report?.type || 'Disaster Incident', report?.description || '');
    }
  }, [isOpen, report]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setActiveImageUrl(base64);
        handleRunDetection(base64, 'Uploaded Image Evidence', file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute OpenCV canvas filter whenever mode, threshold, or activeImageUrl changes
  useEffect(() => {
    if (!activeImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImageUrl;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const maxW = 760;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);

      try {
        const hint = `${detectionResult?.summary || ''} ${report?.type || ''} ${report?.description || ''} ${activeImageUrl}`;
        const metrics = applyOpenCvFilter(ctx, w, h, openCvMode, edgeThreshold, hint);
        setOpenCvMetrics(metrics);
      } catch (err) {
        console.warn('Canvas pixel processing fallback (CORS or draw error):', err);
      }
    };
  }, [activeImageUrl, openCvMode, edgeThreshold, isOpen, detectionResult]);

  const handleRunDetection = async (imgUrl: string, typeHint = 'Disaster Incident', descHint = '') => {
    setIsAnalyzing(true);
    try {
      const result = await runYoloDisasterDetection(
        imgUrl,
        typeHint,
        descHint,
        report?.id || `REP-${Date.now().toString().slice(-6)}`
      );
      setDetectionResult(result);
    } catch (err) {
      console.error('YOLO & OpenCV AI Analysis Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const filteredDetections = (detectionResult?.detections || []).filter((box) => {
    const matchesCategory = selectedCategory === 'all' || box.category === selectedCategory;
    const matchesConfidence = box.confidence >= confidenceThreshold;
    return matchesCategory && matchesConfidence;
  });

  const getCategoryColor = (cat: YoloBoundingBox['category'], threat: YoloBoundingBox['threatLevel'], isSafe?: boolean) => {
    if (isSafe || threat === 'Low') {
      return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-300', stroke: '#10b981' };
    }
    if (threat === 'Critical') return { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-400', stroke: '#ef4444' };
    if (cat === 'fire') return { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-400', stroke: '#f97316' };
    if (cat === 'water') return { border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400', stroke: '#3b82f6' };
    if (cat === 'electrical') return { border: 'border-yellow-400', bg: 'bg-yellow-400/20', text: 'text-yellow-300', stroke: '#eab308' };
    if (cat === 'human') return { border: 'border-pink-500', bg: 'bg-pink-500/20', text: 'text-pink-300', stroke: '#ec4899' };
    return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-300', stroke: '#10b981' };
  };

  const handleCopyReport = () => {
    if (!detectionResult) return;
    navigator.clipboard.writeText(detectionResult.aiCertifiedReportText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleApplyToIncident = () => {
    if (!report || !detectionResult || !onApplyVerification) return;
    const isSafe = detectionResult.isSafeScene;
    onApplyVerification(report.id, {
      aiVerified: true,
      aiConfidence: detectionResult.overallConfidence,
      aiDamageSeverity: detectionResult.damageSeverity,
      aiIsSafeScene: isSafe,
      aiVerificationTimestamp: detectionResult.analyzedAt,
      aiDetectedHazards: isSafe ? ['Verified Safe (0 Hazards Detected)'] : detectionResult.detections.map((d) => d.label),
      aiGeneratedReport: detectionResult.aiCertifiedReportText,
      status: isSafe ? 'Investigating' : (detectionResult.damageSeverity === 'Catastrophic' || detectionResult.damageSeverity === 'Severe' ? 'Critical' : report.status),
    });
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  const openCvFilterOptions: { id: OpenCvFilterMode; label: string; icon: string; desc: string }[] = [
    { id: 'original', label: 'RGB Original', icon: 'image', desc: 'True color optical photographic inspection' },
    { id: 'canny', label: 'OpenCV Canny Cracks', icon: 'line_weight', desc: 'Morphological crack & shear line detection' },
    { id: 'thermal_jet', label: 'OpenCV Thermal JET', icon: 'local_fire_department', desc: 'Infrared pseudo-color temperature gradients' },
    { id: 'water_segmentation', label: 'OpenCV Water Segment', icon: 'water', desc: 'High-contrast flood level boundary binarization' },
    { id: 'clahe', label: 'OpenCV CLAHE Boost', icon: 'brightness_6', desc: 'Adaptive contrast for low-light / smoke haze' },
    { id: 'sobel_gradient', label: 'OpenCV Sobel Slope', icon: 'insights', desc: 'Directional shear gradient and slope deformation' },
    { id: 'rubble_density', label: 'OpenCV Rubble Heatmap', icon: 'grain', desc: 'High-frequency debris & rubble accumulation density' },
  ];

  const isCurrentSafe = detectionResult?.isSafeScene;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-950 text-white rounded-2xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl border border-gray-800 flex flex-col max-h-[94vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg border ${
              isCurrentSafe
                ? 'bg-gradient-to-br from-emerald-700 via-teal-800 to-indigo-950 shadow-emerald-900/30 border-emerald-600/50'
                : 'bg-gradient-to-br from-[#af101a] via-red-800 to-indigo-950 shadow-red-900/30 border-red-700/50'
            } text-white`}>
              <span className="material-symbols-outlined text-[28px]">
                {isCurrentSafe ? 'verified_user' : 'search_insights'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  OpenAI YOLO & OpenCV AI Vision Inspector
                </h3>
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isCurrentSafe
                    ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                    : 'bg-red-900/60 text-red-300 border-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrentSafe ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                  {isCurrentSafe ? 'SAFE SCENE DETECTED' : 'YOLOv11 + OpenCV 4.x'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {report ? (
                  <>
                    Disaster Incident <strong className="text-white">#{report.id}</strong> ({report.type}) • {report.location}
                  </>
                ) : (
                  'Multi-Spectral Object Classification, Safe Scene Recognition & Morphological Analytics'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Switcher */}
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'vision' ? 'bg-[#af101a] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
                YOLO Vision HUD
              </button>
              <button
                onClick={() => setActiveTab('opencv')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'opencv' ? 'bg-[#af101a] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">filter_vintage</span>
                OpenCV AI Filters
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'metrics' ? 'bg-[#af101a] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                Physical Impact
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'report' ? 'bg-[#af101a] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                Certified Report
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* METRIC BANNER */}
        {detectionResult && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-3 border-b border-gray-850 bg-gray-900/60 -mx-4 px-4 sm:-mx-6 sm:px-6 text-xs">
            <div className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-mono block">AI & OpenCV Match</span>
              <div className="text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {detectionResult.overallConfidence}%
                {isCurrentSafe && <span className="text-[10px] text-emerald-300 font-mono">(Safe)</span>}
              </div>
            </div>

            <div className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-mono block">Damage Severity</span>
              <div
                className={`text-base font-black mt-0.5 ${
                  isCurrentSafe
                    ? 'text-emerald-400'
                    : detectionResult.damageSeverity === 'Catastrophic' || detectionResult.damageSeverity === 'Severe'
                    ? 'text-red-400'
                    : 'text-amber-400'
                }`}
              >
                {detectionResult.damageSeverity}
              </div>
            </div>

            <div className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-mono block">Structural Integrity</span>
              <div className={`text-base font-black mt-0.5 flex items-baseline gap-1 ${
                isCurrentSafe ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                {detectionResult.structuralIntegrityScore}%
                <span className="text-[10px] text-gray-500">
                  {isCurrentSafe ? 'Intact' : 'remaining'}
                </span>
              </div>
            </div>

            <div className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 text-[10px] uppercase font-mono block">Life Safety Threat</span>
              <div className={`text-xs font-black mt-1 flex items-center gap-1 ${
                isCurrentSafe ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isCurrentSafe ? 'bg-emerald-400' : 'bg-red-400 animate-ping'}`} />
                {isCurrentSafe ? 'None (Safe Scene)' : detectionResult.trappedCasualtyRisk}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 flex flex-col justify-between">
              <span className="text-gray-400 text-[10px] uppercase font-mono block">YOLO Targets</span>
              <div className="text-base font-black text-blue-400">
                {detectionResult.detectedObjectsCount} {isCurrentSafe ? 'Safe Baselines' : 'Classified'}
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY */}
        <div className="flex-1 overflow-hidden min-h-0 py-3 flex flex-col">
          {activeTab === 'vision' ? (
            /* TAB 1: YOLO NEURAL HUD */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
              {/* LEFT: INTERACTIVE IMAGE CANVAS WITH YOLO HUD */}
              <div className="lg:col-span-8 flex flex-col bg-black rounded-2xl border border-gray-800 overflow-hidden relative shadow-inner">
                {/* HUD Controls Bar */}
                <div className="p-2.5 bg-gray-900/95 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs z-20">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-gray-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBoxes}
                        onChange={(e) => setShowBoxes(e.target.checked)}
                        className="rounded accent-[#af101a]"
                      />
                      Boxes
                    </label>
                    <label className="flex items-center gap-1.5 text-gray-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="rounded accent-[#af101a]"
                      />
                      Labels
                    </label>

                    {/* Quick OpenCV Filter Trigger */}
                    <button
                      onClick={() => setActiveTab('opencv')}
                      className="bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">filter_vintage</span>
                      OpenCV Mode: {openCvFilterOptions.find((f) => f.id === openCvMode)?.label}
                    </button>

                    {/* Confidence Threshold */}
                    <div className="hidden sm:flex items-center gap-2 border-l border-gray-700 pl-3">
                      <span className="text-gray-400 font-mono text-[11px]">Threshold:</span>
                      <input
                        type="range"
                        min="0.3"
                        max="0.95"
                        step="0.05"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-20 accent-[#af101a]"
                      />
                      <span className="text-gray-200 font-mono text-[11px] font-bold">
                        {(confidenceThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunDetection(activeImageUrl)}
                      disabled={isAnalyzing}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all border border-gray-700"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${isAnalyzing ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                      {isAnalyzing ? 'Scanning...' : 'Re-Scan'}
                    </button>
                  </div>
                </div>

                {/* THE IMAGE + SVG / HUD BOUNDING BOXES */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-950 select-none">
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm font-mono font-bold text-white tracking-widest uppercase">
                        YOLO Neural Vision Scan In Progress...
                      </div>
                      <span className="text-xs text-gray-400">Evaluating Edge Dynamics, Thermal Signatures, and Safety Margins</span>
                    </div>
                  )}

                  <div className="relative max-h-full max-w-full inline-block">
                    <img
                      src={activeImageUrl}
                      alt="Disaster Incident Evidence"
                      className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full object-contain block mx-auto rounded-lg shadow-2xl"
                    />

                    {/* OVERLAID YOLO BOUNDING BOXES */}
                    {showBoxes &&
                      filteredDetections.map((item) => {
                        const colors = getCategoryColor(item.category, item.threatLevel, isCurrentSafe);
                        const isHovered = hoveredBoxId === item.id;

                        return (
                          <div
                            key={item.id}
                            onMouseEnter={() => setHoveredBoxId(item.id)}
                            onMouseLeave={() => setHoveredBoxId(null)}
                            style={{
                              left: `${item.box.x}%`,
                              top: `${item.box.y}%`,
                              width: `${item.box.width}%`,
                              height: `${item.box.height}%`,
                            }}
                            className={`absolute border-2 ${colors.border} ${
                              isHovered ? 'bg-white/20 ring-4 ring-white/50 z-20' : colors.bg
                            } transition-all duration-150 cursor-pointer rounded-xs`}
                          >
                            {/* HUD Tag Label */}
                            {showLabels && (
                              <div
                                className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-lg flex items-center gap-1 ${
                                  isCurrentSafe
                                    ? 'bg-emerald-800 text-white border border-emerald-600'
                                    : item.threatLevel === 'Critical'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-900/95 text-gray-100 border border-gray-700'
                                }`}
                              >
                                <span className="uppercase">{item.label}</span>
                                <span className="opacity-80">{(item.confidence * 100).toFixed(1)}%</span>
                              </div>
                            )}

                            {/* Corner Target Markers */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Image Input & Analysis Bar */}
                <div className="p-2.5 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-400">upload_file</span>
                      Upload Image
                    </button>
                    <input
                      type="text"
                      placeholder="Or paste image URL to inspect..."
                      value={customImageInput}
                      onChange={(e) => setCustomImageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customImageInput.trim()) {
                          setActiveImageUrl(customImageInput.trim());
                          handleRunDetection(customImageInput.trim(), 'Image Evidence', 'Analyzed scene');
                        }
                      }}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-[#af101a] outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const target = customImageInput.trim() || activeImageUrl;
                      if (target) {
                        if (customImageInput.trim()) setActiveImageUrl(customImageInput.trim());
                        handleRunDetection(target, report?.type || 'Image Evidence', report?.description || '');
                      }
                    }}
                    disabled={isAnalyzing}
                    className="bg-[#af101a] hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-md whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isAnalyzing ? 'sync' : 'auto_fix_high'}
                    </span>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                </div>
              </div>

              {/* RIGHT: DETECTED OBJECTS & ACTION PROTOCOLS */}
              <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                {/* Category Filter Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Targets' },
                    { id: 'structural', label: 'Structural' },
                    { id: 'water', label: 'Water' },
                    { id: 'fire', label: 'Fire / Thermal' },
                    { id: 'human', label: 'Civilians' },
                    { id: 'obstruction', label: 'Corridors' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedCategory(chip.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        selectedCategory === chip.id
                          ? (isCurrentSafe ? 'bg-emerald-700 text-white border-emerald-600' : 'bg-[#af101a] text-white border-[#af101a]')
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Detected Hazards List */}
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 flex-1 min-h-[200px] overflow-y-auto flex flex-col gap-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-gray-800">
                    <span className="text-xs font-mono font-bold uppercase text-gray-300">
                      {isCurrentSafe ? 'Safe Visual Baselines' : 'YOLO Targets'} ({filteredDetections.length})
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Hover to Locate</span>
                  </div>

                  {filteredDetections.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      No targets matching selected filters.
                    </div>
                  ) : (
                    filteredDetections.map((item, index) => {
                      const colors = getCategoryColor(item.category, item.threatLevel, isCurrentSafe);
                      const isHovered = hoveredBoxId === item.id;

                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredBoxId(item.id)}
                          onMouseLeave={() => setHoveredBoxId(null)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isHovered
                              ? 'bg-gray-800 border-white ring-1 ring-white/40'
                              : 'bg-gray-950/80 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="font-bold text-xs text-white flex items-center gap-1.5">
                              <span className="text-gray-500 font-mono text-[10px]">#{index + 1}</span>
                              <span className={colors.text}>{item.label}</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isCurrentSafe
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : item.threatLevel === 'Critical'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-gray-800 text-gray-300'
                              }`}
                            >
                              {(item.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                            <span>Threat: <strong className={colors.text}>{item.threatLevel}</strong></span>
                            <span>Pos: {item.box.x}%, {item.box.y}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Priority Response Directives */}
                {detectionResult && (
                  <div className={`rounded-xl p-3 border ${
                    isCurrentSafe ? 'bg-emerald-950/40 border-emerald-800/80' : 'bg-gray-900 border-gray-800'
                  }`}>
                    <h4 className="text-xs font-mono font-bold text-gray-300 uppercase mb-2 flex items-center gap-1">
                      <span className={`material-symbols-outlined text-[16px] ${isCurrentSafe ? 'text-emerald-400' : 'text-[#af101a]'}`}>
                        {isCurrentSafe ? 'check_circle' : 'bolt'}
                      </span>
                      {isCurrentSafe ? 'Routine Monitoring Directives' : 'Tactical Dispatch Actions'}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {detectionResult.recommendedActions.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <span className={`font-bold ${isCurrentSafe ? 'text-emerald-400' : 'text-[#af101a]'}`}>•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'opencv' ? (
            /* TAB 2: OPENCV AI MORPHOLOGICAL VISION LAB */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
              {/* LEFT: OPENCV REAL-TIME CANVAS PIPELINE */}
              <div className="lg:col-span-8 flex flex-col bg-black rounded-2xl border border-gray-800 overflow-hidden relative shadow-inner">
                {/* OpenCV Filter Selection Bar */}
                <div className="p-2.5 bg-gray-900/95 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs z-20">
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                    {openCvFilterOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setOpenCvMode(opt.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all whitespace-nowrap ${
                          openCvMode === opt.id
                            ? 'bg-gradient-to-r from-red-700 to-indigo-700 text-white shadow-sm ring-1 ring-white/30'
                            : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                        title={opt.desc}
                      >
                        <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {openCvMode === 'canny' && (
                    <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                      <span className="text-gray-400 font-mono text-[11px]">Crack Sensitivity:</span>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        step="5"
                        value={edgeThreshold}
                        onChange={(e) => setEdgeThreshold(parseInt(e.target.value))}
                        className="w-24 accent-[#af101a]"
                      />
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">{edgeThreshold}</span>
                    </div>
                  )}
                </div>

                {/* THE OPENCV CANVAS */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-950 p-2 select-none">
                  <canvas
                    ref={canvasRef}
                    className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full object-contain block mx-auto rounded-lg shadow-2xl border border-gray-800"
                  />
                </div>

                {/* Status Bar */}
                <div className="p-2 bg-gray-900 border-t border-gray-800 flex justify-between items-center text-[11px] text-gray-400 font-mono px-3">
                  <span>OpenCV Kernel: <strong>3x3 Sobel Convolution & Dynamic Otsu Binarization</strong></span>
                  <span className={openCvMetrics?.isSafeEnvironment ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {openCvMetrics?.isSafeEnvironment ? '✓ Scene Verified Safe' : 'Live Client-Side Processing Active'}
                  </span>
                </div>
              </div>

              {/* RIGHT: OPENCV METRICS & STRUCTURAL CRACK ANALYSIS */}
              <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
                {/* OpenCV Safety Verdict Banner */}
                {openCvMetrics && (
                  <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                    openCvMetrics.isSafeEnvironment
                      ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                      : 'bg-amber-950/60 border-amber-600 text-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {openCvMetrics.isSafeEnvironment ? 'verified' : 'warning'}
                        </span>
                        {openCvMetrics.safetyVerdict}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40">
                        {openCvMetrics.safetyConfidence}% Conf
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {openCvMetrics.verdictSummary}
                    </p>
                  </div>
                )}

                {/* OpenCV Analytics Card */}
                <div className="bg-gray-900 rounded-xl p-3.5 border border-gray-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 border-b border-gray-800 pb-2">
                    <span className="material-symbols-outlined text-indigo-400 text-[18px]">filter_vintage</span>
                    OpenCV Computer Vision Metrics
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Active Morphological Mode</span>
                      <span className="font-mono font-bold text-indigo-300 uppercase">
                        {openCvMode.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Structural Discontinuity</span>
                      <span className={`font-mono font-bold ${
                        openCvMetrics?.isSafeEnvironment ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {openCvMetrics?.structuralDiscontinuityScore || 0} / 100
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Identified Crack Segments</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {openCvMetrics?.estimatedCrackLines || 0} Vectors
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Inundated Water Surface</span>
                      <span className="font-mono font-bold text-blue-400">
                        {openCvMetrics?.inundatedPixelPercentage || 0}% of Frame
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Thermal Gradient Anomaly</span>
                      <span className="font-mono font-bold text-orange-400">
                        {openCvMetrics?.thermalAnomalyPercentage || 0}% Thermal Intensity
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-950 rounded-lg border border-gray-800">
                      <span className="text-gray-400">Rubble Texture Complexity</span>
                      <span className="font-mono font-bold text-yellow-400">
                        {openCvMetrics?.rubbleTextureComplexity || 0} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* OpenCV Filter Guide Card */}
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 space-y-2 text-xs">
                  <h5 className="font-bold text-gray-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-400">help_outline</span>
                    How OpenCV AI Detects Safety & Hazards:
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-gray-400">
                    <li>• <strong>Safe Detection:</strong> Low edge variance and balanced RGB channels verify structural integrity and absence of hazards.</li>
                    <li>• <strong>Canny Mode:</strong> Isolates dangerous shear fissures in walls, bridges, and road surfaces.</li>
                    <li>• <strong>Water Mode:</strong> Flags submerged roads to prevent vehicle & pedestrian accidents.</li>
                    <li>• <strong>Thermal JET:</strong> Locates combustion cores and active heat signatures.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : activeTab === 'metrics' ? (
            /* TAB 3: PHYSICAL IMPACT & RESOURCE ALLOCATION METRICS */
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Physical Impact Analysis Card */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">speed</span>
                    Physical Hazard & Structural Metrics
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                      <span className="text-gray-400">Residual Structural Integrity</span>
                      <span className={`font-mono font-bold ${isCurrentSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {detectionResult?.structuralIntegrityScore}% {isCurrentSafe ? '(Intact / Safe)' : 'Remaining'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                      <span className="text-gray-400">Dynamic Velocity / Spread</span>
                      <span className="font-mono font-bold text-white">
                        {detectionResult?.inundationOrSpreadVelocity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                      <span className="text-gray-400">Environmental Risk Class</span>
                      <span className={`font-mono font-bold ${isCurrentSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                        {detectionResult?.environmentalRiskLevel}
                      </span>
                    </div>

                    {detectionResult?.damageMetrics.submersionDepthMeters !== undefined && (
                      <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                        <span className="text-gray-400">Water Inundation Level</span>
                        <span className="font-mono font-bold text-blue-400">
                          {detectionResult.damageMetrics.submersionDepthMeters} meters
                        </span>
                      </div>
                    )}

                    {detectionResult?.damageMetrics.thermalCoreCelsius !== undefined && (
                      <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                        <span className="text-gray-400">Combustion Core Temperature</span>
                        <span className="font-mono font-bold text-orange-400">
                          ~{detectionResult.damageMetrics.thermalCoreCelsius}°C
                        </span>
                      </div>
                    )}

                    {detectionResult?.damageMetrics.estimatedDebrisVolumeM3 !== undefined && (
                      <div className="flex justify-between items-center p-2.5 bg-gray-950 rounded-xl border border-gray-800/80">
                        <span className="text-gray-400">Estimated Rubble Mass</span>
                        <span className="font-mono font-bold text-yellow-400">
                          {detectionResult.damageMetrics.estimatedDebrisVolumeM3} m³
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Unit Requisition Card */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]">local_shipping</span>
                    Recommended Tactical Unit Allocation
                  </h4>

                  <div className="space-y-2">
                    {detectionResult?.requiredResponseUnits && detectionResult.requiredResponseUnits.length > 0 ? (
                      detectionResult.requiredResponseUnits.map((u, i) => (
                        <div key={i} className="p-2.5 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white">{u.unit}</div>
                            <span className={`text-[10px] font-mono font-bold ${
                              u.priority.includes('P1') ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {u.priority}
                            </span>
                          </div>
                          <div className="bg-gray-800 px-3 py-1 rounded-lg text-sm font-mono font-bold text-emerald-400">
                            Qty: {u.quantity}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">Standard emergency units required.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 4: CERTIFIED AI & OPENCV DAMAGE REPORT GENERATOR */
            <div className="flex-1 flex flex-col bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden min-h-0 p-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-800 mb-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
                    {isCurrentSafe
                      ? 'Official AI & OpenCV Non-Disaster Baseline Verification Certification'
                      : 'Official AI & OpenCV Disaster Damage Assessment & Incident Certification'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Dual Neural YOLOv11 & OpenCV 4.x Morphological Inspection Protocol.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    {copiedSuccess ? 'Copied to Clipboard!' : 'Copy Report'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Print / PDF
                  </button>
                </div>
              </div>

              {/* REPORT TEXT AREA */}
              <div className="flex-1 overflow-y-auto bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                {detectionResult?.aiCertifiedReportText || 'Loading verification report...'}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-gray-800 mt-2 text-xs">
          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
            <span>Vision Core: <strong>OpenAI YOLOv11 Neural Detection + OpenCV 4.x Morphological Lab</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {report && onApplyVerification && (
              <button
                onClick={handleApplyToIncident}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {appliedSuccess ? '✅ Applied & Saved to Report' : (isCurrentSafe ? 'Save Safe Verification to Incident' : 'Save AI Verification to Incident')}
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
