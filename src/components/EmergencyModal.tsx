import React, { useState, useEffect } from 'react';
import { saveHelpRequestToSupabase } from '../lib/supabase';
import { HelpRequest } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHelpRequestSubmitted?: (req: HelpRequest) => void;
  initialTab?: 'call' | 'request';
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onHelpRequestSubmitted,
  initialTab = 'call',
}) => {
  const [activeTab, setActiveTab] = useState<'call' | 'request'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [need, setNeed] = useState('Medical & First Aid');
  const [peopleCount, setPeopleCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitSos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    setIsSubmitting(true);

    const newRequest: HelpRequest = {
      id: `sos-${Date.now()}`,
      requesterName: name,
      category: need,
      location,
      urgentNeed: `${need}: ${phone ? `Contact: ${phone}` : 'Immediate Response Needed'}`,
      status: 'Pending',
      peopleCount,
      timeAgo: 'Just now',
    };

    const res = await saveHelpRequestToSupabase(newRequest);
    setIsSubmitting(false);
    setSubmitted(true);

    if (onHelpRequestSubmitted) {
      onHelpRequestSubmitted(newRequest);
    }

    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setLocation('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border-t-4 border-[#af101a] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#af101a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px] fill" data-weight="fill">
                emergency
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1c]">
                Emergency Assistance & Hotline
              </h3>
              <p className="text-xs text-[#5b403d]">
                Control Room Dispatch • Live Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'call'
                ? 'border-[#af101a] text-[#af101a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📞 Emergency Hotlines
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'request'
                ? 'border-[#af101a] text-[#af101a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📝 Submit Instant Help Request
          </button>
        </div>

        {activeTab === 'call' ? (
          <>
            <div className="bg-[#ffdad6]/50 border border-[#ffb3ac] p-3 rounded-lg mb-4 text-xs text-[#93000a]">
              <strong>Immediate Danger to Life or Safety?</strong>{' '}
              If you or someone near you is in immediate physical risk, contact local emergency dispatch or call directly below.
            </div>

            <div className="space-y-3 mb-6">
              <a
                href="tel:112"
                className="w-full bg-[#af101a] hover:bg-[#d32f2f] text-white py-3 px-4 rounded-lg font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                Call 112 (Kerala Emergency Services)
              </a>

              <a
                href="tel:1077"
                className="w-full bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#1a1c1c] border border-[#e4beba] py-2.5 px-4 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-[#005f7b]">support_agent</span>
                District Collectorate Helpline (1077)
              </a>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitSos} className="space-y-3">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-lg text-center font-bold text-sm">
                ✅ Help Request Saved Successfully!
                <p className="text-xs font-normal text-emerald-600 mt-1">
                  Dispatchers have been notified.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Full Name / Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                    Exact Location / Camp / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chooralmala Relief Camp, Wayanad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      Primary Need *
                    </label>
                    <select
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                    >
                      <option value="Medical & First Aid">Medical & First Aid</option>
                      <option value="Food & Drinking Water">Food & Drinking Water</option>
                      <option value="Boat / Rescue Evacuation">Boat / Rescue Evacuation</option>
                      <option value="Blankets & Shelter Kits">Blankets & Shelter Kits</option>
                      <option value="Baby Food & Hygiene">Baby Food & Hygiene</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                      People Affected
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(Number(e.target.value))}
                      className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#af101a] hover:bg-[#d32f2f] text-white py-2.5 rounded font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting 
                    ? 'Submitting Request...' 
                    : 'Submit Help Request'}
                </button>
              </>
            )}
          </form>
        )}

        <div className="text-xs text-center text-[#5b403d] border-t border-gray-100 pt-3 mt-3">
          Dispatcher online 24/7 • System active
        </div>
      </div>
    </div>
  );
};
