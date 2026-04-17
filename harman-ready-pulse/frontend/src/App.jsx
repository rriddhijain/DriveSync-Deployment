import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

// 1. Import your Page Components (Assuming they are in separate files)
import Dashboard from './components/Dashboard/Dashboard'; 
import ScenarioController from './components/ScenarioController/ScenarioController';

// 2. Initialize Socket Connection to your Backend (Port 3001)
const socket = io('http://localhost:3001');

export default function App() {
  
  useEffect(() => {
    // Standard Hackathon "Plumbing" Checks
    socket.on('connect', () => {
      console.log("✅ HMI Connected to Backend (Port 3001)");
    });

    socket.on('network_state_changed', (state) => {
      console.log("📡 Global Network Shift:", state);
      // This log will confirm your God-Mode buttons are working!
    });

    // Cleanup on unmount
    return () => socket.disconnect();
  }, []);

  return (
    <BrowserRouter>
      {/* 3. Global Styling Wrapper (Harman Navy Background) */}
      <div className="min-h-screen bg-[#0a0e1a] text-white">
        <Routes>
          {/* Interface A: The Digital Cockpit Dashboard */}
          <Route path="/" element={<Dashboard socket={socket} />} />
          
          {/* Interface B: Your Admin 'God-Mode' Panel */}
          <Route path="/admin" element={<ScenarioController socket={socket} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}