/**
 * SignalHeatmap — react-leaflet compatible heatmap layer
 *
 * Renders a leaflet.heat layer on the map using L.heatLayer.
 * Uses useMap() from react-leaflet to attach to the current map instance.
 *
 * @module map/SignalHeatmap
 */

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

/**
 * @param {Object} props
 * @param {Array<[number, number, number]>} props.points - Array of [lat, lng, intensity]
 * @param {Object} [props.options] - Additional L.heatLayer options
 */
export default function SignalHeatmap({ points, options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    /** @type {L.HeatLayer} */
    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.4: "red",
        0.6: "yellow",
        1.0: "lime",
      },
      ...options,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  // This component renders nothing — it only attaches a canvas layer to the map
  return null;
}
