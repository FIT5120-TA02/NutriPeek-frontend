'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '@/components/ui/Dropdown';
import { nutripeekApi } from '@/api/nutripeekApi';
import { getRegionFullName, getRegionFromCoordinates } from '@/types/region';

interface RegionSelectionDialogProps {
  visible: boolean;
  onHide: () => void;
  onRegionSelect: (region: string) => void;
}

/**
 * Dialog component for selecting a region for seasonal food recommendations
 */
export default function RegionSelectionDialog({
  visible,
  onHide,
  onRegionSelect
}: RegionSelectionDialogProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('australia');
  const [loading, setLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch available regions when the component mounts
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const regionsData = await nutripeekApi.getSeasonalFoodRegions();
        setRegions(regionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching regions:', error);
        // Use a default region in case of error
        setRegions(['australia']);
        setLoading(false);
      }
    };

    if (visible) {
      fetchRegions();
    }
  }, [visible]);

  // Handle using current location
  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    // Check if geolocation is available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get coordinates from the geolocation API
            const { latitude, longitude } = position.coords;
            
            // Determine the region based on coordinates
            const regionCode = getRegionFromCoordinates(latitude, longitude);
            
            // Set the selected region
            setSelectedRegion(regionCode);
            setLocationLoading(false);
            
            // Pass the region code to the parent component
            onRegionSelect(regionCode);
            onHide();
          } catch (error) {
            console.error('Error determining region from location:', error);
            setLocationError('Could not determine your region. Please select manually.');
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          
          // Set appropriate error message based on the error code
          if (error.code === 1) {
            setLocationError('Location access denied. Please grant permission or select manually.');
          } else if (error.code === 2) {
            setLocationError('Unable to determine your location. Please select manually.');
          } else {
            setLocationError('Location request timed out. Please select manually.');
          }
          
          setLocationLoading(false);
        },
        // Options for geolocation request
        {
          enableHighAccuracy: false, // We don't need precise location for region determination
          timeout: 10000, // 10 seconds timeout
          maximumAge: 300000 // Accept a cached position up to 5 minutes old
        }
      );
    } else {
      // Geolocation not available
      setLocationError('Location services not available in your browser. Please select manually.');
      setLocationLoading(false);
    }
  };

  // Handle manual region selection
  const handleRegionConfirm = () => {
    if (selectedRegion) {
      onRegionSelect(selectedRegion);
      onHide();
    }
  };

  // Handle background click to close the dialog
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the background, not its children
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  if (!visible) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-[2px] p-4 cursor-pointer"
          onClick={handleBackgroundClick}
        >
          <motion.div 
            className="bg-white/95 rounded-xl shadow-xl p-6 max-w-md w-full cursor-auto"
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the dialog content
          >
            <div className="flex flex-col">
              {/* Header */}
              <motion.h3 
                className="text-xl font-bold text-green-600 mb-4 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Select Your Region
              </motion.h3>
            
              <motion.p 
                className="text-gray-600 mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                To provide you with the most relevant seasonal foods, we need to know your region. 
                Select a region or use your current location.
              </motion.p>
              
              {/* Location button */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="button"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    locationLoading 
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : locationError
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Detecting location...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${locationError ? 'text-red-500' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{locationError ? 'Try Again' : 'Use My Current Location'}</span>
                    </>
                  )}
                </button>

                {/* Display error message if location detection failed */}
                {locationError && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <p>{locationError}</p>
                  </div>
                )}
              </motion.div>
              
              {/* Dropdown for manual selection */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="region" className="block text-gray-700 mb-2 font-medium">
                  Or select a region manually:
                </label>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>
                ) : (
                  <Dropdown
                    value={selectedRegion}
                    options={regions.map(region => ({ 
                      label: region.toLowerCase() === 'australia' ? 'Australia' : getRegionFullName(region),
                      value: region
                    }))}
                    onChange={(value) => setSelectedRegion(value)}
                    placeholder="Select a region"
                  />
                )}
              </motion.div>
              
              {/* Information box */}
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-blue-800 text-sm font-semibold mb-2">Why is this important?</h3>
                <p className="text-blue-700 text-sm">
                  Seasonal foods vary by region. Selecting your region helps us recommend foods that are currently 
                  in season near you, which are often fresher, more nutritious, and more environmentally friendly.
                </p>
              </motion.div>
              
              {/* Action buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-end gap-3 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button 
                  className={`px-6 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors ${
                    (!selectedRegion || loading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleRegionConfirm}
                  disabled={!selectedRegion || loading}
                >
                  Select Region
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}