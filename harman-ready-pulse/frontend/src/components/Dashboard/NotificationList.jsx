import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import NotificationItem from "./NotificationItem";

export default function NotificationList({ messages }) {
  // Feed strictly sorts by absolutePriority (ascending) then by timestamp (descending)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      // Emergency always on top, we can represent it as absolutePriority 0
      const aPriority = a.is_emergency ? 0 : (a.absolutePriority || a.priority || 4);
      const bPriority = b.is_emergency ? 0 : (b.absolutePriority || b.priority || 4);
      
      return aPriority - bPriority || (b.timestamp - a.timestamp);
    });
  }, [messages]);

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {sortedMessages.map((msg, i) => (
          <NotificationItem key={msg.id} msg={msg} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}