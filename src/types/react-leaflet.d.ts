import { LatLngExpression, LatLngBounds, Icon, LeafletEventHandlerFnMap } from 'leaflet';
import { ReactNode } from 'react';

declare module 'react-leaflet' {
  export interface MapContainerProps {
    center: LatLngExpression;
    zoom: number;
    scrollWheelZoom?: boolean;
    style?: React.CSSProperties;
    className?: string;
    zoomControl?: boolean;
    whenReady?: () => void;
    whenCreated?: (map: any) => void;
    children?: ReactNode;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
    zIndex?: number;
    children?: ReactNode;
  }

  export interface MarkerProps {
    position: LatLngExpression;
    icon?: Icon;
    draggable?: boolean;
    eventHandlers?: LeafletEventHandlerFnMap;
    children?: ReactNode;
  }

  export interface PopupProps {
    position?: LatLngExpression;
    children?: ReactNode;
  }

  export interface ZoomControlProps {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  }

  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Popup: React.FC<PopupProps>;
  export const ZoomControl: React.FC<ZoomControlProps>;
  export function useMap(): any;
} 