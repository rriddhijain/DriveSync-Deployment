import React from "react";

export default function NotificationList({ messages }) {
  return (
    <div className="space-y-2 overflow-y-auto h-[60vh]">
      {messages.map((msg) => (
        <div key={msg.id} className="bg-gray-800 p-3 rounded">
          <div className="flex justify-between">
            <span className="font-bold">{msg.sender}</span>
            {msg.is_emergency && (
              <span className="text-red-500">⚠️</span>
            )}
          </div>
          <p className="text-sm">{msg.text}</p>
          <p className="text-xs text-gray-400">{msg.timestamp}</p>
        </div>
      ))}
    </div>
  );
}