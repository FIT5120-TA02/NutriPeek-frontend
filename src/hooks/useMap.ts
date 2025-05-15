'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGeolocation } from './useGeolocation';
import { useSeasonalFood } from './useSeasonalFood';
import { getRegionFromCoordinates, getRegionFullName, getRegionCode } from '../types/region';
import { nutripeekApi } from '@/api/nutripeekApi';
import { FarmersMarketResponse } from '@/api/types';

// Default map position (center of Australia)
const DEFAULT_MAP_POSITION: [number, number] = [-25.2744, 133.7751];
const DEFAULT_ZOOM = 4;

export interface MapLocation {
  latitude: number;
  longitude: number;
  region: string;
  address?: string;
}

/**
 * Custom hook for map functionality
 * Manages map state, geolocation, and farmers market data
 */
export const useMap = () => {
  // Map state
  const [mapPosition, setMapPosition] = useState<[number, number]>(DEFAULT_MAP_POSITION);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [nearbyMarkets, setNearbyMarkets] = useState<FarmersMarketResponse[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<FarmersMarketResponse | null>(null);
  const [locationShared, setLocationShared] = useState<boolean>(false);
  const [loadingMarkets, setLoadingMarkets] = useState<boolean>(false);

  // Use existing hooks
  const geolocation = useGeolocation();
  const seasonalFood = useSeasonalFood();
  
  // Reference to current region to prevent unnecessary updates
  const currentRegionRef = useRef<string | null>(null);
  
  // Flag to track if location is being processed
  const processingLocationRef = useRef<boolean>(false);
  
  // Flag to track if user location has been processed to prevent infinite updates
  const locationProcessedRef = useRef<boolean>(false);

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);
  
  /**
   * Process location update from geolocation or manual selection
   * Updates map position, finds nearby markets, and updates food filters
   */
  const processLocationUpdate = useCallback(async (lat: number, lng: number, initialRegion: string = '') => {
    console.log("useMap: processLocationUpdate called", { lat, lng, initialRegion });
    
    // Prevent duplicate processing
    if (processingLocationRef.current) {
      console.log("useMap: skipping duplicate processing");
      return;
    }
    
    processingLocationRef.current = true;
    setLoadingMarkets(true);
    
    try {
      // Update map view
      setMapPosition([lat, lng]);
      setZoom(10);
      
      // Determine the region code
      let regionCode = '';
      
      // Use the initial region if provided
      if (initialRegion) {
        regionCode = getRegionCode(initialRegion);
      }
      
      // If no region code, determine from coordinates
      if (!regionCode) {
        regionCode = getRegionFromCoordinates(lat, lng);
      }
      
      // Get the full name of the region for display
      const regionFullName = getRegionFullName(regionCode);
      console.log("useMap: setSelectedLocation", { region: regionFullName });
      
      // Set the selected location
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        region: regionFullName,
      });
      
      // Fetch farmers markets for the region
      try {
        const response = await nutripeekApi.getFarmersMarkets({ region: regionFullName });
        console.log("response.items", response.items);
        
        // Filter markets with valid coordinates and calculate distance
        const marketsWithDistance = response.items
          .filter(market => market.latitude !== null && market.longitude !== null)
          .map(market => ({
            ...market,
            distance: calculateDistance(
              lat, 
              lng, 
              Number(market.latitude), 
              Number(market.longitude)
            )
          }))
          .sort((a, b) => (a.distance as number) - (b.distance as number))
          .slice(0, 5); // Limit to 5 nearest markets
        
        setNearbyMarkets(marketsWithDistance);
      } catch (error) {
        console.error("Failed to fetch farmers markets:", error);
        setNearbyMarkets([]);
      }
      
      // Only update seasonal food filters if the region has changed
      if (regionCode && regionCode !== currentRegionRef.current) {
        currentRegionRef.current = regionCode;
        
        // Use currentMonth from seasonalFood hook for consistency
        // The month is still passed as a number, but the useSeasonalFood hook will convert it
        seasonalFood.updateFilters({
          region: regionCode,
          month: seasonalFood.currentMonth,
        });
        
        console.log("useMap: Updated filters with region and month", {
          region: regionCode,
          month: seasonalFood.currentMonth,
          monthAbbrev: seasonalFood.getMonthAbbreviation(seasonalFood.currentMonth)
        });
      }
    } finally {
      // Clear processing flags
      processingLocationRef.current = false;
      setLoadingMarkets(false);
    }
  }, [seasonalFood, calculateDistance]);
  
  /**
   * Handle geolocation changes
   * Triggered when the user shares their location
   */
  useEffect(() => {
    console.log("useMap: useEffect for geolocation.location", { 
      hasLocation: !!geolocation.location, 
      isProcessed: locationProcessedRef.current,
      locationShared
    });
    
    if (geolocation.location && !locationProcessedRef.current) {
      const { latitude, longitude, region } = geolocation.location;
      
      // Mark location as shared and processed
      console.log("useMap: setLocationShared to true");
      setLocationShared(true);
      locationProcessedRef.current = true;
      
      // Process the location update
      processLocationUpdate(latitude, longitude, region);
    }
  }, [geolocation.location, processLocationUpdate]);
  
  /**
   * Current foods based on selected location and seasonalFoods
   * Memoized to prevent unnecessary recalculations
   */
  const currentFoods = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }
    
    // Convert region name to code
    let regionCode = getRegionCode(selectedLocation.region);
    
    // If no code found, try to determine from coordinates
    if (!regionCode && selectedLocation.latitude && selectedLocation.longitude) {
      regionCode = getRegionFromCoordinates(selectedLocation.latitude, selectedLocation.longitude);
    }
    
    if (!regionCode) {
      return [];
    }
    
    // Get foods for the region
    return seasonalFood.getFoodsForRegion(regionCode);
  }, [selectedLocation, seasonalFood.getFoodsForRegion]);
  
  /**
   * Handle location selection from search or click
   */
  const selectLocation = useCallback((location: MapLocation) => {
    console.log("useMap: selectLocation called", location);
    processLocationUpdate(location.latitude, location.longitude, location.region);
  }, [processLocationUpdate]);
  
  /**
   * Handle market selection
   * Updates selected market, map position, and food filters
   */
  const selectMarket = useCallback((market: FarmersMarketResponse | null) => {
    if (!market) {
      setSelectedMarket(null);
      return;
    }
    
    setSelectedMarket(market);
    
    // Only update map position if coordinates are available
    if (market.latitude !== null && market.longitude !== null) {
      setMapPosition([Number(market.latitude), Number(market.longitude)]);
      setZoom(15);
    }
    
    // Extract region from market region field
    const regionCode = getRegionCode(market.region);
    
    // Update the selected location
    if (market.latitude !== null && market.longitude !== null) {
      setSelectedLocation({
        latitude: Number(market.latitude),
        longitude: Number(market.longitude),
        region: market.region,
        address: `${market.name}, ${market.address}, ${market.city || ''}`,
      });
    }
    
    // Only update seasonal food filters if the region has changed
    if (regionCode && regionCode !== currentRegionRef.current) {
      currentRegionRef.current = regionCode;
      
      // The month is still passed as a number, but the useSeasonalFood hook will convert it
      seasonalFood.updateFilters({
        region: regionCode,
        month: seasonalFood.currentMonth,
      });
      
      console.log("useMap: Updated filters for market with region and month", {
        region: regionCode,
        month: seasonalFood.currentMonth,
        monthAbbrev: seasonalFood.getMonthAbbreviation(seasonalFood.currentMonth)
      });
    }
  }, [seasonalFood.updateFilters, seasonalFood.currentMonth, seasonalFood.getMonthAbbreviation]);
  
  /**
   * Reset the map to default view
   */
  const resetMap = useCallback(() => {
    setMapPosition(DEFAULT_MAP_POSITION);
    setZoom(DEFAULT_ZOOM);
    setSelectedLocation(null);
    setSelectedMarket(null);
    setNearbyMarkets([]);
    setLocationShared(false);
    currentRegionRef.current = null;
    locationProcessedRef.current = false;
    
    // Reset all filters
    seasonalFood.refreshData();
  }, [seasonalFood.refreshData]);
  
  /**
   * Get markets for a specific region
   */
  const getMarketsForRegion = useCallback(async (region: string) => {
    try {
      const regionFullName = getRegionFullName(region);
      const response = await nutripeekApi.getFarmersMarkets({ region: regionFullName });
      console.log("response.items", response.items);
      return response.items;
    } catch (error) {
      console.error("Failed to fetch markets for region:", error);
      return [];
    }
  }, []);
  
  /**
   * Request and focus on user's location
   * Prevents multiple requests if location already shared
   */
  const requestAndFocusOnLocation = useCallback(() => {
    console.log("useMap: requestAndFocusOnLocation called", { locationShared });
    if (!locationShared) {
      // Reset the processed flag when we explicitly request location again
      locationProcessedRef.current = false;
      geolocation.requestGeolocation();
    }
  }, [geolocation, locationShared]);
  
  /**
   * Zoom out to show the entire region
   * Used when viewing all farmers markets in a region
   */
  const zoomToRegion = useCallback(() => {
    if (selectedLocation) {
      // Set a medium zoom level to show the region
      setZoom(10);
      
      // Reset to the selected location's position
      if (selectedLocation.latitude && selectedLocation.longitude) {
        setMapPosition([selectedLocation.latitude, selectedLocation.longitude]);
      }
    }
  }, [selectedLocation]);
  
  return {
    // Map state
    mapPosition,
    zoom,
    selectedLocation,
    locationShared,
    loadingMarkets,
    
    // Farmers markets
    nearbyMarkets,
    selectedMarket,
    
    // Methods
    selectLocation,
    selectMarket,
    resetMap,
    getMarketsForRegion,
    requestAndFocusOnLocation,
    zoomToRegion,
    
    // Pass through from underlying hooks
    geolocation,
    seasonalFood,
    currentFoods,
  };
};

export default useMap; 