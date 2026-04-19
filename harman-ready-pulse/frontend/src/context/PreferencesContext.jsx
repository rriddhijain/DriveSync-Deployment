import React, { createContext, useState, useEffect } from 'react';
import { socket } from '../socket';

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    "emergency services": { priority: 1, timeRange: [0, 24] },
    "google maps": { priority: 1, timeRange: [0, 24] },
    "weather": { priority: 1, timeRange: [0, 24] },
    "whatsapp": { priority: 2, timeRange: [0, 24] },
    "outlook": { priority: 2, timeRange: [0, 24] },
    "youtube": { priority: 3, timeRange: [0, 24] }
  });

  const [contactPriorities, setContactPriorities] = useState({
    "whatsapp": [
      { id: "mom", name: "Mom" },
      { id: "boss", name: "Boss" },
      { id: "john", name: "John Doe" },
    ],
    "outlook": [
      { id: "ceo", name: "ceo@harman.com" },
      { id: "project-lead", name: "project-lead@harman.com" },
      { id: "it-support", name: "it-support@harman.com" },
    ]
  });

  const updatePreference = (appId, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: value }
    }));
  };

  const addContact = (appId, name) => {
    if (!name.trim() || !contactPriorities[appId]) return;
    const newId = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!contactPriorities[appId].some(c => c.id === newId)) {
      setContactPriorities(prev => ({
        ...prev,
        [appId]: [...prev[appId], { id: newId, name }]
      }));
    }
  };

  const updateContactOrder = (appId, newOrder) => {
    setContactPriorities(prev => ({
      ...prev,
      [appId]: newOrder
    }));
  };

  const formatTime = (hour) => `${String(hour).padStart(2, '0')}:00`;

  const savePreferences = () => {
    const formattedPrefs = {};
    
    Object.keys(preferences).forEach(appId => {
      const contactOverridesMap = {};
      if (['whatsapp', 'outlook'].includes(appId) && contactPriorities[appId]) {
        contactPriorities[appId].forEach((contact, index) => {
          contactOverridesMap[contact.name] = index <= 1 ? 1 : 2;
        });
      }

      formattedPrefs[appId] = {
        basePriority: preferences[appId].priority,
        timeWindow: {
          start: formatTime(preferences[appId].timeRange[0]),
          end: formatTime(preferences[appId].timeRange[1])
        },
        contactOverrides: contactOverridesMap
      };
    });

    socket.emit("update_preferences", formattedPrefs);
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      setPreferences,
      updatePreference,
      contactPriorities,
      setContactPriorities: updateContactOrder,
      addContact,
      savePreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}
