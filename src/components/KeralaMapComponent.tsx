import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ReliefLocation, SosAlert } from '../types';

interface KeralaMapComponentProps {
  locations: ReliefLocation[];
  selectedLocation: ReliefLocation | null;
  onSelectLocation: (location: ReliefLocation) => void;
  sosAlerts?: SosAlert[];
  center?: [number, number];
  zoom?: number;
}

export const KeralaMapComponent: React.FC<KeralaMapComponentProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  sosAlerts = [],
  center = [10.5, 76.2], // Center of Kerala
  zoom = 8,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Helper to fetch readable location name via reverse geocoding
  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const placeParts = [
          addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city || addr.subdistrict,
          addr.county || addr.state_district || addr.state
        ].filter(Boolean);
        if (placeParts.length > 0) {
          setUserLocationName(placeParts.join(', '));
          return;
        }
      }
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        setUserLocationName(parts.slice(0, 2).join(','));
        return;
      }
    } catch {
      // Fallback
    }
    setUserLocationName('Kerala Sector');
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: center as L.LatLngExpression,
        zoom: zoom,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles with high quality rendering
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Kerala Disaster Management Cell',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
      userLocationLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Clean up map on unmount
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Locate Current GPS Position
  const handleLocateMe = () => {
    setIsLocating(true);
    setLocateError(null);

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          setIsLocating(false);
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([latitude, longitude], 14, { animate: true });
          }
        },
        async () => {
          // Fallback to IP geolocation
          try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              setUserLocation({ lat: data.latitude, lng: data.longitude, accuracy: 5000 });
              setIsLocating(false);
              if (leafletMapRef.current) {
                leafletMapRef.current.setView([data.latitude, data.longitude], 12, { animate: true });
              }
              return;
            }
          } catch {
            // IP fallback failed
          }
          setIsLocating(false);
          setLocateError('Unable to acquire GPS location. Please check browser permissions.');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          setIsLocating(false);
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([latitude, longitude], 15, { animate: true });
          }
        },
        () => {
          tryLowAccuracy();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      tryLowAccuracy();
    }
  };

  // Trigger location reverse geocoding when userLocation is set
  useEffect(() => {
    if (userLocation) {
      fetchLocationName(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  // Render User Location Pin & Radius Circle
  useEffect(() => {
    if (!userLocationLayerRef.current) return;
    userLocationLayerRef.current.clearLayers();

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; background-color: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: pulse-user 1.6s infinite ease-in-out;"></div>
            <div style="position: relative; width: 20px; height: 20px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(37, 99, 235, 0.9);"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(
          `<div style="font-family: system-ui, sans-serif; padding: 2px;">
            <div style="background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; display: inline-block;">
              📍 YOU ARE HERE
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #111827; margin-top: 2px;">
              ${userLocationName || 'Detecting Location...'}
            </div>
            <div style="font-size: 10px; color: #059669; font-weight: 700; margin-top: 6px;">
              GPS Accuracy: ±${Math.round(userLocation.accuracy)}m
            </div>
          </div>`
        )
        .addTo(userLocationLayerRef.current);

      userMarker.openPopup();

      L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracy,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(userLocationLayerRef.current);
    }
  }, [userLocation, userLocationName]);

  // Pan to selected location or center when props change
  useEffect(() => {
    if (leafletMapRef.current && selectedLocation) {
      leafletMapRef.current.setView(
        [selectedLocation.lat, selectedLocation.lng],
        13,
        { animate: true }
      );
    }
  }, [selectedLocation]);

  // Update Markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    locations.forEach((loc) => {
      // Determine pin styling based on location type & status
      let bgColor = '#10b981'; // Operational relief camp green
      let iconSymbol = 'campaign';
      let statusBorder = '#059669';

      if (loc.type === 'Relief Camp') {
        bgColor = loc.status === 'Near Capacity' ? '#f59e0b' : loc.status === 'Full' ? '#ef4444' : '#10b981';
        iconSymbol = 'campaign';
        statusBorder = bgColor;
      } else if (loc.type === 'Emergency Shelter') {
        bgColor = '#3b82f6';
        iconSymbol = 'night_shelter';
        statusBorder = '#1d4ed8';
      } else if (loc.type === 'Medical Post') {
        bgColor = '#dc2626';
        iconSymbol = 'medical_services';
        statusBorder = '#991b1b';
      } else if (loc.type === 'Flood High-Risk Zone') {
        bgColor = '#b91c1c';
        iconSymbol = 'warning';
        statusBorder = '#7f1d1d';
      } else if (loc.type === 'Supply Hub') {
        bgColor = '#0284c7';
        iconSymbol = 'inventory_2';
        statusBorder = '#0369a1';
      }

      const isSelected = selectedLocation?.id === loc.id;
      const markerSize = isSelected ? 42 : 34;

      // Create Custom HTML DivIcon for Leaflet
      const customIcon = L.divIcon({
        className: 'custom-kerala-marker',
        html: `
          <div style="
            position: relative;
            width: ${markerSize}px;
            height: ${markerSize}px;
            background-color: ${bgColor};
            border: 3px solid ${isSelected ? '#ffffff' : '#ffffff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            ${loc.status === 'Alert / Hazard' ? 'animation: pulse-danger 1.5s infinite;' : ''}
          ">
            <span class="material-symbols-outlined" style="font-size: ${isSelected ? 24 : 18}px; font-weight: bold;">
              ${iconSymbol}
            </span>
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    bottom: -8px;
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 8px solid ${bgColor};
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      // Build popup content
      const occupancyPercentage = loc.capacity > 0 ? Math.round((loc.occupancy / loc.capacity) * 100) : 0;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: ${bgColor}20;
              color: ${bgColor};
              border: 1px solid ${bgColor}40;
            ">${loc.type}</span>
            <span style="font-size: 11px; font-weight: 700; color: #4b5563;">${loc.district}</span>
          </div>

          <h4 style="font-size: 14px; font-weight: 800; color: #111827; margin: 0 0 4px 0; line-height: 1.2;">
            ${loc.name}
          </h4>

          <p style="font-size: 11px; color: #6b7280; margin: 0 0 8px 0;">
            📍 ${loc.address}
          </p>

          ${
            loc.capacity > 0
              ? `
            <div style="margin-bottom: 8px; background: #f3f4f6; padding: 6px 8px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #374151; margin-bottom: 4px;">
                <span>Occupancy: ${loc.occupancy} / ${loc.capacity}</span>
                <span>${occupancyPercentage}%</span>
              </div>
              <div style="width: 100%; background-color: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${Math.min(occupancyPercentage, 100)}%; background-color: ${
                  occupancyPercentage >= 90 ? '#ef4444' : occupancyPercentage >= 70 ? '#f59e0b' : '#10b981'
                }; height: 100%;"></div>
              </div>
            </div>
            `
              : ''
          }

          <div style="font-size: 11px; color: #374151; margin-bottom: 8px;">
            <strong>📞 Contact:</strong> <a href="tel:${loc.phone}" style="color: #2563eb; font-weight: 700; text-decoration: none;">${loc.phone}</a>
          </div>

          <button id="btn-details-${loc.id}" style="
            width: 100%;
            background-color: #af101a;
            color: white;
            border: none;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          ">
            View Full Relief Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-details-${loc.id}`);
        if (btn) {
          btn.onclick = () => onSelectLocation(loc);
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Render SOS Alerts from Supabase sos_alerts table
    sosAlerts.forEach((sos) => {
      if (!sos.latitude || !sos.longitude) return;

      const sosIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            background-color: #dc2626;
            border: 3px solid #ffffff;
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 900;
            cursor: pointer;
            animation: pulse-sos 1s infinite alternate;
          ">
            🚨
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const sosMarker = L.marker([sos.latitude, sos.longitude], { icon: sosIcon })
        .addTo(markersGroupRef.current!)
        .bindPopup(
          `<div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 2px;">
            <div style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 11px; margin-bottom: 6px;">
              🚨 SOS EMERGENCY
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #111827;">
              ${sos.message || 'Emergency SOS Alert'}
            </h4>
            <div style="font-size: 11px; color: #4b5563;">
              <strong>GPS:</strong> ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}
            </div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">
              Status: <span style="color: #dc2626; font-weight: 700;">${sos.status || 'active'}</span>
            </div>
          </div>`
        );
    });
  }, [locations, selectedLocation, sosAlerts]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-[#e4beba] shadow-sm">
      <div ref={mapRef} className="w-full h-full z-0 min-h-[420px]" />

      {/* FLOATING MAP OVERLAY CONTROLS */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          title="Detect and center map on my current GPS location"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">
            {isLocating ? 'progress_activity' : 'my_location'}
          </span>
          <span>{isLocating ? 'Acquiring GPS...' : 'Locate My Position'}</span>
        </button>

        {userLocation && (
          <div className="bg-blue-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1.5 animate-in fade-in max-w-[260px]">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
            <span className="truncate">
              {userLocationName || 'Detecting Location...'}
            </span>
          </div>
        )}

        {locateError && (
          <div className="bg-red-100 text-red-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm max-w-[220px]">
            {locateError}
          </div>
        )}
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(185, 28, 28, 0); }
          100% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0); }
        }
        @keyframes pulse-sos {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.9); }
          50% { transform: scale(1.15); box-shadow: 0 0 0 14px rgba(220, 38, 38, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        @keyframes pulse-user {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }
        .custom-kerala-marker, .custom-sos-marker, .custom-user-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};
