import React, { useState } from 'react';
import { ReliefLocation } from '../types';

interface AddKeralaCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (location: ReliefLocation) => void;
}

export const AddKeralaCampModal: React.FC<AddKeralaCampModalProps> = ({
  isOpen,
  onClose,
  onAddLocation,
}) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Wayanad');
  const [type, setType] = useState<ReliefLocation['type']>('Relief Camp');
  const [lat, setLat] = useState<number>(11.6094);
  const [lng, setLng] = useState<number>(76.0827);
  const [capacity, setCapacity] = useState<number>(500);
  const [occupancy, setOccupancy] = useState<number>(120);
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [address, setAddress] = useState('');
  const [suppliesText, setSuppliesText] = useState('Drinking Water, Blankets, Food Packs');
  const [amenitiesText, setAmenitiesText] = useState('24/7 Medical Team, Clean Sanitation, Food Kitchen');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    let status: ReliefLocation['status'] = 'Operational';
    if (type === 'Flood High-Risk Zone') {
      status = 'Alert / Hazard';
    } else if (capacity > 0) {
      const ratio = occupancy / capacity;
      if (ratio >= 0.95) status = 'Full';
      else if (ratio >= 0.75) status = 'Near Capacity';
    }

    const newLoc: ReliefLocation = {
      id: `kl-${Date.now()}`,
      name,
      district,
      type,
      lat: Number(lat),
      lng: Number(lng),
      capacity: Number(capacity),
      occupancy: Number(occupancy),
      status,
      contactPerson: contactPerson || 'District Control Room',
      phone: phone || '+91 1077',
      address,
      suppliesNeeded: suppliesText.split(',').map((s) => s.trim()).filter(Boolean),
      amenities: amenitiesText.split(',').map((a) => a.trim()).filter(Boolean),
      lastUpdated: 'Just now',
    };

    onAddLocation(newLoc);
    onClose();
    // Reset defaults
    setName('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#e4beba]">
        <div className="flex justify-between items-center mb-4 border-b border-[#e4beba] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[24px]">add_location_alt</span>
            <h3 className="text-lg font-bold text-[#1a1c1c]">Register Kerala Relief Camp / Shelter</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Facility Name <span className="text-[#af101a]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., St. Mary's School Flood Relief Camp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Wayanad">Wayanad</option>
                <option value="Ernakulam">Ernakulam (Kochi)</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Alappuzha">Alappuzha (Kuttanad)</option>
                <option value="Idukki">Idukki</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Malappuram">Malappuram</option>
                <option value="Pathanamthitta">Pathanamthitta</option>
                <option value="Palakkad">Palakkad</option>
                <option value="Kannur">Kannur</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Kasaragod">Kasaragod</option>
                <option value="Kollam">Kollam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Facility Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Relief Camp">Relief Camp</option>
                <option value="Emergency Shelter">Emergency Shelter</option>
                <option value="Medical Post">Medical Post</option>
                <option value="Flood High-Risk Zone">Flood High-Risk Zone</option>
                <option value="Supply Hub">Supply Hub</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Capacity</label>
              <input
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Current Occupancy</label>
              <input
                type="number"
                min="0"
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Full Street Address <span className="text-[#af101a]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ground Floor, Govt Model HSS Campus, Main Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Officer In Charge</label>
              <input
                type="text"
                placeholder="e.g., Tahsildar / Camp In-Charge"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Helpline Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Urgent Supplies Needed (Comma-separated)
            </label>
            <input
              type="text"
              value={suppliesText}
              onChange={(e) => setSuppliesText(e.target.value)}
              placeholder="e.g., Blankets, Drinking Water, Baby Food"
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Available Facilities / Amenities (Comma-separated)
            </label>
            <input
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="e.g., Medical Team, Clean Sanitation, Power Generator"
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#e4beba]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e4beba] text-sm font-semibold text-[#5b403d] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#af101a] hover:bg-[#d32f2f] text-white text-sm font-bold rounded shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_location</span>
              Add to Kerala Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
