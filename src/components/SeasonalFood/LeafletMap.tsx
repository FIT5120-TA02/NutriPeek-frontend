'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FarmersMarketResponse } from '@/api/types';
import styles from './FarmersMarketMap.module.css';

// Fix Leaflet icon path issue
const fixLeafletIcon = () => {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Helper component to update map position and zoom
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Custom marker icon creator
const createMarketIcon = (isSelected: boolean = false) => {
  return new L.Icon({
    iconUrl: isSelected 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// User location marker
const createUserLocationIcon = () => {
  return new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LeafletMapProps {
  position: [number, number];
  zoom: number;
  markets: FarmersMarketResponse[];
  selectedMarket: FarmersMarketResponse | null;
  onMarketSelect: (market: FarmersMarketResponse, showDetails?: boolean) => void;
  showUserLocation?: boolean;
  isLoading?: boolean;
}

/**
 * Interactive Leaflet map component for farmers markets
 * Displays markets as markers and allows interaction
 */
const LeafletMap: React.FC<LeafletMapProps> = ({
  position,
  zoom,
  markets,
  selectedMarket,
  onMarketSelect,
  showUserLocation = true,
  isLoading = false,
}) => {
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  
  // Fix Leaflet icon paths on component mount
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Handler for map ready event
  const handleMapReady = useCallback(() => {
    setIsMapInitialized(true);
  }, []);
  
  // Effect to open popup for selected market
  useEffect(() => {
    if (selectedMarket) {
      setOpenPopupId(selectedMarket.id);
    } else {
      setOpenPopupId(null);
    }
  }, [selectedMarket]);

  // Attribution text for map
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={handleMapReady}
        className={styles.mapContainer}
      >
        {/* Map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={attribution}
        />
        
        {/* Zoom controls in bottom right */}
        <ZoomControl position="bottomright" />
        
        {/* Update map when position or zoom changes */}
        {isMapInitialized && <MapUpdater center={position} zoom={zoom} />}
        
        {/* User location marker */}
        {showUserLocation && isMapInitialized && (
          <Marker position={position} icon={createUserLocationIcon()}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold">Your Location</h3>
                <p>This is your approximate location based on coordinates.</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Market markers - only show markers for markets with valid coordinates */}
        {markets
          .filter(market => market.latitude !== null && market.longitude !== null)
          .map(market => (
            <Marker
              key={market.id}
              position={[Number(market.latitude), Number(market.longitude)]}
              icon={createMarketIcon(selectedMarket?.id === market.id)}
              eventHandlers={{
                click: () => {
                  onMarketSelect(market, true);
                  setOpenPopupId(market.id);
                },
              }}
            >
              <Popup
                autoPan={true}
                closeButton={true}
              >
                <div className="text-sm p-2 max-w-[230px]">
                  <h3 className="font-semibold text-base mb-2">{market.name}</h3>
                  
                  {/* Simplified content - only address and opening hours */}
                  <div className="mb-3 text-gray-700">
                    <p className="mb-1">
                      {market.address}
                      {market.city ? `, ${market.city}` : ''}
                    </p>
                    
                    {market.opening_hours_text && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">Open:</span> {' '}
                        {market.opening_hours_text.length > 50 
                          ? `${market.opening_hours_text.substring(0, 50)}...` 
                          : market.opening_hours_text}
                      </p>
                    )}
                  </div>
                  
                  {/* Full-width CTA button with just margin on the card */}
                  <div className="mt-3 -mx-2 px-2">
                    <button
                      onClick={() => onMarketSelect(market, true)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[500]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
      
      {/* Map overlay with info text */}
      <div className="absolute top-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm px-3 py-2 text-xs text-gray-600 flex justify-between items-center z-[400]">
        <div>
          <span className="font-medium">Showing:</span> {markets.filter(m => m.latitude !== null && m.longitude !== null).length} farmers markets 
          {markets.length > 0 && ' in this area'}
        </div>
        {markets.length > 0 && (
          <div>
            <span className="text-blue-500 text-xs">●</span> Markets
            <span className="text-green-500 text-xs ml-3">●</span> Your location
          </div>
        )}
      </div>
    </div>
  );
};

export default LeafletMap; 