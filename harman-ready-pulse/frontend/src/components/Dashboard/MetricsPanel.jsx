import React from "react";

export default function MetricsPanel({ queueCount }) {
  return (
    <div className="bg-gray-900 p-4 rounded">
      <h2 className="text-lg mb-2">System Metrics</h2>
      <p>Queued Messages: {queueCount}</p>
      <p>Data Saved: {queueCount * 5}%</p>
    </div>
  );
}