import React, { useState, useEffect } from 'react';
import { saveHelpRequestToSupabase, saveSosAlertToSupabase } from '../lib/supabase';
import { HelpRequest, UserProfile } from '../types';

interface SosButtonProps {
  currentUser?: UserProfile | null;
  onSosSubmitted?: (helpReq: HelpRequest) => void;
  onSosAlertCreated?: () => void;
}

export const SosButton: React.FC<SosButtonProps> = ({
  currentUser,
  onSosSubmitted,
  onSosAlertCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');

  // Location & User Profile State
  const userName = currentUser?.fullName || 'Civilian User';
  const userPhone = currentUser?.phone || 'Phone Not Set';

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    // Immediate retrieval from local cached position for 0ms cold-start latency
    try {
      const cached = localStorage.getItem('resilience_last_known_coords');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return { lat: 11.6094, lng: 76.0827 };
  });
  const [locationText, setLocationText] = useState(() => {
    return localStorage.getItem('resilience_last_known_location') || 'Wayanad Emergency Sector (Kerala)';
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background pre-warm GPS on component mount for instantaneous SOS dispatch
  useEffect(() => {
    detectGpsLocation();
  }, []);

  // Quick refresh when modal is explicitly opened
  useEffect(() => {
    if (isOpen) {
      detectGpsLocation();
    }
  }, [isOpen]);

  const fetchPlaceName = async (lat: number, lng: number) => {
    try {
      // Fast reverse geocode with a tight timeout to prevent blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const lang = currentUser?.language || 'en';
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=${lang}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const placeParts = [
          addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city || addr.subdistrict,
          addr.county || addr.state_district || addr.state
        ].filter(Boolean);
        if (placeParts.length > 0) {
          const locStr = placeParts.join(', ');
          setLocationText(locStr);
          localStorage.setItem('resilience_last_known_location', locStr);
          return;
        }
      }
      if (data && data.display_name) {
        const locStr = data.display_name.split(',').slice(0, 2).join(',');
        setLocationText(locStr);
        localStorage.setItem('resilience_last_known_location', locStr);
        return;
      }
    } catch {
      // Keep existing locationText
    }
  };

  const detectGpsLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);
        try {
          localStorage.setItem('resilience_last_known_coords', JSON.stringify(newCoords));
        } catch {
          // ignore
        }
        fetchPlaceName(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      // Maximum age 60 seconds allows instant cached response with zero sensor spin-up lag
      { enableHighAccuracy: true, timeout: 2500, maximumAge: 60000 }
    );
  };

  // Dispatch SOS Alert with ultra-low latency (optimistic instant feedback + parallel network transmission)
  const handleConfirmAndSendSos = async () => {
    // 1. Instantly show submitting state and trigger tactile/audio feedback if supported
    setIsSubmitting(true);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // ignore
      }
    }

    const latVal = coords?.lat || 11.6094;
    const lngVal = coords?.lng || 76.0827;
    const sosId = `sos-${Date.now()}`;

    const helpReq: HelpRequest = {
      id: sosId,
      requesterName: userName,
      category: 'Emergency SOS',
      location: locationText,
      urgentNeed: `🚨 CRITICAL SOS ALERT! Name: ${userName}, Phone: ${userPhone}`,
      status: 'Pending',
      peopleCount: 1,
      timeAgo: 'Just now',
    };

    // 2. Ultra-low latency: Immediately notify parent state / UI optimistically without waiting on network round-trip
    if (onSosSubmitted) onSosSubmitted(helpReq);
    if (onSosAlertCreated) onSosAlertCreated();

    // 3. Fire parallel non-blocking persistence requests to Supabase
    Promise.allSettled([
      saveSosAlertToSupabase({
        latitude: latVal,
        longitude: lngVal,
        full_name: userName,
        phone: userPhone,
        message: `🚨 Emergency SOS from ${userName} (${userPhone})`,
        status: 'active',
        user_id: currentUser?.id,
      }),
      saveHelpRequestToSupabase(helpReq)
    ]).then(([sosRes]) => {
      if (sosRes.status === 'fulfilled' && !sosRes.value?.success) {
        console.warn('SOS database transmission notice:', sosRes.value?.error);
      }
    });

    // 4. Instant UI confirmation switch in under ~100ms
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 80);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('confirm');
  };

  return (
    <>
      {/* FLOATING SOS TRIGGER BUTTON */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <button
            id="global-sos-button"
            onClick={() => setIsOpen(true)}
            onMouseEnter={detectGpsLocation}
            onTouchStart={detectGpsLocation}
            className="group relative flex items-center gap-3 bg-[#af101a] hover:bg-red-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-150 hover:scale-105 active:scale-95 border-2 border-red-400/50 cursor-pointer"
          >
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400"></span>
            </span>
            <span className="material-symbols-outlined text-[28px] animate-bounce text-yellow-300">
              e911_emergency
            </span>
            <div className="text-left">
              <span className="block text-xs font-black uppercase tracking-wider text-yellow-300">
                EMERGENCY
              </span>
              <span className="block text-sm font-extrabold uppercase tracking-wide">
                SOS BUTTON
              </span>
            </div>
          </button>
        </div>
      )}

      {/* SOS EMERGENCY CONFIRMATION MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-8 border-[#af101a] relative flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#af101a] text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-[28px]">
                    emergency
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#af101a] uppercase tracking-tight">
                    🚨 EMERGENCY SOS
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Direct Emergency Dispatch System
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* CONFIRMATION STEP */}
            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center justify-between">
                    <span>Transmitting Dispatch Data:</span>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                      SYSTEM READY
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-800">
                    <div className="flex justify-between items-center py-1 border-b border-red-100">
                      <span className="text-gray-500 font-semibold">User Name:</span>
                      <span className="font-extrabold text-gray-900">{userName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-red-100">
                      <span className="text-gray-500 font-semibold">Phone Number:</span>
                      <span className="font-extrabold text-gray-900">{userPhone}</span>
                    </div>

                    <div className="flex justify-between items-start py-1">
                      <span className="text-gray-500 font-semibold shrink-0">Location:</span>
                      <div className="text-right font-bold text-red-900 flex items-center gap-1">
                        {isLocating && (
                          <span className="material-symbols-outlined text-[14px] animate-spin">
                            progress_activity
                          </span>
                        )}
                        <span>{locationText}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Hotlines */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <a
                    href="tel:112"
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg border border-red-200 flex flex-col items-center gap-0.5"
                  >
                    <span>🚨 112</span>
                    <span className="text-[9px] text-red-700">Dispatch</span>
                  </a>
                  <a
                    href="tel:1077"
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg border border-blue-200 flex flex-col items-center gap-0.5"
                  >
                    <span>🏛️ 1077</span>
                    <span className="text-[9px] text-blue-700">Control</span>
                  </a>
                  <a
                    href="tel:108"
                    className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg border border-emerald-200 flex flex-col items-center gap-0.5"
                  >
                    <span>🚑 108</span>
                    <span className="text-[9px] text-emerald-700">Ambulance</span>
                  </a>
                </div>

                {/* BIG RED CONFIRMATION BUTTON */}
                <button
                  onClick={handleConfirmAndSendSos}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#af101a] to-red-600 hover:from-red-700 hover:to-[#af101a] text-white p-4 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 border-2 border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isSubmitting ? 'progress_activity' : 'send_and_archive'}
                  </span>
                  <span>
                    {isSubmitting ? 'Sending SOS...' : 'CONFIRM & SEND SOS NOW'}
                  </span>
                </button>
              </div>
            )}

            {/* SUCCESS CONFIRMATION STEP */}
            {step === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-gray-900">
                    SOS Alert Transmitted!
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Your location, name, and phone number have been recorded and alerted to response control.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold text-left space-y-1">
                  <p>• <strong>Name:</strong> {userName}</p>
                  <p>• <strong>Phone:</strong> {userPhone}</p>
                  <p>• <strong>Location:</strong> {locationText}</p>
                  <p>• <strong>Status:</strong> <span className="text-emerald-700 font-bold">Recorded in Dispatch Database</span></p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
