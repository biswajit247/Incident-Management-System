'use client';

import React from 'react';
import { Map, Thermometer, AlertCircle, Wind } from 'lucide-react';

export default function KolkataFloorMap() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Map className="h-4.5 w-4.5 text-orange-400" />
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Kolkata Office Floor Blueprint (10th Floor)</h3>
            <p className="text-[10px] text-gray-500 font-mono">Facilities Alert Location: Server Room A</p>
          </div>
        </div>
        <div className="rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 text-[9px] font-bold animate-pulse">
          HVAC ALERT ACTIVE
        </div>
      </div>

      {/* Stats Callouts */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-gray-850 bg-gray-950 p-2.5">
          <span className="block text-[8px] font-bold text-gray-500 uppercase">SERVER ROOM TEMP</span>
          <span className="block font-mono font-bold text-orange-400 text-sm mt-0.5 flex items-center justify-center space-x-0.5">
            <Thermometer className="h-3.5 w-3.5" />
            <span>34.2 °C</span>
          </span>
        </div>
        <div className="rounded-xl border border-gray-850 bg-gray-950 p-2.5">
          <span className="block text-[8px] font-bold text-gray-500 uppercase">HVAC STATUS</span>
          <span className="block font-mono font-bold text-red-500 text-sm mt-0.5 flex items-center justify-center space-x-0.5">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>AC Tripped</span>
          </span>
        </div>
        <div className="rounded-xl border border-gray-850 bg-gray-950 p-2.5">
          <span className="block text-[8px] font-bold text-gray-500 uppercase">TECHNICIAN STATUS</span>
          <span className="block font-mono font-bold text-cyan-400 text-sm mt-0.5 flex items-center justify-center space-x-0.5">
            <Wind className="h-3.5 w-3.5" />
            <span>Onsite Repair</span>
          </span>
        </div>
      </div>

      {/* SVG Map Layout */}
      <div className="relative rounded-xl border border-gray-850 bg-gray-950 p-4 h-48 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 500 180" className="w-full h-full text-gray-600">
          {/* Main Floor border */}
          <rect x="10" y="10" width="480" height="160" rx="6" fill="none" stroke="#374151" strokeWidth="2" />

          {/* Workstations Area */}
          <rect x="20" y="20" width="160" height="80" rx="4" fill="#1f2937" fillOpacity="0.2" stroke="#4b5563" strokeWidth="1" />
          <text x="100" y="65" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">Workstations Section A</text>

          {/* Conference Room */}
          <rect x="20" y="110" width="160" height="50" rx="4" fill="#1f2937" fillOpacity="0.2" stroke="#4b5563" strokeWidth="1" />
          <text x="100" y="140" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">Meeting Hub B</text>

          {/* Cafeteria */}
          <rect x="190" y="20" width="140" height="60" rx="4" fill="#1f2937" fillOpacity="0.2" stroke="#4b5563" strokeWidth="1" />
          <text x="260" y="55" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">Cafeteria Lounge</text>

          {/* Reception */}
          <rect x="190" y="90" width="140" height="70" rx="4" fill="#1f2937" fillOpacity="0.2" stroke="#4b5563" strokeWidth="1" />
          <text x="260" y="130" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">Lobby & Reception</text>

          {/* Server Room (Target Alert Zone) */}
          <rect x="340" y="20" width="140" height="140" rx="4" fill="#f97316" fillOpacity="0.1" stroke="#ea580c" strokeWidth="2" className="animate-pulse" />
          <text x="410" y="70" textAnchor="middle" fill="#f97316" fontSize="12" fontWeight="black" className="animate-pulse">⚠️ SERVER ROOM A</text>
          <text x="410" y="95" textAnchor="middle" fill="#ea580c" fontSize="10" fontWeight="bold" className="animate-pulse">TEMP SPIKE: 34.2°C</text>

          {/* Technician Location Pin */}
          <circle cx="280" cy="110" r="5" fill="#22d3ee" className="animate-bounce" />
          <text x="280" y="98" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="bold">Technician Onsite</text>
          <circle cx="280" cy="110" r="10" fill="none" stroke="#22d3ee" strokeWidth="1" className="animate-ping" style={{ transformOrigin: "280px 110px" }} />
        </svg>
      </div>

    </div>
  );
}
