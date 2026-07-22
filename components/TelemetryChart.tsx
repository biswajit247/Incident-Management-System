'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Clock, RefreshCw } from 'lucide-react';

interface TelemetryChartProps {
  metrics: {
    cpu?: string;
    latencyP99?: string;
    errorRate?: string;
  };
  service: string;
}

export default function TelemetryChart({ metrics, service }: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<'latency' | 'cpu' | 'error'>('latency');
  const [livePoints, setLivePoints] = useState<number[]>([15, 20, 18, 22, 25, 45, 95, 98, 97]);
  const [counter, setCounter] = useState(0);

  // Generate data points based on metric selection
  useEffect(() => {
    if (activeMetric === 'latency') {
      // Latency spike: starts low (150ms) and peaks at 8900ms
      setLivePoints([120, 150, 180, 220, 310, 480, 2400, 6800, 8900, 8400, 8700, 8900]);
    } else if (activeMetric === 'cpu') {
      // CPU: peaks at 98%
      setLivePoints([12, 15, 22, 35, 42, 60, 88, 95, 98, 97, 98, 98]);
    } else {
      // Error rate: peaks at 4.2%
      setLivePoints([0.05, 0.08, 0.12, 0.22, 0.35, 0.98, 2.5, 3.8, 4.2, 4.0, 4.1, 4.2]);
    }
  }, [activeMetric]);

  // Simulate a live ticking telemetry feed
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePoints(prev => {
        const copy = [...prev];
        copy.shift(); // remove first
        const last = copy[copy.length - 1];
        // add random minor variation at the peak
        const variation = (Math.random() - 0.5) * (last * 0.05);
        copy.push(Math.max(1, Number((last + variation).toFixed(2))));
        return copy;
      });
      setCounter(c => c + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeMetric]);

  const maxVal = Math.max(...livePoints);
  const minVal = Math.min(...livePoints);

  // Map values to SVG coordinates (width: 500, height: 120)
  const pointsPath = livePoints
    .map((val, idx) => {
      const x = (idx / (livePoints.length - 1)) * 480 + 10;
      const range = maxVal - minVal || 1;
      const y = 110 - ((val - minVal) / range) * 90;
      return `${x},${y}`;
    })
    .join(' ');

  const getMetricLabel = () => {
    if (activeMetric === 'latency') return metrics.latencyP99 || '8,900 ms';
    if (activeMetric === 'cpu') return metrics.cpu || '98%';
    return metrics.errorRate || '4.2%';
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md space-y-4">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Live System Telemetry Feed</h3>
            <p className="text-[10px] text-gray-500 font-mono">Stream: {service.toUpperCase()} • Ticking every 4s</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center space-x-1.5 rounded-xl bg-gray-950 p-1 text-[10px] font-bold">
          <button
            onClick={() => setActiveMetric('latency')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeMetric === 'latency' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Latency
          </button>
          <button
            onClick={() => setActiveMetric('cpu')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeMetric === 'cpu' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            CPU Load
          </button>
          <button
            onClick={() => setActiveMetric('error')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeMetric === 'error' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Error Rate
          </button>
        </div>
      </div>

      {/* Metric Display Callout */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-850 bg-gray-950/60 p-3">
        <div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Current Metric Peak</span>
          <span className="block font-black text-white text-base font-mono mt-0.5">{getMetricLabel()}</span>
        </div>
        <div className="text-right flex flex-col justify-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Telemetry Status</span>
          <div className="mt-1 flex items-center justify-end space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider font-mono">ANOMALY SPIKE DETECTED</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative rounded-xl border border-gray-850 bg-gray-950 p-2 overflow-hidden h-36 flex items-center justify-center">
        <svg viewBox="0 0 500 120" className="w-full h-full">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="10" y1="20" x2="490" y2="20" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="10" y1="50" x2="490" y2="50" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="10" y1="80" x2="490" y2="80" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="10" y1="110" x2="490" y2="110" stroke="#1f2937" strokeWidth="1" />

          {/* Glowing Area Fill */}
          <path
            d={`M 10,110 L ${pointsPath} L 490,110 Z`}
            fill="url(#chartGrad)"
          />

          {/* Colored Trend Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            points={pointsPath}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight circles on data points */}
          {livePoints.map((val, idx) => {
            const x = (idx / (livePoints.length - 1)) * 480 + 10;
            const range = maxVal - minVal || 1;
            const y = 110 - ((val - minVal) / range) * 90;
            const isLast = idx === livePoints.length - 1;

            return (
              <g key={idx}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLast ? 4 : 2}
                  fill={isLast ? '#ef4444' : '#22d3ee'}
                  className={isLast ? 'animate-pulse' : ''}
                />
                {isLast && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
}
