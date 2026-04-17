import React from "react";

export default function PredictiveBar({ network }) {
  return (
    <div className="mb-4">
      <div
        className={`h-3 rounded ${
          network === "DEAD_ZONE" ? "bg-red-500" : "bg-green-500"
        }`}
      ></div>
      <p className="text-xs mt-1">
        {network === "DEAD_ZONE" ? "Signal Lost" : "Stable Connection"}
      </p>
    </div>
  );
}