import React, { useState, useMemo } from 'react';
import { ReliefLocation, SosAlert } from '../types';
import { KeralaMapComponent } from '../components/KeralaMapComponent';

interface KeralaMapViewProps {
  locations: ReliefLocation[];
  onOpenAddModal: () => void;
  onRequestHelpForCamp?: (location: ReliefLocation) => void;
  isAdmin?: boolean;
  sosAlerts?: SosAlert[];
}

const KERALA_DISTRICTS = [
  'All Districts',
  'Wayanad',
  'Ernakulam',
  'Thrissur',
  'Alappuzha',
  'Idukki',
  'Kozhikode',
  'Thiruvananthapuram',
  'Malappuram',
  'Pathanamthitta',
  'Palakkad',
  'Kannur',
  'Kottayam',
];

const FACILITY_TYPES = [
  'All Types',
  'Relief Camp',
  'Emergency Shelter',
  'Medical Post',
  'Flood High-Risk Zone',
  'Supply Hub',
];

export const KeralaMapView: React.FC<KeralaMapViewProps> = ({
  locations,
  onOpenAddModal,
  onRequestHelpForCamp,
  isAdmin = false,
  sosAlerts = [],
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<ReliefLocation | null>(
    locations[0] || null
  );

  // Quick coordinate focus presets for Kerala districts
  const districtCoords: Record<string, [number, number]> = {
    Wayanad: [11.6094, 76.0827],
    Ernakulam: [9.9816, 76.2999],
    Thrissur: [10.5276, 76.2144],
    Alappuzha: [9.4981, 76.3388],
    Idukki: [9.8500, 76.9667],
    Kozhikode: [11.2588, 75.7804],
    Thiruvananthapuram: [8.5241, 76.9366],
    Malappuram: [11.0734, 76.0740],
    Pathanamthitta: [9.2648, 76.7870],
    Palakkad: [10.7867, 76.6547],
    Kannur: [11.8745, 75.3704],
    Kottayam: [9.5916, 76.5222],
  };

  const currentCenter: [number, number] = useMemo(() => {
    if (selectedDistrict !== 'All Districts' && districtCoords[selectedDistrict]) {
      return districtCoords[selectedDistrict];
    }
    return [10.5, 76.2]; // Center of Kerala
  }, [selectedDistrict]);

  const currentZoom = selectedDistrict === 'All Districts' ? 8 : 11;

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesDistrict =
        selectedDistrict === 'All Districts' || loc.district === selectedDistrict;
      const matchesType = selectedType === 'All Types' || loc.type === selectedType;
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDistrict && matchesType && matchesSearch;
    });
  }, [locations, selectedDistrict, selectedType, searchQuery]);

  // Total summary statistics
  const totalEvacuees = useMemo(
    () => locations.reduce((sum, l) => sum + l.occupancy, 0),
    [locations]
  );
  const totalCapacity = useMemo(
    () => locations.reduce((sum, l) => sum + l.capacity, 0),
    [locations]
  );
  const hazardZonesCount = useMemo(
    () => locations.filter((l) => l.type === 'Flood High-Risk Zone').length,
    [locations]
  );
  const campsCount = useMemo(
    () => locations.filter((l) => l.type === 'Relief Camp' || l.type === 'Emergency Shelter').length,
    [locations]
  );

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-[#e4beba] p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#af101a] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#af101a] animate-ping" />
            Kerala Live Disaster Management Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Kerala Real-Time Relief Camps & Emergency Map
          </h1>
          <p className="text-sm text-[#5b403d] mt-1">
            Live geo-located relief camps, emergency shelters, medical command bases, and high-risk hazard zones across Kerala districts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto bg-[#af101a] hover:bg-[#d32f2f] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
            + Register New Camp / Shelter
          </button>
        </div>
      </div>

      {/* Kerala Emergency Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-l-4 border-l-[#10b981] border border-[#e4beba] p-4 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Active Camps & Shelters</p>
          <p className="text-3xl font-extrabold text-[#1a1c1c] mt-1">{campsCount}</p>
          <span className="text-[11px] text-[#059669] font-bold">Kerala State Network</span>
        </div>

        <div className="bg-white border-l-4 border-l-[#4c56af] border border-[#e4beba] p-4 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Evacuees Sheltered</p>
          <p className="text-3xl font-extrabold text-[#4c56af] mt-1">{totalEvacuees.toLocaleString()}</p>
          <span className="text-[11px] text-[#5b403d]">Of {totalCapacity.toLocaleString()} total capacity</span>
        </div>

        <div className="bg-white border-l-4 border-l-[#f59e0b] border border-[#e4beba] p-4 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">High-Risk Hazard Zones</p>
          <p className="text-3xl font-extrabold text-[#b06000] mt-1">{hazardZonesCount}</p>
          <span className="text-[11px] text-[#b06000] font-bold">Landslide & River Overflow</span>
        </div>

        <div className="bg-white border-l-4 border-l-[#005f7b] border border-[#e4beba] p-4 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-[#5b403d] uppercase tracking-wider">Districts Monitored</p>
          <p className="text-3xl font-extrabold text-[#005f7b] mt-1">14</p>
          <span className="text-[11px] text-[#005f7b]">24/7 Collectorate Sync</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#e4beba] rounded-xl p-3 flex flex-col lg:flex-row gap-3 items-center shadow-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403d] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search camp by name, landmark, or district (e.g. Wayanad, Aluva)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#e4beba] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#4c56af]"
          />
        </div>

        {/* District Selector */}
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="border border-[#e4beba] rounded-lg py-2 px-3 bg-[#f9f9f9] text-[#1a1c1c] text-xs font-bold min-w-[150px] outline-none"
          >
            {KERALA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d === 'All Districts' ? '📍 All Kerala Districts' : `📍 ${d} District`}
              </option>
            ))}
          </select>

          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-[#e4beba] rounded-lg py-2 px-3 bg-[#f9f9f9] text-[#1a1c1c] text-xs font-bold min-w-[150px] outline-none"
          >
            {FACILITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All Types' ? '🏢 All Facility Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map & Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="h-[520px] lg:h-[620px] w-full">
            <KeralaMapComponent
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              sosAlerts={sosAlerts}
              center={currentCenter}
              zoom={currentZoom}
            />
          </div>

          {/* Quick Map Legend */}
          <div className="bg-white p-3 rounded-lg border border-[#e4beba] flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="font-bold text-[#1a1c1c] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#4c56af]">map</span> Map Legend:
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#10b981]" /> Relief Camp
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Emergency Shelter
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#dc2626]" /> Medical Post
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#0284c7]" /> Supply Hub
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#b91c1c] animate-pulse" /> High-Risk Hazard
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Selected Location Details & List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedLocation ? (
            <div className="bg-white rounded-xl border-2 border-[#4c56af] p-5 shadow-md flex flex-col gap-4 animate-in fade-in">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-[#e4beba] pb-3">
                <div>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1 ${
                      selectedLocation.type === 'Relief Camp'
                        ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                        : selectedLocation.type === 'Emergency Shelter'
                        ? 'bg-[#e0e0ff] text-[#27308a] border border-[#959efd]'
                        : selectedLocation.type === 'Medical Post'
                        ? 'bg-[#ffdad6] text-[#93000a] border border-[#ffb3ac]'
                        : selectedLocation.type === 'Flood High-Risk Zone'
                        ? 'bg-[#b91c1c] text-white'
                        : 'bg-[#e9f7ff] text-[#004d65]'
                    }`}
                  >
                    {selectedLocation.type} • {selectedLocation.district}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#1a1c1c] leading-snug">
                    {selectedLocation.name}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    selectedLocation.status === 'Operational'
                      ? 'bg-[#10b981]/10 text-[#059669]'
                      : selectedLocation.status === 'Near Capacity'
                      ? 'bg-[#f59e0b]/10 text-[#b06000]'
                      : selectedLocation.status === 'Full'
                      ? 'bg-[#ef4444]/10 text-[#dc2626]'
                      : 'bg-[#b91c1c] text-white animate-pulse'
                  }`}
                >
                  {selectedLocation.status}
                </span>
              </div>

              {/* Occupancy Indicator if applicable */}
              {selectedLocation.capacity > 0 && (
                <div className="bg-[#f9f9f9] border border-[#e4beba] p-3 rounded-lg">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1a1c1c] mb-1.5">
                    <span>Current Occupancy</span>
                    <span>
                      {selectedLocation.occupancy} / {selectedLocation.capacity} Evacuees (
                      {Math.round((selectedLocation.occupancy / selectedLocation.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#e5e7eb] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedLocation.occupancy / selectedLocation.capacity >= 0.9
                          ? 'bg-[#ef4444]'
                          : selectedLocation.occupancy / selectedLocation.capacity >= 0.7
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#10b981]'
                      }`}
                      style={{
                        width: `${Math.min(
                          (selectedLocation.occupancy / selectedLocation.capacity) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Address & Contact */}
              <div className="space-y-2 text-xs text-[#1a1c1c]">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#af101a] text-[18px] shrink-0">
                    location_on
                  </span>
                  <span>{selectedLocation.address}</span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded border border-gray-200">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">
                      Control Officer
                    </span>
                    <span className="font-semibold">{selectedLocation.contactPerson}</span>
                  </div>

                  <a
                    href={`tel:${selectedLocation.phone}`}
                    className="bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Call Helpline
                  </a>
                </div>
              </div>

              {/* Supplies Needed */}
              {selectedLocation.suppliesNeeded.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#af101a] text-[16px]">
                      inventory_2
                    </span>
                    Urgent Supplies Requested:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLocation.suppliesNeeded.map((sup, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#ffdad6] text-[#93000a] px-2.5 py-1 rounded font-semibold border border-[#ffb3ac]"
                      >
                        • {sup}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {selectedLocation.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#005f7b] text-[16px]">
                      verified
                    </span>
                    Facility Amenities:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.amenities.map((am, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-[#e9f7ff] text-[#004d65] px-2 py-0.5 rounded border border-[#005f7b]/20"
                      >
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#4c56af] hover:bg-[#27308a] text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  Open Turn-by-Turn GPS Directions
                </a>

                {onRequestHelpForCamp && (
                  <button
                    onClick={() => onRequestHelpForCamp(selectedLocation)}
                    className="w-full bg-white border border-[#af101a] text-[#af101a] hover:bg-[#ffdad6]/40 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">campaign</span>
                    Request Supplies / Assistance for this Camp
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e4beba] p-6 text-center text-[#5b403d]">
              <span className="material-symbols-outlined text-[36px] text-gray-400 mb-2">
                touch_app
              </span>
              <p className="text-sm font-semibold">Click any map marker to view camp details</p>
            </div>
          )}

          {/* List of Facilities in Current Filter */}
          <div className="bg-white rounded-xl border border-[#e4beba] p-4 flex flex-col gap-3 shadow-xs max-h-[400px] overflow-y-auto">
            <h3 className="text-sm font-bold text-[#1a1c1c] flex items-center justify-between border-b pb-2">
              <span>Kerala Relief Facilities</span>
              <span className="text-xs text-[#5b403d] font-normal">
                {filteredLocations.length} Locations Found
              </span>
            </h3>

            <div className="space-y-2">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected
                        ? 'bg-[#e0e0ff]/50 border-[#4c56af] shadow-xs'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1a1c1c]">{loc.name}</h4>
                      <p className="text-[11px] text-[#5b403d]">
                        {loc.district} • {loc.type}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        loc.status === 'Operational'
                          ? 'bg-[#10b981]/20 text-[#059669]'
                          : loc.status === 'Alert / Hazard'
                          ? 'bg-[#b91c1c] text-white'
                          : 'bg-[#f59e0b]/20 text-[#b06000]'
                      }`}
                    >
                      {loc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
