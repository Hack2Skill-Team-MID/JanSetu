'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Crisis, City } from '../../types/crisis-map.types';
import { CATEGORY_COLORS, URGENCY_COLORS } from '../../types/crisis-map.types';

interface CrisisMapViewProps {
  crises: Crisis[];
  selectedCity: City | null;
  isLive: boolean;
  onMarkerClick: (crisis: Crisis) => void;
  selectedCrisis: Crisis | null;
}

/* ── Build a styled div-icon that matches the reference image ── */
function makeMarkerIcon(color: string, urgencyColor: string, isSelected: boolean, isGlobal = false): L.DivIcon {
  const size = isSelected ? 22 : isGlobal ? 10 : 16;
  const glow = isSelected
    ? `0 0 0 4px ${color}33, 0 0 20px ${color}88`
    : `0 0 8px ${color}99`;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      box-shadow:${glow};
      border:${isSelected ? `2.5px solid white` : '0'};
      transition:all 0.2s ease;
      cursor:pointer;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function CrisisMapView({
  crises,
  selectedCity,
  isLive,
  onMarkerClick,
  selectedCrisis,
}: CrisisMapViewProps) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapInst    = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  /* ── Init map ── */
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    const map = L.map(mapRef.current, {
      center: [22.5, 78.9],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom dark tile — matches reference image exactly
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInst.current = map;

    return () => {
      map.remove();
      mapInst.current = null;
      markersRef.current.clear();
    };
  }, []);

  /* ── Pan / zoom when city changes ── */
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;
    if (selectedCity) {
      map.flyTo(selectedCity.coordinates, selectedCity.zoom, { duration: 1.0, easeLinearity: 0.3 });
    } else {
      map.flyTo([22.5, 78.9], 5, { duration: 1.0 });
    }
  }, [selectedCity]);

  /* ── Render markers ── */
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;

    if (!isLive) {
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current.clear();
      return;
    }

    const currentIds = new Set(crises.map(c => c.id || c._id));

    // Remove old markers
    markersRef.current.forEach((marker, mId) => {
      if (!currentIds.has(mId)) {
        map.removeLayer(marker);
        markersRef.current.delete(mId);
      }
    });

    // Add new markers
    crises.forEach((crisis) => {
      const crisisId = crisis.id || crisis._id || '';
      if (markersRef.current.has(crisisId)) return;

      let lat: number | undefined;
      let lng: number | undefined;
      
      if (typeof crisis.location === 'object' && crisis.location !== null && 'lat' in crisis.location) {
        lat = crisis.location.lat;
        lng = crisis.location.lng;
      } else if (crisis.coordinates?.length === 2) {
        lat = crisis.coordinates[1]; // lat
        lng = crisis.coordinates[0]; // lng
      }

      if (lat === undefined || lng === undefined || (lat === 0 && lng === 0)) return;

      const crisisCategory = crisis.category || 'other';
      const crisisUrgency = crisis.urgencyLevel || crisis.severity || 'medium';

      const color     = CATEGORY_COLORS[crisisCategory] || '#6366f1';
      const urgColor  = URGENCY_COLORS[crisisUrgency] || '#6b7280';
      const isSelected = (selectedCrisis?.id || selectedCrisis?._id) === crisisId;

      const marker = L.marker([lat, lng], {
        icon: makeMarkerIcon(color, urgColor, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // Tooltip on hover — shows title + category with no position shift
      const urgencyLabel = crisisUrgency.charAt(0).toUpperCase() + crisisUrgency.slice(1);
      const categoryLabel = crisisCategory.charAt(0).toUpperCase() + crisisCategory.slice(1);
      marker.bindTooltip(
        `<div class="jansetu-tooltip"><strong>${crisis.title}</strong><span>${categoryLabel} &middot; ${urgencyLabel}</span></div>`,
        { direction: 'top', offset: [0, -10], opacity: 1, className: 'jansetu-tooltip-wrap' }
      );

      marker.on('click', () => onMarkerClick(crisis));
      marker.addTo(map);
      markersRef.current.set(crisisId, marker);
    });
  }, [crises, isLive, selectedCrisis, onMarkerClick]);

  /* ── Update icon when selection changes ── */
  useEffect(() => {
    markersRef.current.forEach((marker, mId) => {
      const crisis = crises.find((c) => (c.id || c._id) === mId);
      if (!crisis) return;
      const crisisCategory = crisis.category || 'other';
      const crisisUrgency = crisis.urgencyLevel || crisis.severity || 'medium';
      const color    = CATEGORY_COLORS[crisisCategory] || '#6366f1';
      const urgColor = URGENCY_COLORS[crisisUrgency] || '#6b7280';
      const isSelected = (selectedCrisis?.id || selectedCrisis?._id) === mId;
      marker.setIcon(makeMarkerIcon(color, urgColor, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    });
  }, [selectedCrisis, crises]);

  return (
    <>
      <style>{`
        /* ── Lower Leaflet's internal z-indexes so React overlays can appear above ── */
        .leaflet-pane         { z-index: 1 !important; }
        .leaflet-tile-pane    { z-index: 1 !important; }
        .leaflet-overlay-pane { z-index: 2 !important; }
        .leaflet-shadow-pane  { z-index: 3 !important; }
        .leaflet-marker-pane  { z-index: 4 !important; }
        .leaflet-tooltip-pane { z-index: 5 !important; }
        .leaflet-popup-pane   { z-index: 6 !important; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin: 0 12px 50px 0 !important;
          z-index: 7 !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15,23,42,0.95) !important;
          color: #94a3b8 !important;
          border: none !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          border-bottom: 1px solid rgba(51,65,85,0.5) !important;
        }
        .leaflet-control-zoom a:last-child { border-bottom: none !important; }
        .leaflet-control-zoom a:hover {
          background: rgba(30,41,59,0.98) !important;
          color: #e2e8f0 !important;
        }
        .leaflet-marker-icon { background: none !important; border: none !important; }
        .leaflet-container { background: #0f172a; }
        .leaflet-bottom.leaflet-right { z-index: 7 !important; }

        /* Tooltip styling */
        .jansetu-tooltip-wrap {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .jansetu-tooltip-wrap::before { display: none !important; }
        .jansetu-tooltip {
          background: rgba(10,16,28,0.92);
          border: 1px solid rgba(99,102,241,0.4);
          backdrop-filter: blur(8px);
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          white-space: nowrap;
          pointer-events: none;
        }
        .jansetu-tooltip strong {
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 600;
        }
        .jansetu-tooltip span {
          color: #94a3b8;
          font-size: 10px;
        }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '520px', borderRadius: 'inherit', position: 'absolute', inset: 0 }} />
    </>
  );
}
