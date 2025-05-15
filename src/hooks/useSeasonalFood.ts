import { useState, useEffect, useCallback, useRef } from 'react';
import { nutripeekApi } from '../api/nutripeekApi';
import { SeasonalFoodResponse, Season, SeasonalFoodDetailResponse } from '../api/types';
import { RegionMapping } from '../api/hooks';

export interface SeasonalFoodFilters {
  region: string | null;
  month: number | null;
  season: Season | null;
  category: string | null;
}

// Map numeric months to their abbreviated lowercase names
const monthToAbbreviation = {
  1: 'jan',
  2: 'feb',
  3: 'mar',
  4: 'apr',
  5: 'may',
  6: 'jun',
  7: 'jul',
  8: 'aug',
  9: 'sep',
  10: 'oct',
  11: 'nov',
  12: 'dec'
} as const;

// Helper to convert month number to abbreviated string
function getMonthAbbreviation(month: number): string {
  return monthToAbbreviation[month as keyof typeof monthToAbbreviation] || '';
}

/**
 * Hook for seasonal food discovery feature
 * Provides access to seasonal foods based on region, season, and month
 */
export function useSeasonalFood() {
  const [seasonalFoods, setSeasonalFoods] = useState<Record<string, SeasonalFoodResponse[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SeasonalFoodFilters>({
    region: null,
    month: null,
    season: null,
    category: null,
  });
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [isRegionsLoading, setIsRegionsLoading] = useState<boolean>(true);
  
  // Add state for food details
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<SeasonalFoodDetailResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  // Use a ref to track the last fetched filters to avoid redundant API calls
  const lastFetchedRef = useRef<string>('');
  
  // Get current month and season
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
  
  // Determine current season based on month (for Southern Hemisphere)
  const getSeason = (month: number): Season => {
    if (month >= 3 && month <= 5) return 'Autumn';
    if (month >= 6 && month <= 8) return 'Winter';
    if (month >= 9 && month <= 11) return 'Spring';
    return 'Summer';
  };
  
  const currentSeason = getSeason(currentMonth);
  
  // Load available regions
  useEffect(() => {
    const fetchRegions = async () => {
      setIsRegionsLoading(true);
      try {
        const regions = await nutripeekApi.getSeasonalFoodRegions();
        setAvailableRegions(regions);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError("Error loading regions data");
      } finally {
        setIsRegionsLoading(false);
      }
    };
    
    fetchRegions();
  }, []);
  
  // Load seasonal food data based on filters
  useEffect(() => {
    const fetchSeasonalFoods = async () => {
      // Create a string representation of current filters for comparison
      const filterString = JSON.stringify(filters);
      
      // Skip fetch if we already fetched with these exact filters
      if (filterString === lastFetchedRef.current) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Prepare API request parameters
        const params: Record<string, string> = {};
        
        if (filters.region) {
          params.region = filters.region;
        }
        
        if (filters.month !== null) {
          // Convert month number to abbreviated lowercase string (jan, feb, etc.)
          params.month = getMonthAbbreviation(filters.month);
          console.log("useSeasonalFood: Using month abbreviation:", params.month);
        }
        
        if (filters.season) {
          params.season = filters.season;
        }
        
        if (filters.category) {
          params.category = filters.category;
        }
        
        // Update the ref to mark these filters as being fetched
        lastFetchedRef.current = filterString;
        
        // Fetch data from API
        const response = await nutripeekApi.getSeasonalFood(params);
        
        // Group foods by region
        const foodsByRegion: Record<string, SeasonalFoodResponse[]> = {};
        
        response.items.forEach(food => {
          if (!foodsByRegion[food.region]) {
            foodsByRegion[food.region] = [];
          }
          foodsByRegion[food.region].push(food);
        });
        
        setSeasonalFoods(foodsByRegion);
        setTotalCount(response.total);
      } catch (err) {
        console.error("Error fetching seasonal foods:", err);
        setError("Error loading seasonal food data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeasonalFoods();
  }, [filters]);
  
  // Update filters with proper equality checking to prevent unnecessary updates
  const updateFilters = useCallback((newFilters: Partial<SeasonalFoodFilters>) => {
    setFilters(prev => {
      // Check if any values have actually changed
      const hasChanges = Object.entries(newFilters).some(
        ([key, value]) => prev[key as keyof SeasonalFoodFilters] !== value
      );
      
      // Only update state if there are actual changes
      if (hasChanges) {
        return {
          ...prev,
          ...newFilters
        };
      }
      
      // Return previous state if nothing changed (prevents re-render)
      return prev;
    });
  }, []);
  
  // Refresh data by resetting filters and clearing cache
  const refreshData = useCallback(() => {
    lastFetchedRef.current = '';
    setFilters({
      region: null,
      month: null,
      season: null,
      category: null,
    });
  }, []);
  
  // Get foods for a specific region with better memoization
  const getFoodsForRegion = useCallback((region: string) => {
    // Ensure we're returning a stable reference if the data hasn't changed
    if (!region || !seasonalFoods[region]) {
      return [];
    }
    
    // Return the exact same array reference if we already have it
    return seasonalFoods[region];
  }, [seasonalFoods]);
  
  // Get region abbreviation from full name
  const getRegionAbbreviation = useCallback((regionName: string): string => {
    const abbrev = Object.entries(RegionMapping).find(
      ([_, name]) => name === regionName
    )?.[0] || '';
    
    return abbrev;
  }, []);

  // Get detailed information about a specific food item
  const getSeasonalFoodDetails = useCallback(async (foodName: string, region: string) => {
    setIsLoadingDetails(true);
    setDetailsError(null);
    setSelectedFoodDetails(null);
    
    try {
      const details = await nutripeekApi.getSeasonalFoodDetails(foodName, region);
      setSelectedFoodDetails(details);
      return details;
    } catch (err) {
      console.error("Error fetching food details:", err);
      setDetailsError("Unable to load food details");
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);
  
  // Clear selected food details
  const clearFoodDetails = useCallback(() => {
    setSelectedFoodDetails(null);
    setDetailsError(null);
  }, []);

  return {
    seasonalFoods,
    isLoading,
    error,
    totalCount,
    filters,
    availableRegions,
    isRegionsLoading,
    currentSeason,
    currentMonth,
    updateFilters,
    refreshData,
    getRegionAbbreviation,
    getFoodsForRegion,
    getMonthAbbreviation,
    // Add new functions and state
    selectedFoodDetails,
    isLoadingDetails,
    detailsError,
    getSeasonalFoodDetails,
    clearFoodDetails,
  };
} 