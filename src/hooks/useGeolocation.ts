'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getRegionFromCoordinates } from '../types/region';

export const GeolocationPermissionState = {
  Prompt: 'prompt',
  Granted: 'granted',
  Denied: 'denied',
};

export interface Location {
  latitude: number;
  longitude: number;
  region: string;
  accuracy?: number;
  timestamp?: number;
}

export const useGeolocation = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>(GeolocationPermissionState.Prompt);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  
  // Use refs to store the current coordinates to prevent unnecessary rerenders
  const latitudeRef = useRef<number | null>(null);
  const longitudeRef = useRef<number | null>(null);
  const regionRef = useRef<string | null>(null);
  
  // Flag to prevent multiple simultaneous requests
  const requestingRef = useRef<boolean>(false);
  
  // Store a timestamp of the last successful geolocation
  const lastSuccessTimestampRef = useRef<number | null>(null);
  
  // Check permission status on mount
  useEffect(() => {
    console.log("useGeolocation: Checking permission status");
    
    if (typeof navigator === 'undefined') return;
    
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then((result) => {
            console.log("useGeolocation: Permission status:", result.state);
            setPermissionStatus(result.state);
            
            // Listen for changes to the permission state
            result.onchange = () => {
              console.log("useGeolocation: Permission changed to:", result.state);
              setPermissionStatus(result.state);
            };
          })
          .catch((error) => {
            console.warn("useGeolocation: Error checking permission:", error);
            // Fall back to prompt if we can't query permissions
            setPermissionStatus(GeolocationPermissionState.Prompt);
          });
      } else {
        // For browsers that don't support permissions API
        console.log("useGeolocation: Permissions API not supported");
        setPermissionStatus(GeolocationPermissionState.Prompt);
      }
    } catch (error) {
      console.warn("useGeolocation: Exception in permission check:", error);
      setPermissionStatus(GeolocationPermissionState.Prompt);
    }
  }, []);
  
  // Memoize the location object to prevent unnecessary rerenders
  const location = useMemo(() => {
    if (latitudeRef.current === null || longitudeRef.current === null) {
      return null;
    }
    
    return {
      latitude: latitudeRef.current,
      longitude: longitudeRef.current,
      region: regionRef.current || '',
      timestamp: lastSuccessTimestampRef.current,
    } as Location;
  }, [latitudeRef.current, longitudeRef.current, regionRef.current]);
  
  const handleGeolocationSuccess = useCallback((position: GeolocationPosition) => {
    console.log("useGeolocation: Location received successfully");
    
    const timestamp = Date.now();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    // Determine the region from the coordinates
    const region = getRegionFromCoordinates(latitude, longitude);
    
    console.log("useGeolocation: Setting location", { latitude, longitude, region });
    
    // Update the refs with the new values
    latitudeRef.current = latitude;
    longitudeRef.current = longitude;
    regionRef.current = region;
    lastSuccessTimestampRef.current = timestamp;
    
    // Clear any previous errors
    setError(null);
    setIsRequesting(false);
    requestingRef.current = false;
  }, []);
  
  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    console.warn("useGeolocation: Error getting location", error);
    
    let errorMessage: string;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "User denied the request for geolocation.";
        setPermissionStatus(GeolocationPermissionState.Denied);
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "The request to get user location timed out.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
        break;
    }
    
    console.log("useGeolocation: Setting error", errorMessage);
    setError(errorMessage);
    setIsRequesting(false);
    requestingRef.current = false;
  }, []);
  
  const requestGeolocation = useCallback(() => {
    console.log("useGeolocation: Request geolocation");
    
    // Prevent multiple simultaneous requests
    if (requestingRef.current) {
      console.log("useGeolocation: Already requesting, ignoring duplicate call");
      return;
    }
    
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    
    setIsRequesting(true);
    requestingRef.current = true;
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      handleGeolocationSuccess,
      handleGeolocationError,
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 60000, // 1 minute
      }
    );
  }, [handleGeolocationSuccess, handleGeolocationError]);
  
  const resetGeolocation = useCallback(() => {
    console.log("useGeolocation: Reset geolocation");
    
    latitudeRef.current = null;
    longitudeRef.current = null;
    regionRef.current = null;
    lastSuccessTimestampRef.current = null;
    
    setError(null);
    requestingRef.current = false;
    setIsRequesting(false);
  }, []);
  
  return {
    location,
    permissionStatus,
    error,
    isRequesting,
    requestGeolocation,
    resetGeolocation,
  };
};

export default useGeolocation; 