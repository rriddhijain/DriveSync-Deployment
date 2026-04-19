import React, { useState } from "react";
import { MessageCircle, Users, Hash, Bell, Mail, Play, Camera, AlertTriangle, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const getAppMetadata = (appName) => {
  switch (appName) {
    case "WhatsApp":
      return { title: "WhatsApp", Icon: MessageCircle, color: "text-green-400", bg: "bg-green-500/10" };
    case "Gmail":
      return { title: "Gmail", Icon: Mail, color: "text-red-400", bg: "bg-red-500/10" };
    case "Teams":
      return { title: "Teams", Icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" };
    case "Slack":
      return { title: "Slack", Icon: Hash, color: "text-purple-400", bg: "bg-purple-500/10" };
    case "YouTube":
      return { title: "YouTube", Icon: Play, color: "text-red-500", bg: "bg-red-500/10" };
    case "Instagram":
      return { title: "Instagram", Icon: Camera, color: "text-pink-400", bg: "bg-pink-500/10" };
    default:
      return { title: appName || "Notification", Icon: Bell, color: "text-gray-400", bg: "bg-gray-500/10" };
  }
};

const getPriorityBadge = (priority, isEmergency, isContactOverride) => {
  if (isEmergency || priority === 0) {
    return { text: "🚨 EMERGENCY", className: "bg-red-600 text-white font-bold animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)] border border-red-500" };
  }
  if (isContactOverride) {
    return { text: "⭐ VIP Override", className: "bg-yellow-900/60 text-yellow-400 border border-yellow-700/50" };
  }
  if (priority === 999) {
    return { text: "Muted (Time Gate)", className: "bg-gray-800/60 text-gray-500 border border-gray-700/50" };
  }
  switch (priority) {
    case 1:
      return { text: "High", className: "bg-indigo-900/60 text-indigo-400 border border-indigo-500/50" };
    case 2:
      return { text: "Medium", className: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50" };
    case 3:
      return { text: "Low", className: "bg-gray-800/80 text-gray-500 border border-gray-700/50" };
    default:
      return { text: "Normal", className: "bg-gray-800 text-gray-500 border border-gray-700" };
  }
};

const NotificationItem = React.memo(({ msg, index = 0 }) => {
  const priority = msg.absolutePriority !== undefined ? msg.absolutePriority : (msg.priority !== undefined ? msg.priority : 2);
  const { title, Icon, color, bg } = getAppMetadata(msg.app);
  const badge = getPriorityBadge(priority, msg.is_emergency, msg.isContactOverride);
  const isEmergency = msg.is_emergency || priority === 0;

  const displayTime = msg.displayTime || (
    typeof msg.timestamp === "number"
      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : msg.timestamp
  );

  const senderDisplay = msg.app?.toLowerCase() === 'whatsapp' ? msg.sender : null;

  // Offline Recovery Summary Card
  const [isExpanded, setIsExpanded] = useState(false);

  if (msg.isSummaryCard) {
    const handleReplay = () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        let fullSpeech = msg.text || "No summary available";

        // Chrome garbage collection workaround
        window.currentNotificationUtterance = new SpeechSynthesisUtterance(fullSpeech);
        window.currentNotificationUtterance.rate = 1.0; 
        window.currentNotificationUtterance.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
        if (enVoice) {
            window.currentNotificationUtterance.voice = enVoice;
        }

        window.speechSynthesis.speak(window.currentNotificationUtterance);
      }
    };

    // Group deferred
    const deferredP2 = msg.deferredMessages?.filter(m => (m.absolutePriority !== undefined ? m.absolutePriority : (m.priority || 2)) === 2) || [];
    const deferredP3 = msg.deferredMessages?.filter(m => (m.absolutePriority !== undefined ? m.absolutePriority : (m.priority || 2)) >= 3 && (m.absolutePriority !== undefined ? m.absolutePriority : (m.priority || 2)) !== 999) || [];
    const deferredMuted = msg.deferredMessages?.filter(m => (m.absolutePriority !== undefined ? m.absolutePriority : (m.priority || 2)) === 999) || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        layout
        className="p-4 rounded-xl border border-indigo-500 bg-indigo-950/50 mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold text-indigo-300 text-sm uppercase tracking-wide">{msg.title}</span>
              <p className="text-indigo-400/70 text-[10px]">{msg.subtitle}</p>
            </div>
          </div>
        </div>
        <p className="text-white font-medium text-sm leading-relaxed mb-3">{msg.text}</p>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleReplay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg transition-colors border border-indigo-500/30"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Replay
          </button>
          
          {msg.deferredMessages && msg.deferredMessages.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 text-xs font-semibold rounded-lg transition-colors border border-gray-700/50"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isExpanded ? "Hide Notifications" : "View All Notifications"}
            </button>
          )}
        </div>

        {isExpanded && msg.deferredMessages && (
             <div className="mt-4 pt-3 border-t border-indigo-500/30 space-y-4">
                {deferredP2.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-yellow-500/80 uppercase tracking-wider mb-2">Medium Priority ({deferredP2.length})</h4>
                    <div className="space-y-2">
                       {deferredP2.map((m, i) => <NotificationItem key={'p2-'+i} msg={m} />)}
                    </div>
                  </div>
                )}
                {deferredP3.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400/80 uppercase tracking-wider mb-2">Low Priority ({deferredP3.length})</h4>
                    <div className="space-y-2">
                       {deferredP3.map((m, i) => <NotificationItem key={'p3-'+i} msg={m} />)}
                    </div>
                  </div>
                )}
                {deferredMuted.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-600/80 uppercase tracking-wider mb-2">Muted ({deferredMuted.length})</h4>
                    <div className="space-y-2">
                       {deferredMuted.map((m, i) => <NotificationItem key={'muted-'+i} msg={m} />)}
                    </div>
                  </div>
                )}
             </div>
        )}
      </motion.div>
    );
  }

  // Emergency styling
  if (isEmergency) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        layout
        className="animate-emergency p-4 rounded-xl border border-red-500 bg-red-950/50 mb-3"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="font-bold text-red-300 text-sm uppercase tracking-wide">{title}</span>
              {senderDisplay && <p className="text-red-400/70 text-[10px]">{senderDisplay}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badge.className}`}>
              {badge.text}
            </span>
            <span className="text-xs text-red-400/60 font-mono">{displayTime}</span>
          </div>
        </div>
        <p className="text-white font-medium text-sm">{msg.text}</p>
      </motion.div>
    );
  }

  // Priority-based card styles
  let cardBorder = "border-gray-800/60";
  let cardBg = "glass";
  let textClass = "text-gray-300 text-sm";
  let opacityClass = "";

  if (priority === 1) {
    cardBorder = "border-orange-700/40";
    cardBg = "bg-orange-950/20";
  } else if (priority === 999) {
    cardBorder = "border-gray-900/80";
    opacityClass = "opacity-30";
    textClass = "text-gray-600 text-xs line-through decoration-gray-700";
    cardBg = "bg-black/40";
  } else if (priority === 3) {
    cardBorder = "border-gray-800/40";
    opacityClass = "opacity-60";
    textClass = "text-gray-500 text-xs";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.03 }}
      layout
      className={`p-3.5 rounded-xl border ${cardBorder} ${cardBg} ${opacityClass} mb-2.5 hover:border-gray-600/50 transition-all duration-200`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <div>
            <span className="font-semibold text-gray-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
               {title}
               {!senderDisplay && msg.isContactOverride && <span className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded text-[10px]">⭐ VIP</span>}
            </span>
            {senderDisplay && (
              <p className="text-gray-500 text-[10px] flex items-center gap-1">
                {senderDisplay}
                {msg.isContactOverride && <span className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded">⭐ VIP</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${badge.className}`}>
            {badge.text}
          </span>
          <span className="text-[10px] text-gray-600 font-mono">{displayTime}</span>
        </div>
      </div>
      <p className={`${textClass} mt-1.5 leading-relaxed`}>{msg.text}</p>
    </motion.div>
  );
});

export default NotificationItem;
