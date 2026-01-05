
import React, { useEffect, useRef } from 'react';
import { CivicIssue, Priority } from '../types';

interface MapViewProps {
  issues: CivicIssue[];
}

const MapView: React.FC<MapViewProps> = ({ issues }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const getMarkerColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return '#EF4444'; // Red
      case Priority.MEDIUM: return '#F59E0B'; // Amber
      case Priority.LOW: return '#3B82F6'; // Blue
      default: return '#10B981';
    }
  };

  useEffect(() => {
    const initMap = () => {
      const google = (window as any).google;
      if (!google || !google.maps || !mapRef.current) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          renderMap({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback: Center of a generic city
          renderMap({ lat: 37.7749, lng: -122.4194 });
        }
      );
    };

    const renderMap = (center: { lat: number, lng: number }) => {
      const google = (window as any).google;
      if (!google || !google.maps || !mapRef.current) return;

      googleMap.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      updateMarkers();
    };

    // Check if google is available immediately, otherwise wait a bit
    const checkGoogle = setInterval(() => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        clearInterval(checkGoogle);
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, []);

  useEffect(() => {
    if (googleMap.current) {
      updateMarkers();
    }
  }, [issues]);

  const updateMarkers = () => {
    const google = (window as any).google;
    if (!google || !google.maps || !googleMap.current) return;

    // Clear old markers
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];

    issues.forEach(issue => {
      const marker = new google.maps.Marker({
        position: issue.location,
        map: googleMap.current,
        title: issue.aiSummary,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(issue.priority),
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 10
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: sans-serif; min-width: 150px;">
            <div style="margin-bottom: 4px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: bold; background: ${getMarkerColor(issue.priority)}20; color: ${getMarkerColor(issue.priority)};">
                ${issue.priority} Priority
              </span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #111827;">${issue.aiSummary}</h4>
            <p style="margin: 0; font-size: 11px; color: #6b7280;">${new Date(issue.timestamp).toLocaleDateString()}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMap.current, marker);
      });

      markers.current.push(marker);
    });
  };

  return <div id="map-container" ref={mapRef} className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
    Initializing Map...
  </div>;
};

export default MapView;
