import React, { useState } from 'react';
import { AlertItem, KERALA_DISTRICTS } from '../types';

interface IssueAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAlert: (newAlert: AlertItem) => void;
}

export const IssueAlertModal: React.FC<IssueAlertModalProps> = ({ isOpen, onClose, onAddAlert }) => {
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState(KERALA_DISTRICTS[0]);
  const [specificArea, setSpecificArea] = useState('');
  const [severity, setSeverity] = useState<'code-red' | 'warning' | 'info'>('code-red');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fullRegion = specificArea.trim() ? `${specificArea}, ${district}` : `${district} District`;

    const newAlert: AlertItem = {
      id: `kl-alt-${Date.now()}`,
      title: `[Emergency Alert] ${title}`,
      severity,
      region: fullRegion,
      state: 'Kerala',
      agency: 'State Disaster Control / KSDMA',
      timeAgo: 'Just now',
      description,
      sourceUrl: 'https://sdma.kerala.gov.in/'
    };

    onAddAlert(newAlert);
    setTitle('');
    setSpecificArea('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border-t-4 border-[#af101a]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[24px]">campaign</span>
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1c]">Issue Kerala Emergency Alert</h3>
              <p className="text-[11px] text-gray-500">Official Dispatch System • State of Kerala Only</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Alert Title / Warning Message <span className="text-[#af101a]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Flash flood warning for low-lying riverbanks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#af101a]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Kerala District <span className="text-[#af101a]">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#af101a]/30"
              >
                {KERALA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#af101a]/30"
              >
                <option value="code-red">Code Red (Critical)</option>
                <option value="warning">Warning (High)</option>
                <option value="info">Advisory / Information</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Specific Area / Taluk (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chooralmala, Meppadi, Aluva Bank"
              value={specificArea}
              onChange={(e) => setSpecificArea(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#af101a]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Broadcasting Instructions & Advisories
            </label>
            <textarea
              rows={3}
              placeholder="Detailed instructions for residents, shelter locations, evacuation routes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#af101a]/30"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e4beba] text-sm font-semibold text-[#5b403d] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#af101a] hover:bg-[#d32f2f] text-white text-sm font-bold rounded flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Broadcast Kerala Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
