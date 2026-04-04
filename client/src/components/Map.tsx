/**
 * Google Maps component — placeholder (Manus Forge proxy removed)
 * To use Google Maps, add your own API key via VITE_GOOGLE_MAPS_API_KEY
 */
import React from "react";

interface MapViewProps {
  onMapReady?: (map: google.maps.Map) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function MapView({ className, style }: MapViewProps) {
  return (
    <div className={className} style={style}>
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-muted-foreground text-sm">
          Mapa não configurado. Configure VITE_GOOGLE_MAPS_API_KEY.
        </p>
      </div>
    </div>
  );
}

export default MapView;
