import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapView from './map/MapView';

function Dashboard() {
  return <div>Dashboard</div>;
}

function ScenarioController() {
  return <div>Scenario Controller</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<ScenarioController />} />
        <Route path="/map-test" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}