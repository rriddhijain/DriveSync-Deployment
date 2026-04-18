import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, LayoutDashboard, Cpu } from 'lucide-react';

export default function TopNavbar() {
  return (
    <nav className="flex-none flex items-center justify-between px-8 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-lg z-50 sticky top-0">
      {/* Left: Logo / Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <NavLink to="/" className="flex flex-col">
          <span className="text-xl font-bold tracking-widest text-white uppercase">Harman Ready-Pulse</span>
          <span className="text-xs text-blue-400 font-medium tracking-widest uppercase">System Interface</span>
        </NavLink>
      </div>

      {/* Right: Navigation Links */}
      <div className="flex items-center gap-4">
        <NavLink
          to="/preferences"
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:bg-gray-700 hover:text-white hover:border-gray-600'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Preferences</span>
        </NavLink>

        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:bg-gray-700 hover:text-white hover:border-gray-600'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
      </div>
    </nav>
  );
}
