import React, { useState, useContext } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { MessageCircle, MapPin, CloudRain, ShieldAlert, ChevronDown, GripVertical, Mail, MonitorPlay } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { socket } from "../socket";
import { PreferencesContext } from "../context/PreferencesContext";

const APPS = [
  { id: "emergency services", name: "Emergency Services", Icon: ShieldAlert, color: "text-red-500" },
  { id: "google maps", name: "Google Maps", Icon: MapPin, color: "text-blue-500" },
  { id: "weather", name: "Weather", Icon: CloudRain, color: "text-cyan-500" },
  { id: "whatsapp", name: "WhatsApp", Icon: MessageCircle, color: "text-green-500" },
  { id: "outlook", name: "Outlook", Icon: Mail, color: "text-blue-400" },
  { id: "youtube", name: "YouTube", Icon: MonitorPlay, color: "text-red-600" }
];

export default function PreferencesPage() {
  const {
    preferences,
    updatePreference,
    contactPriorities,
    setContactPriorities,
    addContact,
    savePreferences
  } = useContext(PreferencesContext);

  const [expandedApp, setExpandedApp] = useState("whatsapp");

  const [newContact, setNewContact] = useState("");

  const handleUpdate = (appId, field, value) => {
    updatePreference(appId, field, value);
  };

  const handleAddContact = () => {
    if (['whatsapp', 'outlook'].includes(expandedApp)) {
      addContact(expandedApp, newContact);
      setNewContact("");
    }
  };

  const formatTime = (hour) => `${String(hour).padStart(2, '0')}:00`;

  const handleSave = () => {
    savePreferences();
    // Optional: add a tiny visual feedback
    const btn = document.getElementById("save-btn");
    if(btn) {
      btn.innerText = "Saved!";
      setTimeout(() => btn.innerText = "Save Configuration", 2000);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#080b14] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">System Preferences</h1>
            <p className="text-gray-400 mt-2">Manage notification routing, allowed hours, and contact overrides.</p>
          </div>
          <button 
            id="save-btn"
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2"
          >
            Save Configuration
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: App Global Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-3">Global App Rules</h2>
            
            <div className="space-y-4">
              {APPS.map((app) => {
                const isExpanded = expandedApp === app.id;
                const prefs = preferences[app.id];

                return (
                  <div key={app.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300">
                    <div 
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/50"
                      onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-gray-800 border border-gray-700 shadow-sm`}>
                          <app.Icon className={`w-6 h-6 ${app.color}`} />
                        </div>
                        <span className="font-semibold text-lg">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          prefs.priority === 1 ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                          prefs.priority === 2 ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : 
                          'bg-gray-800 text-gray-500 border border-gray-700'
                        }`}>
                          Priority {prefs.priority}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 border-t border-gray-800 bg-black/20 space-y-8"
                      >
                        <div>
                          <label className="block text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Base Priority Level</label>
                          <select 
                            value={prefs.priority} 
                            disabled={!['whatsapp', 'outlook'].includes(app.id)}
                            onChange={(e) => handleUpdate(app.id, 'priority', parseInt(e.target.value, 10))}
                            className={`w-full bg-gray-900 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none ${!['whatsapp', 'outlook'].includes(app.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value={1}>Priority 1: High (Immediate / Interrupt)</option>
                            <option value={2}>Priority 2: Medium (Standard Queue)</option>
                            <option value={3}>Priority 3: Low (Silent / Batch)</option>
                          </select>
                        </div>

                        {['whatsapp', 'outlook'].includes(app.id) && (
                        <div>
                          <div className="flex justify-between items-center mb-5">
                            <label className="block text-sm text-gray-400 font-medium uppercase tracking-wider">Active Time Window</label>
                            <span className="text-xs font-mono font-bold bg-blue-900/20 text-blue-400 px-3 py-1 rounded-lg border border-blue-800/50">
                              {formatTime(prefs.timeRange[0])} - {formatTime(prefs.timeRange[1])}
                            </span>
                          </div>
                          <div className="px-3">
                            <Slider
                              range
                              disabled={false}
                              min={0}
                              max={24}
                              value={prefs.timeRange}
                              onChange={(val) => handleUpdate(app.id, 'timeRange', val)}
                              trackStyle={[{ backgroundColor: '#3b82f6', height: 8 }]}
                              handleStyle={[
                                { borderColor: '#60a5fa', height: 20, width: 20, backgroundColor: '#1e3a8a', marginTop: -6, boxShadow: '0 0 10px rgba(59,130,246,0.5)' },
                                { borderColor: '#60a5fa', height: 20, width: 20, backgroundColor: '#1e3a8a', marginTop: -6, boxShadow: '0 0 10px rgba(59,130,246,0.5)' }
                              ]}
                              railStyle={{ backgroundColor: '#1f2937', height: 8 }}
                            />
                          </div>
                        </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Priority Routing */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-3">Message Priority Order</h2>
            {['whatsapp', 'outlook'].includes(expandedApp) ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  {expandedApp === 'whatsapp' ? <MessageCircle className="w-6 h-6 text-green-500" /> : <Mail className="w-6 h-6 text-blue-400" />}
                  <h3 className="text-lg font-medium text-white capitalize">{expandedApp} Contact Priority</h3>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  Drag and drop contacts to set their priority hierarchy. High priority contacts will bypass the global app rules and trigger immediate notifications.
                </p>

                <Reorder.Group axis="y" values={contactPriorities[expandedApp] || []} onReorder={(newOrder) => setContactPriorities(expandedApp, newOrder)} className="space-y-3">
                  {(contactPriorities[expandedApp] || []).map((contact, index) => (
                    <Reorder.Item 
                      key={contact.id} 
                      value={contact}
                      className="flex items-center gap-4 bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-600 transition-colors"
                    >
                      <GripVertical className="text-gray-500 w-5 h-5 flex-none" />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-semibold text-white">{contact.name}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          index === 0 ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                          index === 1 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
                          'bg-gray-900 text-gray-500 border border-gray-700'
                        }`}>
                          Rank {index + 1}
                        </span>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div className="mt-6 flex gap-2">
                  <input 
                    type="text" 
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                    placeholder="Add new contact..." 
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={handleAddContact}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl border border-gray-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
               <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center text-gray-500">
                Contact overrides are only available for WhatsApp and Outlook. Please select one to configure VIP contacts.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
