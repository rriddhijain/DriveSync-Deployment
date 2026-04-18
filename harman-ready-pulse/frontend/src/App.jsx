import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

import TopNavbar from './components/Navigation/TopNavbar';
import Dashboard from './components/Dashboard/Dashboard';
import ScenarioController from './pages/GodMode';
import PreferencesPage from './pages/PreferencesPage';
import MapView from './map/MapView';

// ✅ Create ONE global socket connection
const socket = io('http://localhost:3001');

export default function App() {

  useEffect(() => {
    socket.on('connect', () => {
      console.log("✅ HMI Connected to Backend (Port 3001)");
    });

    socket.on('network_state_changed', (state) => {
      console.log("📡 Global Network Shift:", state);
    });

    // cleanup
    return () => {
      socket.off('connect');
      socket.off('network_state_changed');
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen w-full bg-[#080b14] text-white overflow-hidden font-sans">
        <TopNavbar />
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard socket={socket} />} />
            <Route path="/preferences" element={<PreferencesPage socket={socket} />} />
            <Route path="/admin" element={<ScenarioController socket={socket} />} />
            <Route path="/map-test" element={<MapView />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}