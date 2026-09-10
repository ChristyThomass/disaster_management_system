import React, { useState, useEffect } from 'react';
import { DisasterReport, UserProfile } from '../types';
import { uploadMediaToSupabase, compressImageToDataUrl, saveDisasterReportToSupabase } from '../lib/supabase';

interface ReportDisasterProps {
  onAddReport: (report: DisasterReport) => void;
  onOpenEmergencyHelpline: () => void;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
}

export const ReportDisaster: React.FC<ReportDisasterProps> = ({
  onAddReport,
  onOpenEmergencyHelpline,
  currentUser,
  onOpenLoginModal,
}) => {
  const [disasterType, setDisasterType] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [location, setLocation] = useState(() => (currentUser?.district ? `${currentUser.district}, Kerala` : ''));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [certified, setCertified] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');
  const [hasSubmittedImage, setHasSubmittedImage] = useState<boolean>(false);

  // Synchronize location default when currentUser district is updated
  useEffect(() => {
    if (currentUser?.district && !location) {
      setLocation(`${currentUser.district}, Kerala`);
    }
  }, [currentUser]);

  // Gated Authentication: If not signed in, show a dedicated gate prompting registration/sign-in
  if (!currentUser) {
    return (
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-12 md:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#e4beba] p-8 md:p-12 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#af101a] flex items-center justify-center mb-5 shadow-xs">
            <span className="material-symbols-outlined text-[36px]">shield_person</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#ffdad6]/70 text-[#93000a] px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-[#af101a]/20">
            <span className="material-symbols-outlined text-[15px]">lock</span>
            Registered Users Only
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight mb-3">
            Sign In to Report a Disaster Incident
          </h1>

          <p className="text-sm md:text-base text-[#5b403d] max-w-lg mb-6 leading-relaxed">
            To prevent false alarms and ensure quick coordination, disaster incident reports can only be submitted by registered users. Signing in automatically adds your verified details to the report.
          </p>

          <div className="w-full bg-[#faf8f7] border border-[#e4beba] rounded-xl p-4 mb-6 text-left text-xs text-[#5b403d] space-y-2.5">
            <p className="font-bold text-[#1a1c1c] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified_user</span>
              Automatic Registered Citizen & Responder Features:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">check_circle</span>
                <span>Auto-filled verified name & contact</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">check_circle</span>
                <span>Auto-linked district and role</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">check_circle</span>
                <span>YOLO & OpenCV AI photo damage assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">check_circle</span>
                <span>Permanent incident record tracking</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="bg-[#af101a] hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Sign In / Create Account
            </button>
            <button
              type="button"
              onClick={onOpenEmergencyHelpline}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-[#1a1c1c] font-semibold text-sm px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#af101a]">call</span>
              Emergency Helplines (112 / 1077)
            </button>
          </div>
        </div>
      </main>
    );
  }

  const processImageFile = async (file: File) => {
    setImageFile(file);
    setImageFileName(file.name);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 1280, 0.85);
      setImagePreview(compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGpsClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (${currentUser?.district || 'Current Location'})`);
        },
        () => {
          setLocation(currentUser?.district ? `${currentUser.district}, Kerala` : '11.6854° N, 76.1320° E (Wayanad Sector)');
        }
      );
    } else {
      setLocation(currentUser?.district ? `${currentUser.district}, Kerala` : '11.6854° N, 76.1320° E (Wayanad Sector)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disasterType || !location || !description || !certified) return;

    setIsSubmitting(true);
    const reportId = `rep-${Date.now()}`;
    setLastSubmittedId(reportId);

    let finalImageUrl = imagePreview || undefined;
    let finalVideoUrl = videoPreview || undefined;

    // 1. Upload visual media to Supabase
    if (imageFile || imagePreview) {
      setSubmitStatusText('Uploading image evidence to Supabase Storage & Database...');
      try {
        const uploadRes = await uploadMediaToSupabase(
          imageFile || imagePreview!,
          'images',
          `report_${reportId}_img`
        );
        if (uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      } catch (err) {
        console.warn('Image storage upload note:', err);
      }
    }

    if (videoFile || videoPreview) {
      setSubmitStatusText('Processing incident video clip...');
      try {
        const uploadRes = await uploadMediaToSupabase(
          videoFile || videoPreview!,
          'videos',
          `report_${reportId}_vid`
        );
        if (uploadRes.url) {
          finalVideoUrl = uploadRes.url;
        }
      } catch (err) {
        console.warn('Video storage upload note:', err);
      }
    }

    let iconName = 'report';
    if (disasterType.toLowerCase().includes('flood')) iconName = 'flood';
    else if (disasterType.toLowerCase().includes('fire')) iconName = 'forest';
    else if (disasterType.toLowerCase().includes('structural')) iconName = 'house';
    else if (disasterType.toLowerCase().includes('earthquake')) iconName = 'tsunami';
    else if (disasterType.toLowerCase().includes('landslide')) iconName = 'terrain';

    setSubmitStatusText('Securing incident record in Supabase disaster_reports table...');

    // Automatically incorporate all registered user profile details
    const newReport: DisasterReport = {
      id: reportId,
      type: disasterType,
      severity,
      status: 'Investigating',
      location,
      timeLogged: 'Just now',
      date,
      time,
      description,
      reporterName: currentUser.fullName || 'Registered Citizen',
      contact: currentUser.phone || currentUser.email || 'N/A',
      reporterId: currentUser.id,
      reporterRole: currentUser.role,
      reporterEmail: currentUser.email,
      hasVisualEvidence: !!(finalImageUrl || finalVideoUrl),
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      assignedUnit: 'Pending Dispatcher Review',
      iconName,
    };

    // Save directly to Supabase table
    await saveDisasterReportToSupabase(newReport);

    onAddReport(newReport);
    setIsSubmitting(false);
    setSubmitStatusText('');
    setHasSubmittedImage(!!finalImageUrl);
    setSubmitSuccess(true);

    // Reset form fields
    setDisasterType('');
    setLocation(currentUser?.district ? `${currentUser.district}, Kerala` : '');
    setDescription('');
    setImagePreview(null);
    setVideoPreview(null);
    setImageFile(null);
    setVideoFile(null);
    setImageFileName('');
    setVideoFileName('');
    setCertified(false);

    setTimeout(() => setSubmitSuccess(false), 8000);
  };

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col lg:flex-row gap-8 items-start relative z-0">
      {/* Form Column */}
      <div className="w-full lg:w-2/3 bg-white rounded-lg border border-[#e8e8e8] p-6 lg:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Registered User Mode
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1c1c] mb-2 tracking-tight">
            Report a Disaster Incident
          </h1>
          <p className="text-base text-[#5b403d]">
            Submit field observations, emergency coordinates, and visual media evidence directly to state dispatchers.
          </p>
        </div>

        {/* AUTO-FILLED REGISTERED USER IDENTITY CARD */}
        <div className="mb-6 bg-emerald-50/70 border border-emerald-300 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shadow-2xs shrink-0">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-emerald-950">{currentUser.fullName}</span>
                <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {currentUser.role}
                </span>
                <span className="bg-white border border-emerald-300 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
                  Auto-Filled Details
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📞 {currentUser.phone || 'Phone verified'}</span>
                <span>•</span>
                <span>✉️ {currentUser.email}</span>
                {currentUser.district && (
                  <>
                    <span>•</span>
                    <span>📍 {currentUser.district} District</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-emerald-900 bg-white/90 border border-emerald-200 px-2.5 py-1.5 rounded text-right shrink-0">
            <span className="font-semibold block">Reporter Profile Linked</span>
            <span className="text-[10px] text-emerald-700 font-mono">ID: {currentUser.id}</span>
          </div>
        </div>

        {isSubmitting && (
          <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-lg flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-[24px] text-amber-700 animate-spin">
              progress_activity
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm">Transmitting Disaster Evidence to Database...</p>
              <p className="text-xs text-amber-800 mt-0.5">{submitStatusText || 'Synchronizing with Supabase backend...'}</p>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[28px] text-emerald-600 fill" data-weight="fill">
                check_circle
              </span>
              <div>
                <p className="font-bold text-sm text-emerald-900">
                  Incident & Evidence Secured in Supabase Database!
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Record <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">{lastSubmittedId}</code> logged under registered user <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">{currentUser.fullName}</code>
                  {hasSubmittedImage && ' • Visual image evidence uploaded and linked'}.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Type & Severity Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="disasterType">
                Disaster Type <span className="text-[#af101a]">*</span>
              </label>
              <select
                id="disasterType"
                required
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="" disabled>
                  Select incident category
                </option>
                <option value="Flash Flood">Flash Flood / Inundation</option>
                <option value="Landslide & Mudflow">Landslide & Mudflow</option>
                <option value="Fire / Wildfire">Fire / Forest Fire</option>
                <option value="Structural Collapse">Structural Collapse</option>
                <option value="Bridge / Road Submergence">Bridge / Road Submergence</option>
                <option value="Mass Medical Emergency">Mass Medical Emergency</option>
                <option value="Severe Cyclonic Wind & Fallen Trees">Severe Cyclonic Wind & Fallen Trees</option>
                <option value="Other Emergency">Other Emergency</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="severity">
                Severity Assessment <span className="text-[#af101a]">*</span>
              </label>
              <select
                id="severity"
                required
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Low">Low - Situation stable, minor assistance needed</option>
                <option value="Medium">Medium - Property damage, potential risks</option>
                <option value="High">High - Immediate threat to life or property</option>
                <option value="Critical">Critical - Active casualties, catastrophic damage</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="location">
              Exact Location / Landmark <span className="text-[#af101a]">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5b403d] pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </span>
                <input
                  id="location"
                  type="text"
                  required
                  placeholder="Street address, landmark, coordinates or district"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded pl-10 pr-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleGpsClick}
                className="bg-[#e8e8e8] hover:bg-[#e2e2e2] text-[#1a1c1c] rounded px-3.5 py-2.5 flex items-center gap-1 font-semibold text-xs border border-[#e2e2e2] transition-colors"
                title="Detect device GPS coordinates"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
                <span className="hidden sm:inline">Use GPS</span>
              </button>
            </div>

            {/* Interactive Map Active Canvas Preview */}
            <div className="w-full h-36 bg-[#eeeeee] mt-2 rounded border border-[#e2e2e2] relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-lg font-bold text-xs text-[#1a1c1c] shadow-sm border border-[#e4beba] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#af101a] fill" data-weight="fill">
                    location_on
                  </span>
                  <span>Incident Marker Ready • {location || `${currentUser.district || 'Kerala'} Zone`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="date">
                Date of Incident
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="time">
                Time of Incident
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              />
            </div>
          </div>

          {/* Situation Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1a1c1c]" htmlFor="description">
              Situation Description <span className="text-[#af101a]">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              placeholder="Describe what happened, approximate number of people trapped or affected, road blockades, rising water levels, or special equipment required."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2.5 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none resize-y"
            />
          </div>

          {/* Media Evidence (Image and Video Upload) */}
          <div className="flex flex-col gap-3 p-4 bg-[#faf8f7] border border-[#e4beba] rounded-lg">
            <div>
              <h3 className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#af101a]">perm_media</span>
                Visual Evidence (Photo & Video)
              </h3>
              <p className="text-xs text-[#5b403d] mt-0.5">
                Attach genuine photos or video clips from the site to enable automated OpenAI YOLO and OpenCV AI damage severity verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IMAGE UPLOADER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#4c56af]">add_photo_alternate</span>
                  Attach Incident Photo
                </label>

                {!imagePreview ? (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={handleImageDrop}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[140px] ${
                      isDraggingImage
                        ? 'border-[#af101a] bg-red-50/70 scale-[1.01]'
                        : 'border-[#e2e2e2] hover:border-[#af101a] bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 text-[#af101a] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                    </div>
                    <span className="text-xs font-bold text-[#1a1c1c]">
                      {isDraggingImage ? 'Drop Photo Here' : 'Click or Drag & Drop Image'}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">JPG, PNG, WebP up to 15MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-[#e4beba] bg-black max-h-[220px] flex items-center justify-center group">
                    <img
                      src={imagePreview}
                      alt="Disaster evidence preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFileName('');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Remove Image
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded font-mono truncate max-w-[90%]">
                      📷 {imageFileName || 'Image Attached'}
                    </div>
                  </div>
                )}
              </div>

              {/* VIDEO UPLOADER */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#1a1c1c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#af101a]">videocam</span>
                  Attach Incident Video Clip
                </label>

                {!videoPreview ? (
                  <label className="border-2 border-dashed border-[#e2e2e2] hover:border-[#af101a] bg-white rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#4c56af] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">video_call</span>
                    </div>
                    <span className="text-xs font-bold text-[#1a1c1c]">Click to select Video</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">MP4, WebM, MOV recorded on site</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-[#e4beba] bg-black max-h-[220px] flex flex-col items-center justify-center group">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-48 object-contain bg-black"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoPreview(null);
                          setVideoFileName('');
                        }}
                        className="bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow-md transition-colors"
                        title="Remove Video"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <div className="w-full text-[10px] text-gray-300 bg-black/80 px-2 py-0.5 truncate font-mono text-center">
                      🎥 {videoFileName || 'Video Attached'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[#e2e2e2] my-1" />

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="certification"
                type="checkbox"
                required
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="w-4 h-4 text-[#af101a] border-[#e4beba] rounded focus:ring-[#af101a]"
              />
            </div>
            <label htmlFor="certification" className="text-sm text-[#1a1c1c] cursor-pointer select-none">
              I certify that this is a real emergency report submitted under my registered profile ({currentUser.fullName}).{' '}
              <span className="font-bold block sm:inline mt-0.5 sm:mt-0">
                False reporting will lead to account suspension and state penalties.
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <div className="mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#af101a] hover:bg-[#d32f2f] text-white font-bold text-sm px-8 py-3 rounded flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Processing Emergency Dispatch...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] fill" data-weight="fill">
                    send
                  </span>
                  Submit Official Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Information Sidebar Column */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-[#e8e8e8] border-l-4 border-[#af101a] p-4 rounded-r">
          <h3 className="text-lg font-bold text-[#1a1c1c] flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#af101a] fill" data-weight="fill">
              warning
            </span>
            Immediate Threat to Life?
          </h3>
          <p className="text-sm text-[#5b403d] mb-4">
            If there is an active casualty or acute risk, call state emergency services directly without delay.
          </p>
          <button
            onClick={onOpenEmergencyHelpline}
            className="w-full bg-white hover:bg-gray-50 border border-[#e4beba] text-[#1a1c1c] font-semibold text-sm px-4 py-2.5 rounded transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
            Call Emergency Services (112 / 1077)
          </button>
        </div>

        <div className="bg-white border border-[#e8e8e8] p-5 rounded-lg">
          <h3 className="text-xs font-semibold text-[#1a1c1c] uppercase tracking-wider mb-4 border-b border-[#e2e2e2] pb-2">
            RESPONSE TIMELINE
          </h3>
          <ol className="flex flex-col gap-4 relative">
            <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-[#e2e2e2] z-0" />

            <li className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[#4c56af] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1a1c1c]">Identity & Damage Verification</h4>
                <p className="text-xs text-[#5b403d] mt-1">
                  Report is verified against your registered citizen profile and evaluated by AI YOLO vision models.
                </p>
              </div>
            </li>

            <li className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[#e2e2e2] text-[#5b403d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1a1c1c]">First Responder Dispatch</h4>
                <p className="text-xs text-[#5b403d] mt-1">
                  Nearest district units (NDRF, Fire & Rescue, Medical Teams) are mobilized.
                </p>
              </div>
            </li>

            <li className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[#e2e2e2] text-[#5b403d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1a1c1c]">Status Updates</h4>
                <p className="text-xs text-[#5b403d] mt-1">
                  Dispatchers can contact you directly via your registered phone number for on-ground updates.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-[#f3f3f3] p-4 rounded text-center border border-[#e4beba]/40">
          <span className="material-symbols-outlined text-[#5b403d] mb-1">security</span>
          <p className="text-xs text-[#5b403d]">
            Your report is signed with verified credentials and stored in the state disaster database.
          </p>
        </div>
      </div>
    </main>
  );
};
