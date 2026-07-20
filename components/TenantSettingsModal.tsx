'use client';

import React, { useState } from 'react';
import { X, Building2, Sliders, Save, Check, ShieldCheck, Clock } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { SLAConfig } from '@/lib/types';

interface TenantSettingsModalProps {
  onClose: () => void;
}

export default function TenantSettingsModal({ onClose }: TenantSettingsModalProps) {
  const { activeOrganization, updateOrganizationSla } = useIncidentStore();

  const [sla, setSla] = useState<SLAConfig>(activeOrganization.slaSettings);
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationSla(activeOrganization.id, sla);
    setIsSavedMsg(true);
    setTimeout(() => {
      setIsSavedMsg(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-xs"
              style={{ backgroundColor: activeOrganization.badgeColor }}
            >
              {activeOrganization.prefix}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{activeOrganization.name} Settings</h2>
              <p className="text-xs text-gray-400">Tenant Routing: {activeOrganization.subdomain}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* General Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Company Subdomain</label>
              <input
                type="text"
                disabled
                value={activeOrganization.subdomain}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 font-mono text-cyan-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Incident ID Prefix</label>
              <input
                type="text"
                disabled
                value={activeOrganization.prefix}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 font-mono font-bold text-white"
              />
            </div>
          </div>

          {/* Tenant SLA Customization Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-xs">Organization SLA Policy Customizer</h3>
            </div>

            <div className="space-y-2">
              {/* P1 SLA */}
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 grid grid-cols-3 items-center gap-2">
                <span className="font-bold text-red-400">P1 Critical</span>
                <div>
                  <label className="text-[10px] text-gray-400">TTA (Mins)</label>
                  <input
                    type="number"
                    value={sla.P1.ttaMins}
                    onChange={e => setSla({ ...sla, P1: { ...sla.P1, ttaMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">TTR (Mins)</label>
                  <input
                    type="number"
                    value={sla.P1.ttrMins}
                    onChange={e => setSla({ ...sla, P1: { ...sla.P1, ttrMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
              </div>

              {/* P2 SLA */}
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 grid grid-cols-3 items-center gap-2">
                <span className="font-bold text-orange-400">P2 High</span>
                <div>
                  <label className="text-[10px] text-gray-400">TTA (Mins)</label>
                  <input
                    type="number"
                    value={sla.P2.ttaMins}
                    onChange={e => setSla({ ...sla, P2: { ...sla.P2, ttaMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">TTR (Mins)</label>
                  <input
                    type="number"
                    value={sla.P2.ttrMins}
                    onChange={e => setSla({ ...sla, P2: { ...sla.P2, ttrMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
              </div>

              {/* P3 SLA */}
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 grid grid-cols-3 items-center gap-2">
                <span className="font-bold text-yellow-400">P3 Medium</span>
                <div>
                  <label className="text-[10px] text-gray-400">TTA (Mins)</label>
                  <input
                    type="number"
                    value={sla.P3.ttaMins}
                    onChange={e => setSla({ ...sla, P3: { ...sla.P3, ttaMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">TTR (Mins)</label>
                  <input
                    type="number"
                    value={sla.P3.ttrMins}
                    onChange={e => setSla({ ...sla, P3: { ...sla.P3, ttrMins: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-950 px-2 py-1 font-mono text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            {isSavedMsg ? (
              <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
                <Check className="h-4 w-4" />
                <span>SLA Policy Saved!</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-500">Tenant settings apply immediately to active SLAs</span>
            )}

            <button
              type="submit"
              className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-500"
            >
              <Save className="h-4 w-4" />
              <span>Save Tenant Policy</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
