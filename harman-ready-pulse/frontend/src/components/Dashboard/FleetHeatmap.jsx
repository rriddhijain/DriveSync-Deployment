import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { socket } from "../../socket";
import UnifiedHeatmapLayer from './UnifiedHeatmapLayer';

// Mini car icon for ghost cars
const ghostCarIcon = L.divIcon({
  html: `<div style="
    width: 12px;
    height: 12px;
    background-color: #00ffff;
    border-radius: 50%;
    box-shadow: 0 0 10px 4px rgba(0, 255, 255, 0.8), 0 0 20px 8px rgba(0, 255, 255, 0.4);
  "></div>`,
  className: '', // pass empty string to disable default Leaflet icon styles
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export default function FleetHeatmap() {
  const [liveTelemetryBuffer, setLiveTelemetryBuffer] = useState([]);
  const [liveCars, setLiveCars] = useState([]);

  useEffect(() => {
    const handleSync = (payload) => {
      if (Array.isArray(payload)) {
         // Fallback just in case old payload comes in
         setLiveTelemetryBuffer(payload);
         setLiveCars(payload.slice(-10));
      } else {
         // New structured payload
         setLiveTelemetryBuffer(payload.buffer || []);
         setLiveCars(payload.activeCars || []);
      }
    };

    socket.on('fleet_telemetry_sync', handleSync);
    return () => socket.off('fleet_telemetry_sync', handleSync);
  }, []);

  return (
    <div className="h-full w-full relative group">
      <div className="absolute top-6 left-6 z-[1000] glass p-4 rounded-xl shadow-lg border border-gray-700/50">
         <h2 className="text-white font-bold tracking-widest uppercase mb-1">Fleet Telemetry Link</h2>
         <p className="text-gray-400 text-xs">Crowdsourcing Live Dead Zones from {liveCars.length} Vehicles</p>
         <div className="flex gap-4 mt-3 text-xs font-bold text-gray-300">
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full blur-sm"></span> Dead Zone</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full blur-sm"></span> Active 5G</div>
         </div>
      </div>
      
      <MapContainer 
        center={[12.95, 77.63]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        minZoom={11}
        maxBounds={[[12.85, 77.45], [13.10, 77.75]]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <UnifiedHeatmapLayer data={liveTelemetryBuffer} />
        {liveCars.map((car, idx) => {
          if (!Array.isArray(car) || car.length < 2 || typeof car[0] !== 'number' || isNaN(car[0]) || typeof car[1] !== 'number' || isNaN(car[1])) return null;
          return <Marker key={`car-${idx}-${car[2]||''}`} position={[car[0], car[1]]} icon={ghostCarIcon} />;
        })}
      </MapContainer>
    </div>
  );
}
