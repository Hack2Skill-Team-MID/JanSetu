'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MarkerData = {
  id: string;
  position: [number, number];
  title: string;
  type: 'need' | 'campaign' | 'ngo';
  category?: string;
  urgency?: string;
  description?: string;
};

const COLORS: Record<string, string> = {
  need: '#ef4444',
  campaign: '#6366f1',
  ngo: '#10b981',
};

export default function MapView({ markers }: { markers: MarkerData[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Center on India
    const map = L.map(mapRef.current, {
      center: [22.5, 78.9],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    // Add new markers
    markers.forEach((m) => {
      const color = COLORS[m.type] || '#6366f1';

      const circle = L.circleMarker(m.position, {
        radius: m.type === 'need' && m.urgency === 'critical' ? 10 : 7,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6,
      }).addTo(map);

      const urgencyBadge = m.urgency
        ? `<span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;background:${
            m.urgency === 'critical' ? '#ef4444' : m.urgency === 'high' ? '#f59e0b' : '#6b7280'
          };color:white;margin-left:6px;">${m.urgency.toUpperCase()}</span>`
        : '';

      circle.bindPopup(`
        <div style="min-width:200px;font-family:system-ui;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${color};font-weight:700;margin-bottom:4px;">
            ${m.type}
          </div>
          <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:6px;">
            ${m.title} ${urgencyBadge}
          </div>
          ${m.category ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Category: ${m.category}</div>` : ''}
          ${m.description ? `<div style="font-size:12px;color:#cbd5e1;line-height:1.4;">${m.description}...</div>` : ''}
        </div>
      `, {
        className: 'dark-popup',
      });
    });
  }, [markers]);

  return (
    <>
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .dark-popup .leaflet-popup-tip {
          background: #1e293b;
          border-right: 1px solid #334155;
          border-bottom: 1px solid #334155;
        }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #334155 !important;
        }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
    </>
  );
}
