import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquarePlus, Zap, Trash2 } from 'lucide-react';

export default function GodMode({ socket }) {
  const [msgText, setMsgText] = useState("");
  const [sender, setSender] = useState("Mom");
  const [app, setApp] = useState("WhatsApp");

  const injectMessage = (isEmergency = false) => {
    const payload = {
      id: uuidv4(),
      app: app,
      sender: ['WhatsApp', 'Outlook'].includes(app) ? sender : app,
      text: isEmergency
        ? (msgText.trim() || "Emergency alert from driver — immediate attention required")
        : msgText,
      is_emergency: isEmergency,
      timestamp: Date.now(),
      displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    console.log(`[GodMode] Injecting message:`, payload);
    socket.emit('inject_mock_message', payload);
    setMsgText("");
  };

  return (
    <div className="p-8 h-full w-full overflow-y-auto bg-[#080b14] text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/50">
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Control Pit</h1>
            <p className="text-gray-400 text-sm mt-1">Global System Override & Scenario Injection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="space-y-8">
            
            <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-red-400">Memory Management</h2>
              </div>
              <button
                onClick={() => {
                  console.log("[GodMode] Emitting clear_queue");
                  socket.emit('clear_queue');
                }}
                className="w-full bg-red-950/50 hover:bg-red-900 border border-red-800/50 py-4 rounded-xl font-bold text-red-300 transition-all active:scale-95"
              >
                PURGE RAM QUEUE
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Message Injector */}
          <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-2xl shadow-lg backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
              <MessageSquarePlus className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-200">Payload Injector</h2>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Target Application</label>
                <div className="relative">
                  <select
                    value={app}
                    onChange={(e) => setApp(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option>Emergency Services</option>
                    <option>Google Maps</option>
                    <option>Weather</option>
                    <option>WhatsApp</option>
                    <option>Outlook</option>
                    <option>YouTube</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {['WhatsApp', 'Outlook'].includes(app) && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Sender ID</label>
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="e.g. Mom, Boss, Support"
                    className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Message Content</label>
                <textarea
                  rows="4"
                  placeholder="Type mock notification content..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={() => injectMessage(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] active:scale-95"
              >
                Send Notification
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}