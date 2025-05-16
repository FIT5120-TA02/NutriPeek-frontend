'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMap } from '@/hooks/useMap';
import LocationSelector from './LocationSelector';
import FarmersMarketInfo from './FarmersMarketInfo';
import SeasonalFoodsList from './SeasonalFoodsList';
import FoodDetailPopup from './FoodDetailPopup';
import PinnedFoodsCarousel from './PinnedFoodsCarousel';
import { SeasonalFoodResponse, FarmersMarketResponse } from '@/api/types';
import { SeasonalFood } from '@/types/seasonal';

// Dynamic import for LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

/**
 * Main component for the Farmers Market and Seasonal Food mapping feature
 * Integrates map, location selection, and seasonal food discovery
 */
const FarmersMarketMap: React.FC = () => {
  const mapHook = useMap();
  const [selectedFood, setSelectedFood] = useState<SeasonalFoodResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'markets' | 'foods'>('markets');
  const [showMarketDetails, setShowMarketDetails] = useState<boolean>(false);
  
  // Effect to reset tab when location changes
  useEffect(() => {
    if (mapHook.selectedLocation) {
      setActiveTab('markets');
      // Reset market details view when location changes
      setShowMarketDetails(false);
    }
  }, [mapHook.selectedLocation]);

  // Handler for market selection, potentially with details view
  const handleMarketSelect = (market: FarmersMarketResponse | null, showDetails = false) => {
    mapHook.selectMarket(market);
    setShowMarketDetails(showDetails);
    
    // If showDetails is true, ensure markets tab is active
    if (showDetails && market) {
      setActiveTab('markets');
    }
  };

  // Handler for selecting a pinned food - convert to SeasonalFoodResponse for detail view
  const handlePinnedFoodSelect = (food: SeasonalFood) => {
    // Create a compatible food object for the detail popup
    const foodForPopup: SeasonalFoodResponse = {
      id: food.id,
      name: food.name,
      description: food.description || '',
      nutritionalValue: '',
      region: food.region || 'Australia',
      category: '',
      db_category: '',
      availableMonths: [],
      imageUrl: food.image || '',
    };
    
    // Set the source flag to indicate where the popup was opened from
    localStorage.setItem('foodPopupSource', 'carousel');
    setSelectedFood(foodForPopup);
  };

  // Memoized content for the active tab
  const tabContent = useMemo(() => {
    if (!mapHook.selectedLocation) {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center mb-4">
          <div className="text-5xl mb-4">🌎</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Location</h3>
          <p className="text-gray-600 max-w-lg mx-auto">
            Share your location or select a region to discover seasonal foods and farmers markets in your area.
          </p>
        </div>
      );
    }
    
    if (activeTab === 'markets') {
      return (
        <FarmersMarketInfo
          markets={mapHook.nearbyMarkets}
          selectedMarket={mapHook.selectedMarket}
          onMarketSelect={handleMarketSelect}
          onShowAllMarkets={mapHook.zoomToRegion}
          isLoading={mapHook.loadingMarkets}
          showDetails={showMarketDetails}
        />
      );
    } else {
      return (
        <SeasonalFoodsList
          foods={mapHook.currentFoods}
          isLoading={mapHook.seasonalFood.isLoading}
          region={mapHook.selectedLocation.region}
          currentSeason={mapHook.seasonalFood.currentSeason}
          currentMonth={mapHook.seasonalFood.currentMonth}
          onFoodSelect={setSelectedFood}
        />
      );
    }
  }, [
    activeTab, 
    mapHook.selectedLocation, 
    mapHook.nearbyMarkets,
    mapHook.selectedMarket,
    mapHook.selectMarket,
    mapHook.zoomToRegion,
    mapHook.loadingMarkets,
    mapHook.currentFoods,
    mapHook.seasonalFood.isLoading,
    mapHook.seasonalFood.currentSeason,
    mapHook.seasonalFood.currentMonth,
    handleMarketSelect,
    showMarketDetails
  ]);

  return (
    <div className="container mx-auto px-4 pt-8 md:pt-20 pb-12 min-h-screen max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Seasonal Foods & Farmers Markets</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover seasonal produce in your area and find local farmers markets to buy fresh food.
        </p>
      </div>

      {/* Pinned Foods Carousel */}
      <PinnedFoodsCarousel onFoodSelect={handlePinnedFoodSelect} />

      {/* Location selector */}
      <LocationSelector
        onLocationSelect={mapHook.selectLocation}
        onRequestLocation={mapHook.requestAndFocusOnLocation}
        locationShared={mapHook.locationShared}
        locationLoading={mapHook.geolocation.isRequesting}
        selectedLocation={mapHook.selectedLocation}
        permissionStatus={mapHook.geolocation.permissionStatus}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left sidebar for results */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tabs for markets/foods when a location is selected */}
          {mapHook.selectedLocation && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              <div className="flex">
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                    activeTab === 'markets' 
                      ? 'bg-green-100 text-green-800 border-b-2 border-green-500' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('markets')}
                >
                  Farmers Markets
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                    activeTab === 'foods' 
                      ? 'bg-green-100 text-green-800 border-b-2 border-green-500' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('foods')}
                >
                  Seasonal Foods
                </button>
              </div>
            </div>
          )}
          
          {/* Active tab content */}
          {tabContent}
        </div>

        {/* Right side for map */}
        <div className="lg:col-span-8">
          <div className="h-[520px] bg-white rounded-xl shadow-md overflow-hidden relative z-10">
            <LeafletMap
              position={mapHook.mapPosition}
              zoom={mapHook.zoom}
              markets={mapHook.nearbyMarkets}
              selectedMarket={mapHook.selectedMarket}
              onMarketSelect={mapHook.selectMarket}
            />
          </div>
          
          {/* Location context */}
          {mapHook.selectedLocation && (
            <div className="bg-white rounded-xl shadow-md p-3 mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Current Location</div>
                  <div className="font-medium text-gray-900">{mapHook.selectedLocation.region}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={mapHook.resetMap}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Food detail popup */}
      {selectedFood && (
        <FoodDetailPopup
          food={selectedFood}
          onClose={() => {
            // Clear the source flag when closing from here
            localStorage.removeItem('foodPopupSource');
            setSelectedFood(null);
          }}
        />
      )}
    </div>
  );
};

export default FarmersMarketMap; 