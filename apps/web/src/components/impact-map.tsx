'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// We must dynamite import the MapContainer because leaflet requires the window object
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export function ImpactMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // To fix Leaflet's default icon issue with Next.js/Webpack
    setMounted(true);
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: require('leaflet/dist/images/marker-icon.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: require('leaflet/dist/images/marker-shadow.png').default?.src || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) return <div className="h-[400px] w-full rounded-2xl glass-card animate-pulse flex items-center justify-center">Loading Map...</div>;

  // Mock data for the hackathon displaying platform impact
  const points = [
    { id: 1, pos: [28.6139, 77.2090] as [number, number], title: "Food Distribution Drive", type: "campaign", location: "New Delhi" },
    { id: 2, pos: [19.0760, 72.8777] as [number, number], title: "Slum Education Initiative", type: "ngo", location: "Mumbai" },
    { id: 3, pos: [12.9716, 77.5946] as [number, number], title: "Tech Literacy for All", type: "task", location: "Bangalore" },
    { id: 4, pos: [22.5726, 88.3639] as [number, number], title: "Flood Relief Supply", type: "emergency", location: "Kolkata" },
    { id: 5, pos: [13.0827, 80.2707] as [number, number], title: "Medical Camp Setup", type: "campaign", location: "Chennai" },
    { id: 6, pos: [21.1458, 79.0882] as [number, number], title: "Clean Water Project", type: "campaign", location: "Nagpur" }
  ];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden glass-card border border-slate-800 z-0 relative shadow-2xl">
      {/* Absolute overlay for styling */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <h2 className="text-xl font-bold text-slate-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20">
          JanSetu Live Impact map
        </h2>
      </div>

      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={4} 
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ background: '#0f172a' }} // match tailwind muted
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {points.map((pt) => (
          <Marker key={pt.id} position={pt.pos}>
            <Popup className="rounded-xl overflow-hidden">
              <div className="font-sans">
                <p className="font-bold text-indigo-600 mb-1">{pt.title}</p>
                <p className="text-xs text-slate-500 mb-2">{pt.location}</p>
                <div className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded inline-block uppercase">
                  {pt.type}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
