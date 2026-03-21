'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FarmersMarketResponse } from '@/api/types';
import styles from './FarmersMarketMap.module.css';

// Helper component to update map position and zoom
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

// SVG pin marker — no external image dependency
const createMarketIcon = (isSelected: boolean = false) => {
  const fill = isSelected ? '#16a34a' : '#6b7280';
  const inner = isSelected ? '#bbf7d0' : '#e5e7eb';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <ellipse cx="14" cy="34" rx="5" ry="1.5" fill="rgba(0,0,0,0.12)"/>
    <path d="M14 1C8.477 1 4 5.477 4 11c0 7.5 10 23 10 23S24 18.5 24 11C24 5.477 19.523 1 14 1z"
      fill="${fill}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="11" r="5" fill="${inner}"/>
    <circle cx="14" cy="11" r="2.5" fill="${fill}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
};

// Pulsing blue dot for user location
const createUserLocationIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="9" fill="#3b82f6" fill-opacity="0.18" stroke="#3b82f6" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="4.5" fill="#3b82f6"/>
    <circle cx="11" cy="11" r="2" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -13],
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

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={handleMapReady}
        className={`${styles.mapContainer} ${styles.map}`}
      >
        {/* CartoDB Positron — clean light-grey tiles, minimal visual noise */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {/* Zoom controls in bottom right */}
        <ZoomControl position="bottomright" />
        
        {/* Update map when position or zoom changes */}
        {isMapInitialized && <MapUpdater center={position} zoom={zoom} />}
        
        {/* User location marker */}
        {showUserLocation && isMapInitialized && (
          <Marker position={position} icon={createUserLocationIcon() as L.Icon<L.IconOptions>}>
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
              icon={createMarketIcon(selectedMarket?.id === market.id) as L.Icon<L.IconOptions>}
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
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors font-medium"
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
      
      {/* Market count badge */}
      {markets.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm px-3 py-1 text-xs text-gray-500 flex items-center gap-2 z-[400]">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
          {markets.filter(m => m.latitude !== null && m.longitude !== null).length} markets nearby
        </div>
      )}
    </div>
  );
};

export default LeafletMap; 