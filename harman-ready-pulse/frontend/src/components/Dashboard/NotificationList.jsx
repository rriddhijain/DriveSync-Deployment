import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import NotificationItem from "./NotificationItem";

export default function NotificationList({ messages }) {
  // Feed strictly sorts by absolutePriority (ascending) then by timestamp (descending)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const getPriority = (msg) => {
        // Emergency notifications are always on absolute top
        if (msg.is_emergency) return -2;
        // AI Summary cards come right after emergencies
        if (msg.isSummaryCard) return -1;
        // Then normal messages by their priority (1-4)
        return msg.absolutePriority || msg.priority || 4;
      };

      const aPriority = getPriority(a);
      const bPriority = getPriority(b);
      
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