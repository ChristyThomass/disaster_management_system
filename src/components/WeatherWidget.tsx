import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  pressure: number;
  cloudCover: number;
  locationName: string;
}

const WEATHER_INTERPRETATIONS: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: 'sunny' },
  1: { label: 'Mainly clear', icon: 'sunny_snowing' },
  2: { label: 'Partly cloudy', icon: 'partly_cloudy_day' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'foggy' },
  48: { label: 'Depositing rime fog', icon: 'foggy' },
  51: { label: 'Drizzle: Light intensity', icon: 'rainy_light' },
  53: { label: 'Drizzle: Moderate intensity', icon: 'rainy_light' },
  55: { label: 'Drizzle: Dense intensity', icon: 'rainy_light' },
  56: { label: 'Light freezing drizzle', icon: 'rainy_snowing' },
  57: { label: 'Dense freezing drizzle', icon: 'rainy_snowing' },
  61: { label: 'Rain: Slight intensity', icon: 'rainy' },
  63: { label: 'Rain: Moderate intensity', icon: 'rainy' },
  65: { label: 'Rain: Heavy intensity', icon: 'rainy_heavy' },
  66: { label: 'Light freezing rain', icon: 'rainy_snowing' },
  67: { label: 'Heavy freezing rain', icon: 'rainy_snowing' },
  71: { label: 'Snow fall: Slight intensity', icon: 'snowing' },
  73: { label: 'Snow fall: Moderate intensity', icon: 'snowing' },
  75: { label: 'Snow fall: Heavy intensity', icon: 'snowing_heavy' },
  77: { label: 'Snow grains', icon: 'snowing' },
  80: { label: 'Rain showers: Slight', icon: 'rainy_light' },
  81: { label: 'Rain showers: Moderate', icon: 'rainy_light' },
  82: { label: 'Rain showers: Violent', icon: 'rainy_heavy' },
  85: { label: 'Snow showers slight', icon: 'snowing' },
  86: { label: 'Snow showers heavy', icon: 'snowing' },
  95: { label: 'Thunderstorm: Slight or moderate', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', icon: 'thunderstorm' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'thunderstorm' },
};

export const WeatherWidget: React.FC<{ currentUser?: UserProfile | null }> = ({ currentUser = null }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const fetchWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Location Name if not provided
      let resolvedName = name || 'Kerala Region';
      if (!name) {
        try {
          const lang = currentUser?.language || 'en';
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            // Try to get a meaningful name: city, town, village, or suburb
            resolvedName = geoData.address.city || 
                           geoData.address.town || 
                           geoData.address.village || 
                           geoData.address.suburb || 
                           geoData.address.district || 
                           geoData.display_name.split(',')[0] || 
                           'Current Location';
          }
        } catch (geoErr) {
          console.warn('Reverse Geocoding failed:', geoErr);
        }
      }

      // 2. Fetch Weather Data
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const data = await response.json();
      const current = data.current;
      
      setWeather({
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        weatherCode: current.weather_code,
        isDay: !!current.is_day,
        precipitation: current.precipitation,
        pressure: current.pressure_msl,
        cloudCover: current.cloud_cover,
        locationName: resolvedName
      });
    } catch (err) {
      console.error('Weather Fetch Error:', err);
      setError('Unable to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Default to Kerala coordinates
    fetchWeather(10.8505, 76.2711, 'Kerala State');
  }, [fetchWeather]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude); // No name passed, so it will reverse geocode
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation Error:', err);
        setError('Location access denied or unavailable.');
        setIsLocating(false);
      }
    );
  };

  if (loading && !weather) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#e4beba] shadow-2xs flex items-center justify-center h-40 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-gray-300 animate-spin">sync</span>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Live Weather...</p>
        </div>
      </div>
    );
  }

  const interpretation = weather ? WEATHER_INTERPRETATIONS[weather.weatherCode] || { label: 'Unknown', icon: 'help' } : null;

  return (
    <div className="bg-white rounded-2xl border border-[#e4beba] shadow-2xs overflow-hidden flex flex-col">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#af101a]">cloud_sync</span>
          <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Real-Time Weather Monitor</span>
        </div>
        <button 
          onClick={handleLocate}
          disabled={isLocating}
          className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#af101a] text-[#af101a] px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shadow-xs disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] ${isLocating ? 'animate-spin' : ''}`}>
            {isLocating ? 'sync' : 'my_location'}
          </span>
          {isLocating ? 'LOCATING...' : 'USE MY LOCATION'}
        </button>
      </div>

      <div className="p-5 flex flex-col md:flex-row items-center gap-6">
        {weather && (
          <>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#ffdad6]/40 flex items-center justify-center">
                <span className={`material-symbols-outlined text-[48px] ${weather.isDay ? 'text-amber-500' : 'text-blue-500'} fill`}>
                  {interpretation?.icon}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#1a1c1c]">{weather.temperature}</span>
                  <span className="text-xl font-bold text-[#af101a]">°C</span>
                </div>
                <p className="text-sm font-extrabold text-[#1a1c1c] mt-0.5">{interpretation?.label}</p>
                <p className="text-[10px] font-bold text-[#5b403d] uppercase tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {weather.locationName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Humidity</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-500">water_drop</span>
                  <span className="text-sm font-black text-gray-800">{weather.humidity}%</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Wind Speed</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">air</span>
                  <span className="text-sm font-black text-gray-800">{weather.windSpeed} <span className="text-[10px]">km/h</span></span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Precipitation</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#af101a]">rainy</span>
                  <span className="text-sm font-black text-gray-800">{weather.precipitation} <span className="text-[10px]">mm</span></span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Cloud Cover</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-gray-600">cloud</span>
                  <span className="text-sm font-black text-gray-800">{weather.cloudCover}%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
          <p className="text-[10px] font-bold text-red-700 uppercase">{error}</p>
        </div>
      )}

      <div className="bg-blue-50/50 px-4 py-2 border-t border-blue-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-blue-600 animate-pulse">info</span>
        <p className="text-[9px] font-bold text-blue-800 uppercase tracking-wider">
          Accuracy: Ground station telemetry updated every 15 minutes via Open-Meteo API.
        </p>
      </div>
    </div>
  );
};
