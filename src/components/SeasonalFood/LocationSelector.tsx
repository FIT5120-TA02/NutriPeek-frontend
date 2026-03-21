'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapLocation } from '@/hooks/useMap';
import { RegionMapping } from '@/api/hooks';

interface LocationSelectorProps {
  onLocationSelect: (location: MapLocation) => void;
  onRequestLocation: () => void;
  locationShared: boolean;
  locationLoading: boolean;
  selectedLocation: MapLocation | null;
  permissionStatus: string;
}

const REGION_COORDS: Record<string, [number, number]> = {
  nsw: [-33.8688, 151.2093],
  vic: [-37.8136, 144.9631],
  qld: [-27.4698, 153.0251],
  sa:  [-34.9285, 138.6007],
  wa:  [-31.9505, 115.8605],
  tas: [-42.8821, 147.3272],
  nt:  [-12.4634, 130.8456],
  act: [-35.2809, 149.1300],
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onRequestLocation,
  locationShared,
  locationLoading,
  selectedLocation,
  permissionStatus,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevRegionRef = useRef<string | null>(null);

  const allRegions = useMemo<MapLocation[]>(() =>
    Object.entries(RegionMapping).map(([code, name]) => ({
      latitude:  REGION_COORDS[code]?.[0] ?? -25.2744,
      longitude: REGION_COORDS[code]?.[1] ?? 133.7751,
      region: name,
    })),
  []);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return q ? allRegions.filter(r => r.region.toLowerCase().includes(q)) : allRegions;
  }, [searchText, allRegions]);

  // Reset input when a location is confirmed
  useEffect(() => {
    if (selectedLocation && selectedLocation.region !== prevRegionRef.current) {
      prevRegionRef.current = selectedLocation.region;
      setSearchText('');
      setShowDropdown(false);
    }
  }, [selectedLocation]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((loc: MapLocation) => {
    onLocationSelect(loc);
    setSearchText('');
    setShowDropdown(false);
  }, [onLocationSelect]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
      {/* Header row */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Find markets near you</h3>
          <p className="text-xs text-gray-400 mt-0.5">Use GPS or choose your state / territory</p>
        </div>
        {selectedLocation && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            {selectedLocation.region}
          </span>
        )}
      </div>

      {/* Two options */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">

        {/* Option 1 — GPS */}
        <button
          onClick={onRequestLocation}
          disabled={locationLoading || (locationShared && permissionStatus === 'granted')}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
            locationShared && permissionStatus === 'granted'
              ? 'bg-green-50 border-green-200 text-green-800 cursor-default'
              : locationLoading
                ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-wait'
                : permissionStatus === 'denied'
                  ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
          }`}
        >
          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            locationShared && permissionStatus === 'granted'
              ? 'bg-green-100'
              : locationLoading
                ? 'bg-blue-100'
                : permissionStatus === 'denied'
                  ? 'bg-red-100'
                  : 'bg-white border border-gray-200'
          }`}>
            {locationLoading ? (
              <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">
              {locationLoading ? 'Detecting…'
                : locationShared && permissionStatus === 'granted' ? 'Location shared'
                : permissionStatus === 'denied' ? 'Location blocked'
                : 'Use my location'}
            </p>
            <p className="text-xs opacity-60 mt-0.5 truncate">
              {permissionStatus === 'denied'
                ? 'Enable in browser settings'
                : 'Auto-detect your state'}
            </p>
          </div>
        </button>

        {/* Divider */}
        <div className="hidden sm:flex flex-col items-center justify-center gap-1">
          <div className="w-px h-6 bg-gray-200"/>
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="w-px h-6 bg-gray-200"/>
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200"/>
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200"/>
        </div>

        {/* Option 2 — Region picker */}
        <div ref={wrapperRef} className="flex-1 relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-text hover:border-green-300 hover:bg-green-50 transition-all"
            onClick={() => { setShowDropdown(true); (wrapperRef.current?.querySelector('input') as HTMLInputElement)?.focus(); }}
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Select state or territory…"
                className="w-full bg-transparent text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none"
              />
              <p className="text-xs text-gray-400 mt-0.5">8 regions available</p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          {/* Dropdown — high z-index to avoid being blocked by map */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[500]">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No regions found</p>
              ) : (
                <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                  {filtered.map((r, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleSelect(r)}
                      className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-green-50 text-sm text-gray-700 hover:text-green-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      {r.region}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LocationSelector;