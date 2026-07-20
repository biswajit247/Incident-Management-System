'use client';

import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckSquare, Square } from 'lucide-react';
import { Incident } from '@/lib/types';

interface IncidentOccurrenceFormModalProps {
  incident?: Incident;
  onClose: () => void;
}

export default function IncidentOccurrenceFormModal({ incident, onClose }: IncidentOccurrenceFormModalProps) {
  const isKolkataIncident = incident?.id === 'PRO-9043' || incident?.id === 'INC-9043' || incident?.title?.toLowerCase().includes('kolkata') || !incident;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl my-8">
        
        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Compliance Incident Occurrence Form (IOF)</h2>
              <p className="text-xs text-gray-400">Enterprise Form Document Standard • CS-IOF-PRO/Dec 25</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="mt-6 space-y-8 bg-white text-gray-900 p-8 rounded-xl shadow-inner text-xs font-sans border border-gray-300 print:m-0 print:p-0 print:border-none print:shadow-none">
          
          {/* Document Header Logo */}
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
            <div className="flex items-center space-x-3">
              <img src="/protiviti-logo.png" alt="Protiviti Logo" className="h-10 object-contain bg-slate-900 px-2 py-1 rounded" />
              <div>
                <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Protiviti India Member Private Limited</div>
                <div className="text-[9px] text-gray-500 font-mono">Global Business Consulting • Risk & Compliance</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-500 font-mono">CS-IOF-PRO/Dec 25</div>
          </div>

          {/* PAGE 1: COVER CARD */}
          <div className="rounded-lg bg-gradient-to-r from-cyan-700 via-teal-700 to-blue-900 p-8 text-white shadow-md my-4">
            <h1 className="text-2xl font-black tracking-wider uppercase mb-6">INCIDENT OCCURRENCE FORM</h1>
            <div className="space-y-1 font-mono text-xs opacity-90">
              <p><span className="inline-block w-24">Dated</span>: 29 Dec 2025</p>
              <p><span className="inline-block w-24">Version</span>: CS-IOF-PRO/Dec 25</p>
            </div>
          </div>

          {/* APPENDIX 1 - DOCUMENT CONTROL */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-900 border-b pb-1">
              APPENDIX 1 - DOCUMENT CONTROL
            </h3>
            <p className="text-[10px] text-gray-600 italic">The Policy shall be reviewed at a minimum once a year and/or as required to stay current.</p>

            <table className="w-full border-collapse border border-gray-400 text-[11px]">
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5 w-1/3">Policy Version</td>
                  <td className="border border-gray-400 p-1.5 font-bold font-mono">CS-IOF-PRO/Dec 25</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5">Policy Version Date</td>
                  <td className="border border-gray-400 p-1.5 font-mono">29 Dec 2025</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5">Policy Owner</td>
                  <td className="border border-gray-400 p-1.5">Aniruddha Kar</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5">Prepared By</td>
                  <td className="border border-gray-400 p-1.5">Aniruddha Kar</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5">Reviewed By</td>
                  <td className="border border-gray-400 p-1.5">Rahul Lal</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-cyan-900 text-white font-bold p-1.5">Approved By</td>
                  <td className="border border-gray-400 p-1.5">Rahul Lal</td>
                </tr>
              </tbody>
            </table>

            {/* Version History Table */}
            <div className="mt-4">
              <h4 className="font-bold text-gray-800 text-[11px] mb-1">Policy Version History</h4>
              <table className="w-full border-collapse border border-gray-400 text-center text-[10px]">
                <thead>
                  <tr className="bg-cyan-900 text-white">
                    <th className="border border-gray-400 p-1">Version</th>
                    <th className="border border-gray-400 p-1">Change History</th>
                    <th className="border border-gray-400 p-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1 font-mono">CS-IOF-PRO/Dec 25</td>
                    <td className="border border-gray-400 p-1">New Document</td>
                    <td className="border border-gray-400 p-1">29 Dec 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Distribution Table */}
            <div className="mt-4">
              <h4 className="font-bold text-gray-800 text-[11px] mb-1">Policy Distribution</h4>
              <table className="w-full border-collapse border border-gray-400 text-center text-[10px]">
                <thead>
                  <tr className="bg-cyan-800 text-white">
                    <th className="border border-gray-400 p-1">Version</th>
                    <th className="border border-gray-400 p-1">Audience</th>
                    <th className="border border-gray-400 p-1">Date</th>
                    <th className="border border-gray-400 p-1">Storage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-1 font-mono">CS-IOF-PRO/Dec 25</td>
                    <td className="border border-gray-400 p-1">Admin & Security Team members</td>
                    <td className="border border-gray-400 p-1">30 Dec 2025</td>
                    <td className="border border-gray-400 p-1">Central Ops Vault</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGE 4: INCIDENT DETAILS FORM */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-300">
            
            {/* Severity Triage Matrix Header */}
            <div className="grid grid-cols-3 gap-2 border border-blue-900 text-[10px] text-center">
              <div className="bg-blue-900 text-white p-2">
                <span className="font-bold block">Severity/Risk Level 1 (Low Impact)</span>
                <ul className="text-left list-disc pl-3 mt-1 space-y-0.5 text-[9px]">
                  <li>Minor injury or medical case – 1st Aid</li>
                  <li>Proactive Hazard Identification</li>
                  <li>Near miss with no Injury/Trauma</li>
                </ul>
              </div>

              <div className="bg-blue-800 text-white p-2">
                <span className="font-bold block">Severity/Risk Level 2 (Medium Impact)</span>
                <ul className="text-left list-disc pl-3 mt-1 space-y-0.5 text-[9px]">
                  <li>Injury/medical case of any kind – external medical assistance sought</li>
                  <li>Workplace Violence</li>
                  <li>Interaction with Govt authorities</li>
                </ul>
              </div>

              <div className="bg-blue-950 text-white p-2">
                <span className="font-bold block">Severity/Risk Level 3 (High Impact)</span>
                <ul className="text-left list-disc pl-3 mt-1 space-y-0.5 text-[9px]">
                  <li>Injury requiring hospitalization, loss of consciousness/death</li>
                  <li>Notifiable incident – Fire, theft, explosion, major asset damage</li>
                </ul>
              </div>
            </div>

            {/* Incident Specific Record Table */}
            <table className="w-full border-collapse border border-gray-400 text-[10px]">
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5 w-1/4">Date</td>
                  <td className="border border-gray-400 p-1.5 font-bold font-mono">30-12-2025</td>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5 w-1/4">Time</td>
                  <td className="border border-gray-400 p-1.5 font-mono">00:40 hrs</td>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5 w-1/4">Incident Number</td>
                  <td className="border border-gray-400 p-1.5 font-bold font-mono">PRO - 01 / KOL</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">Site</td>
                  <td className="border border-gray-400 p-1.5 font-bold">kolkata</td>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">Security/FM Lead</td>
                  <td className="border border-gray-400 p-1.5">Arijit Naskar</td>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">Mobile</td>
                  <td className="border border-gray-400 p-1.5 font-mono text-[9px]">87775 48171, 89811 44755 (WA)</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">Exact location of the Incident</td>
                  <td colSpan={5} className="border border-gray-400 p-1.5 font-bold text-blue-900">
                    Kolkata (10th Floor) Server Room AC not working
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">Describe Incident (What impacted, activity and equipment involved)</td>
                  <td colSpan={5} className="border border-gray-400 p-1.5 leading-relaxed bg-yellow-50 font-medium">
                    The AC of the server room (10th Floor) got tripped cause of which the temperature of the room increased. The technician was called & the issue with the AC resolved. The same is now being kept under observation by the team.
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 font-bold p-1.5">ACTION TAKEN</td>
                  <td colSpan={5} className="border border-gray-400 p-1.5 font-bold text-emerald-800">
                    <span className="bg-yellow-200 px-1 py-0.5 rounded">Others:</span> The Technician was called on 30th December and the issue has been resolved.
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

          {/* PAGE 5: HAZARD & CAUSE ANALYSIS */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-900">HAZARD CLASSIFICATION & INCIDENT CAUSE</h3>
            
            {/* Hazard Type Matrix */}
            <div className="border border-gray-400 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>Hot surface burns</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>Electrical hazard</span>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-200 p-1 rounded font-bold">
                  <CheckSquare className="h-3 w-3 text-yellow-900" />
                  <span>Thermal comfort / AC ventilation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>High pressure fluids</span>
                </div>
              </div>
            </div>

            {/* Type of Incident Matrix */}
            <div className="border border-gray-400 p-3 rounded">
              <span className="font-bold text-[10px] block mb-1">What Type of Incident is this?</span>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>Flood</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>Equipment damage</span>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-200 p-1 rounded font-bold">
                  <CheckSquare className="h-3 w-3 text-yellow-900" />
                  <span>Technical Incident</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="h-3 w-3 text-gray-400" />
                  <span>Security system failure</span>
                </div>
              </div>
            </div>

            {/* Site Visit */}
            <div className="flex items-center space-x-4 border border-gray-400 p-2 bg-gray-100 text-[10px]">
              <span className="font-bold">Did you personally visit the incident site?</span>
              <span className="bg-yellow-300 font-bold px-2 py-0.5 border border-yellow-500">YES</span>
              <span className="text-gray-400">NO</span>
            </div>
          </div>

          {/* PAGE 6: CORRECTIVE ACTIONS & SIGNATURES */}
          <div className="space-y-4 pt-6 border-t-2 border-gray-300">
            
            {/* System Failures Table */}
            <div>
              <span className="font-bold text-[10px] text-gray-800">SYSTEM FAILURES WHICH CONTRIBUTED TO INCIDENT CAUSE:</span>
              <table className="w-full border-collapse border border-gray-400 text-[10px] mt-1">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 bg-yellow-200 font-bold p-1">Maintenance</td>
                    <td className="border border-gray-400 p-1">Equip/Mech Failure</td>
                    <td className="border border-gray-400 p-1">Weather</td>
                    <td className="border border-gray-400 p-1">Failure to follow procedure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Corrective Action Section */}
            <div className="border border-gray-400 p-3 bg-gray-50 rounded">
              <span className="font-bold text-[10px] text-gray-800 block">WHAT PRACTICAL CORRECTIVE ACTION WILL BE TAKEN TO PREVENT RECURRENCE?</span>
              <p className="mt-1 text-[11px] font-bold text-cyan-900">Maintenance check completed on AC compressor unit and system kept under continuous thermal monitoring.</p>
            </div>

            {/* Signatures Row */}
            <div className="pt-4 border-t border-gray-400 flex items-center justify-between text-[10px] font-bold">
              <div>
                <span>SECURITY SHIFT IC/FE SIGNATURE:</span>
                <p className="font-mono text-cyan-900 mt-1">Shuvam Boral, Puja Dutta</p>
              </div>
              <div className="text-right">
                <span>DATE: 30/12/2025</span>
                <p className="text-gray-500 text-[9px] font-mono mt-1">SITE SECURITY / FM LEAD APPROVED</p>
              </div>
            </div>

            {/* Confidentiality Footer */}
            <div className="text-[8px] text-gray-500 text-center border-t pt-2">
              THIS DOCUMENT CONTAINS CONFIDENTIAL MATERIAL PROPRIETARY TO PROTIVITI MEMBER FIRM FOR INDIA REGION.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
