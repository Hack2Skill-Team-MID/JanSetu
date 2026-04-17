'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Crisis, City } from '../../../types/crisis-map.types';
import { CATEGORY_COLORS, URGENCY_COLORS } from '../../../types/crisis-map.types';

interface CrisisMapViewProps {
  crises: Crisis[];
  selectedCity: City | null;
  isLive: boolean;
  onMarkerClick: (crisis: Crisis) => void;
  selectedCrisis: Crisis | null;
}

export default function CrisisMapView({
  crises,
  selectedCity,
  isLive,
  onMarkerClick,
  selectedCrisis,
}: CrisisMapViewProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInst   = useRef<L.Map | null>(null);
  const markers   = useRef<Map<string, L.CircleMarker>>(new Map());

  /* ── Init map once ── */
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    const map = L.map(mapRef.current, {
      center: [22.5, 78.9],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInst.current = map;

    return () => {
      map.remove();
      mapInst.current = null;
      markers.current.clear();
    };
  }, []);

  /* ── Pan / zoom when city changes ── */
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;
    if (selectedCity) {
      map.flyTo(selectedCity.coordinates, selectedCity.zoom, { duration: 1.2 });
    } else {
      map.flyTo([22.5, 78.9], 5, { duration: 1.2 });
    }
  }, [selectedCity]);

  /* ── Re-render markers when crises / isLive changes ── */
  useEffect(() => {
    const map = mapInst.current;
    if (!map) return;

    // Remove all existing crisis markers
    markers.current.forEach((m) => map.removeLayer(m));
    markers.current.clear();

    if (!isLive) return; // Live OFF → show nothing

    crises.forEach((crisis) => {
      if (!crisis.coordinates?.length) return;
      const [lng, lat] = crisis.coordinates;
      if (!lat || !lng) return;

      const color    = CATEGORY_COLORS[crisis.category] || '#6366f1';
      const urgColor = URGENCY_COLORS[crisis.urgencyLevel] || '#6b7280';
      const radius   = crisis.urgencyLevel === 'critical' ? 12 : crisis.urgencyLevel === 'high' ? 9 : 7;

      const circle = L.circleMarker([lat, lng], {
        radius,
        fillColor: color,
        color: urgColor,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.75,
      });

      // Pulse ring for critical
      if (crisis.urgencyLevel === 'critical') {
        L.circleMarker([lat, lng], {
          radius: radius + 6,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.3,
          fillOpacity: 0.15,
          interactive: false,
        }).addTo(map);
      }

      circle.on('click', () => onMarkerClick(crisis));
      circle.on('mouseover', function () {
        this.setStyle({ radius: radius + 3, fillOpacity: 1 });
      });
      circle.on('mouseout', function () {
        this.setStyle({ radius, fillOpacity: 0.75 });
      });

      circle.bindTooltip(
        `<div style="font-size:12px;font-weight:600;color:#e2e8f0">${crisis.title}</div>
         <div style="font-size:10px;color:${urgColor};font-weight:700;text-transform:uppercase">${crisis.urgencyLevel}</div>`,
        { className: 'crisis-tooltip', sticky: true }
      );

      circle.addTo(map);
      markers.current.set(crisis._id, circle);
    });
  }, [crises, isLive, onMarkerClick]);

  /* ── Highlight selected crisis ── */
  useEffect(() => {
    markers.current.forEach((circle, id) => {
      if (selectedCrisis && id === selectedCrisis._id) {
        circle.setStyle({ weight: 3, opacity: 1, fillOpacity: 1, radius: 14 });
      } else {
        const crisis = crises.find((c) => c._id === id);
        if (!crisis) return;
        const r = crisis.urgencyLevel === 'critical' ? 12 : crisis.urgencyLevel === 'high' ? 9 : 7;
        circle.setStyle({ weight: 2, opacity: 1, fillOpacity: 0.75, radius: r });
      }
    });
  }, [selectedCrisis, crises]);

  return (
    <>
      <style>{`
        .crisis-tooltip {
          background: #1e293b !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
        }
        .crisis-tooltip::before { display: none !important; }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover { background: #334155 !important; }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '480px' }} />
    </>
  );
}
