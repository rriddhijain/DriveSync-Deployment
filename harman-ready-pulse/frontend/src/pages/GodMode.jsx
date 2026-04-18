import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Play, Pause, Radio, MessageSquarePlus, Zap, Settings2, Trash2 } from 'lucide-react';

export default function GodMode({ socket }) {
  const [msgText, setMsgText] = useState("");
  const [sender, setSender] = useState("Mom");
  const [app, setApp] = useState("WhatsApp");
  const [isPlaying, setIsPlaying] = useState(true);

  const sendNetworkToggle = (state) => {
    console.log(`[GodMode] Emitting network state: ${state}`);
    socket.emit('network_state_changed', state);
  };

  const toggleSimulation = (playState) => {
    console.log(`[GodMode] Emitting simulation state: playing=${playState}`);
    setIsPlaying(playState);
    socket.emit('simulation_state', { playing: playState });
  };

  const injectMessage = (isEmergency = false) => {
    const payload = {
      id: uuidv4(),
      app: app,
      sender: sender,
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
            
            {/* Simulation Control */}
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Radio className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-200">Map Simulation</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleSimulation(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all active:scale-95 ${
                    isPlaying 
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500' 
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  <Play className="w-5 h-5" /> START
                </button>
                <button
                  onClick={() => toggleSimulation(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all active:scale-95 ${
                    !isPlaying 
                      ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] border border-amber-500' 
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                  }`}
                >
                  <Pause className="w-5 h-5" /> PAUSE
                </button>
              </div>
            </div>

            {/* Network Toggle */}
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Settings2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-200">Environment Override</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => sendNetworkToggle('5G')}
                  className="flex-1 bg-gray-800/80 hover:bg-emerald-600 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-gray-700 py-4 rounded-xl font-bold text-gray-300 transition-all active:scale-95"
                >
                  FORCE 5G
                </button>
                <button
                  onClick={() => sendNetworkToggle('DEAD_ZONE')}
                  className="flex-1 bg-gray-800/80 hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-gray-700 py-4 rounded-xl font-bold text-gray-300 transition-all active:scale-95"
                >
                  DEAD ZONE
                </button>
              </div>
            </div>

            {/* System Override */}
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
                    <option>WhatsApp</option>
                    <option>Gmail</option>
                    <option>Slack</option>
                    <option>Teams</option>
                    <option>YouTube</option>
                    <option>Instagram</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

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

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-800">
              <button
                onClick={() => injectMessage(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-white transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] active:scale-95"
              >
                TRANSMIT
              </button>

              <button
                onClick={() => injectMessage(true)}
                className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold text-white transition-all shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] active:scale-95"
              >
                TRIGGER EMERGENCY
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}