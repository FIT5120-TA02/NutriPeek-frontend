'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

/**
 * Component for location selection with two options:
 * 1. Share current location automatically
 * 2. Manually select a region
 */
const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onRequestLocation,
  locationShared,
  locationLoading,
  selectedLocation,
  permissionStatus,
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Ref to track the previous selected location to prevent unnecessary updates
  const prevSelectedLocationRef = useRef<string | null>(null);
  
  // Reset search when location is selected
  useEffect(() => {
    console.log("LocationSelector: useEffect triggered for selectedLocation", { 
      selectedLocation: selectedLocation?.region,
      prevRegion: prevSelectedLocationRef.current
    });
    
    if (selectedLocation) {
      // Only update if the region has changed to prevent infinite loops
      const currentRegion = selectedLocation.region;
      
      if (currentRegion !== prevSelectedLocationRef.current) {
        console.log("LocationSelector: Clearing search with new location", currentRegion);
        prevSelectedLocationRef.current = currentRegion;
        
        setSearchText('');
        setSearchResults([]);
        setShowResults(false);
      }
    }
  }, [selectedLocation]);
  
  // Handle search text change with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    console.log("LocationSelector: Searching for:", value);
    
    // Search for matching regions
    const results: MapLocation[] = [];
    
    Object.entries(RegionMapping).forEach(([code, name]) => {
      if (name.toLowerCase().includes(value.toLowerCase())) {
        // Use approximate coordinates for regions
        let coordinates: [number, number] = [-25.2744, 133.7751]; // Default Australia
        
        switch (code.toLowerCase()) {
          case 'nsw':
            coordinates = [-33.8688, 151.2093]; // Sydney
            break;
          case 'vic':
            coordinates = [-37.8136, 144.9631]; // Melbourne
            break;
          case 'qld':
            coordinates = [-27.4698, 153.0251]; // Brisbane
            break;
          case 'sa':
            coordinates = [-34.9285, 138.6007]; // Adelaide
            break;
          case 'wa':
            coordinates = [-31.9505, 115.8605]; // Perth
            break;
          case 'tas':
            coordinates = [-42.8821, 147.3272]; // Hobart
            break;
          case 'nt':
            coordinates = [-12.4634, 130.8456]; // Darwin
            break;
          case 'act':
            coordinates = [-35.2809, 149.1300]; // Canberra
            break;
        }
        
        results.push({
          latitude: coordinates[0],
          longitude: coordinates[1],
          region: name,
        });
      }
    });
    
    console.log("LocationSelector: Found results:", results.length);
    setSearchResults(results);
    setShowResults(true);
  }, []);
  
  // Handle location selection from dropdown
  const selectRegion = useCallback((location: MapLocation) => {
    console.log("LocationSelector: selectRegion called with:", location.region);
    onLocationSelect(location);
    setSearchText('');
    setSearchResults([]);
    setShowResults(false);
  }, [onLocationSelect]);
  
  // Handle request location click
  const handleRequestLocation = useCallback(() => {
    console.log("LocationSelector: handleRequestLocation called");
    onRequestLocation();
  }, [onRequestLocation]);
  
  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xl font-medium text-gray-800 mb-2">Choose Your Location</h3>
        <p className="text-gray-600 text-sm">
          Share your location or select a region to discover seasonal foods and nearby farmers markets.
        </p>
      </div>
      
      <div className="p-4 flex flex-col md:flex-row md:items-center md:space-x-4">
        {/* Option 1: Share location */}
        <div className="flex-1 mb-4 md:mb-0">
          <div className="flex flex-col h-full justify-between">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Option 1: Use your current location</p>
              <p className="text-xs text-gray-500">We'll automatically find your state or territory</p>
            </div>
            
            <button
              onClick={handleRequestLocation}
              disabled={locationLoading || (locationShared && permissionStatus === 'granted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                locationShared && permissionStatus === 'granted'
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : locationLoading
                    ? 'bg-blue-100 text-blue-800 cursor-wait'
                    : permissionStatus === 'denied'
                      ? 'bg-red-100 text-red-800 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {locationLoading
                ? 'Detecting...'
                : locationShared && permissionStatus === 'granted'
                  ? '✓ Location Shared'
                  : permissionStatus === 'denied'
                    ? 'Location Access Blocked'
                    : 'Share My Location'}
            </button>
            
            {permissionStatus === 'denied' && (
              <p className="text-xs text-red-600 mt-1">
                Please enable location access in your browser settings.
              </p>
            )}
          </div>
        </div>
        
        {/* Option 2: Manual region selection */}
        <div className="flex-1 relative">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Option 2: Select your region</p>
            <p className="text-xs text-gray-500">Choose your state or territory from the list</p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              onClick={() => setShowResults(true)}
              placeholder="Search for your region..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                    onClick={() => selectRegion(result)}
                  >
                    {result.region}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector; 