import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function UnifiedHeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // Filter out invalid heatmap coordinates
    const safeData = data.filter(d => 
      Array.isArray(d) && 
      d.length >= 2 && 
      typeof d[0] === 'number' && !isNaN(d[0]) &&
      typeof d[1] === 'number' && !isNaN(d[1])
    );

    if (safeData.length === 0) return;

    const heatLayer = L.heatLayer(safeData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.1: 'red',
        0.4: 'orange',
        0.6: 'yellow',
        1.0: '#22c55e'
      }
    });

    heatLayer.addTo(map);

    return () => { // Ensure removal always runs
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
}
