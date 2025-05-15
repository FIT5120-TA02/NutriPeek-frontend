'use client';

import React, { useState, useEffect } from 'react';
import { FarmersMarketResponse } from '@/api/types';

interface FarmersMarketInfoProps {
  markets: FarmersMarketResponse[];
  selectedMarket: FarmersMarketResponse | null;
  onMarketSelect: (market: FarmersMarketResponse | null) => void;
  onShowAllMarkets?: () => void;
  isLoading?: boolean;
  showDetails?: boolean;
}

/**
 * Component to display farmers market information
 * Shows a list of markets and details of the selected market
 */
const FarmersMarketInfo: React.FC<FarmersMarketInfoProps> = ({
  markets,
  selectedMarket,
  onMarketSelect,
  onShowAllMarkets,
  isLoading = false,
  showDetails = false,
}) => {
  const [expandedInfo, setExpandedInfo] = useState<boolean>(showDetails);
  
  // Effect to update expandedInfo when showDetails prop changes
  useEffect(() => {
    if (showDetails && selectedMarket) {
      setExpandedInfo(true);
    }
  }, [showDetails, selectedMarket]);

  // Function to handle the "Show All Markets" or "Back to List" button click
  const handleBackOrShowAll = () => {
    if (expandedInfo) {
      // If we're in expanded view, just go back to the list
      setExpandedInfo(false);
    } else {
      // If we're in the list view of a single market, show all markets and zoom out
      onMarketSelect(null);
      if (onShowAllMarkets) {
        onShowAllMarkets();
      }
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 h-[540px] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If no markets are found
  if (markets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 h-[540px] flex flex-col">
        <h3 className="text-lg font-semibold mb-2">Nearby Farmers Markets</h3>
        <div className="py-6 text-center flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">🏙️</div>
          <p className="text-gray-600">No markets found in this area.</p>
          <p className="text-gray-500 text-sm">Try selecting a different region or searching for a specific location.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[540px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {selectedMarket 
            ? expandedInfo 
              ? selectedMarket.name 
              : `Farmers Markets in ${selectedMarket.city || selectedMarket.region}`
            : `Nearby Farmers Markets (${markets.length})`}
        </h3>
        
        {/* Back button when viewing details */}
        {selectedMarket && (
          <button 
            onClick={handleBackOrShowAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {expandedInfo ? 'Back to List' : 'Show All Markets'}
          </button>
        )}
      </div>
      
      {/* Market list */}
      {!selectedMarket || !expandedInfo ? (
        <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
          {(selectedMarket ? [selectedMarket] : markets).map((market) => (
            <div 
              key={market.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                onMarketSelect(market);
                if (selectedMarket?.id === market.id) {
                  setExpandedInfo(true);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{market.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{market.address}{market.city ? `, ${market.city}` : ''}</p>
                  
                  {/* Show opening hours text */}
                  <p className="text-xs text-gray-500 mt-1">
                    {market.opening_hours_text || (market.primary_day ? `Open: ${market.primary_day}` : '')}
                  </p>
                  
                  {/* Show distance if available */}
                  {'distance' in market && typeof market.distance === 'number' && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {market.distance.toFixed(1)} km away
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action button */}
                <button 
                  className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarketSelect(market);
                    setExpandedInfo(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Market details */
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            <p className="text-gray-700">{selectedMarket.description || 'No description available.'}</p>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Address</h4>
              <p className="text-gray-600">
                {selectedMarket.address}{selectedMarket.city ? `, ${selectedMarket.city}` : ''}
                {selectedMarket.postal_code ? ` ${selectedMarket.postal_code}` : ''}
              </p>
            </div>
            
            {/* Opening hours */}
            {selectedMarket.opening_hours_text && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Opening Hours</h4>
                <p className="text-gray-600 text-sm">{selectedMarket.opening_hours_text}</p>
                
                {selectedMarket.primary_day && (
                  <p className="text-gray-600 text-sm mt-1">
                    <span className="font-medium">Primary Day:</span> {selectedMarket.primary_day}
                    {selectedMarket.opening_time && selectedMarket.closing_time && 
                      ` (${selectedMarket.opening_time.substring(0, 5)} - ${selectedMarket.closing_time.substring(0, 5)})`}
                  </p>
                )}
                
                {selectedMarket.is_recurring && selectedMarket.frequency && (
                  <p className="text-gray-600 text-sm mt-1">
                    <span className="font-medium">Frequency:</span> {selectedMarket.frequency}
                  </p>
                )}
              </div>
            )}
            
            {/* Contact */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Information</h4>
              <ul className="space-y-1">
                {selectedMarket.phone && (
                  <li className="text-gray-600 text-sm">
                    <span className="font-medium">Phone:</span> {selectedMarket.phone}
                  </li>
                )}
                {selectedMarket.email && (
                  <li className="text-gray-600 text-sm">
                    <span className="font-medium">Email:</span> {selectedMarket.email}
                  </li>
                )}
                {selectedMarket.website && (
                  <li className="text-sm">
                    <a 
                      href={selectedMarket.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Directions button - only show if coordinates are available */}
            {selectedMarket.latitude !== null && selectedMarket.longitude !== null && (
              <div className="mt-4">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarket.latitude},${selectedMarket.longitude}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Get Directions
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersMarketInfo; 