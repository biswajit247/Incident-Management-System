'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  CheckSquare, 
  Square, 
  Zap, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  PenTool, 
  CheckCircle2 
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { IncidentOccurrenceRecord, Severity } from '@/lib/types';

const HAZARD_OPTIONS = [
  'Thermal comfort / AC ventilation',
  'Electrical hazard',
  'Hot surface burns',
  'High pressure fluids',
  'Strike against',
  'Human factor',
  'Violence / Security',
  'Slip, Fall, Trip',
  'Confined space entry',
];

const INCIDENT_TYPE_OPTIONS = [
  'Technical Incident',
  'Equipment damage',
  'Security system failure',
  'Property damage',
  'Fire',
  'Flood',
  'Criminal Act',
  'Regulatory Breach',
  'Motor Vehicle Incident',
];

const SYSTEM_FAILURE_OPTIONS = [
  'Maintenance',
  'Equip/Mech Failure',
  'Training',
  'Equipment design',
  'Communication',
  'Inadequate PPE',
  'Fatigue',
  'Lack of Information',
  'Weather',
  'Third Party',
  'Failure to follow procedure',
];

const BODY_PARTS = ['Head', 'Neck', 'Eye', 'Chest', 'Fingers', 'Arm', 'Leg', 'Internal', 'None / No Injury'];
const ACTION_OPTIONS = ["First aid", "Doctor's Care", "Hospitalization", "No injury / Near miss", "Others (Technician / Maintenance)"];

export default function IncidentStepperForm() {
  const router = useRouter();
  const { createIncident } = useIncidentStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1 State
  const [incidentNumber] = useState(`PRO - 0${Math.floor(10 + Math.random() * 90)} / KOL`);
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().slice(0, 16));
  const [site, setSite] = useState('kolkata');
  const [securityLead, setSecurityLead] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [severityLevel, setSeverityLevel] = useState<'Level 1 (Low)' | 'Level 2 (Medium)' | 'Level 3 (High)'>('Level 1 (Low)');
  const [description, setDescription] = useState('');

  // Step 2 State
  const [bodyPartsInjured, setBodyPartsInjured] = useState<string[]>(['None / No Injury']);
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [natureOfInjury, setNatureOfInjury] = useState<string[]>([]);

  // Step 3 State
  const [hazardTypes, setHazardTypes] = useState<string[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<string[]>([]);
  const [systemFailures, setSystemFailures] = useState<string[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState('');

  // Step 4 State
  const [shiftIcSignature, setShiftIcSignature] = useState('');
  const [fmLeadSignature, setFmLeadSignature] = useState('');

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const isNoInjurySelected = bodyPartsInjured.includes('None / No Injury') || actionsTaken.includes('No injury / Near miss');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine equivalent Sentinel severity
    let mappedSev: Severity = 'P2';
    if (severityLevel === 'Level 3 (High)') mappedSev = 'P1';
    if (severityLevel === 'Level 1 (Low)') mappedSev = 'P3';

    // Auto-create incident in Sentinel Store
    createIncident({
      title: `${site.toUpperCase()} IOF: ${exactLocation}`,
      description: `${description} [Reported by ${securityLead}]`,
      severity: mappedSev,
      service: 'Platform & DB',
      source: 'user',
      tags: ['iof-compliance', site, 'facilities'],
    });

    setIsSubmitted(true);
    setTimeout(() => {
      router.push('/incidents');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-12 text-center shadow-2xl backdrop-blur-md">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400 animate-bounce" />
        <h2 className="mt-4 text-2xl font-bold text-white">Incident Occurrence Form Submitted!</h2>
        <p className="mt-2 text-sm text-emerald-300">
          Document {incidentNumber} logged under Compliance Standard CS-IOF-PRO/Dec 25.
        </p>
        <p className="mt-1 text-xs text-gray-400">Redirecting to Incident Control Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Incident Occurrence Form (IOF) Wizard</h1>
            <p className="text-xs text-gray-400">Protiviti India Member Private Limited • Standard CS-IOF-PRO/Dec 25</p>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-6 grid grid-cols-4 gap-2 border-t border-gray-800 pt-4 text-xs font-semibold">
          {[
            { step: 1, label: '1. Basic Info & Severity' },
            { step: 2, label: '2. Injury & Actions' },
            { step: 3, label: '3. Classification & RCA' },
            { step: 4, label: '4. Digital Sign-off' },
          ].map(s => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`cursor-pointer rounded-xl p-2.5 text-center transition-all ${
                currentStep === s.step
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : currentStep > s.step
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800'
                  : 'bg-gray-950 text-gray-500 border border-gray-800'
              }`}
            >
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: BASIC INFO & SEVERITY */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-2">
            Step 1: Incident Metadata & Severity Triage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Incident Number</label>
              <input
                type="text"
                disabled
                value={incidentNumber}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono font-bold text-cyan-400"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={reportedDate}
                onChange={e => setReportedDate(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-gray-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Site Location</label>
              <select
                value={site}
                onChange={e => setSite(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="kolkata">Kolkata</option>
                <option value="mumbai">Mumbai</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="gurugram">Gurugram</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Security / FM Lead Name</label>
              <input
                type="text"
                value={securityLead}
                onChange={e => setSecurityLead(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Contact Mobile</label>
              <input
                type="text"
                value={contactMobile}
                onChange={e => setContactMobile(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-gray-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-gray-400 mb-1">Exact Location of Incident</label>
            <input
              type="text"
              value={exactLocation}
              onChange={e => setExactLocation(e.target.value)}
              placeholder="e.g. Kolkata (10th Floor) Server Room AC failure"
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-bold text-gray-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Dynamic Severity Selector */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">Severity / Risk Level Triage</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { level: 'Level 1 (Low)', title: 'Level 1: Low Impact', desc: 'Minor injury / 1st aid, near miss with no trauma' },
                { level: 'Level 2 (Medium)', title: 'Level 2: Medium Impact', desc: 'Medical assistance sought, workplace disturbance' },
                { level: 'Level 3 (High)', title: 'Level 3: High Impact', desc: 'Hospitalization, fire, theft, major asset damage' },
              ].map(s => (
                <button
                  key={s.level}
                  type="button"
                  onClick={() => setSeverityLevel(s.level as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    severityLevel === s.level
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                      : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="block font-bold">{s.title}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-gray-400 mb-1">Describe Incident (What impacted, activity & equipment involved)</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-gray-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500"
            >
              <span>Next: Injury & Actions</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INJURY & IMMEDIATE ACTIONS */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-2">
            Step 2: Injury Assessment & Immediate Actions
          </h3>

          {/* Body Parts Injured Chips */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">Body Part Injured (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(part => {
                const isSelected = bodyPartsInjured.includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => toggleArrayItem(bodyPartsInjured, setBodyPartsInjured, part)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Taken Checkboxes */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">Action Taken</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ACTION_OPTIONS.map(act => {
                const isSelected = actionsTaken.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleArrayItem(actionsTaken, setActionsTaken, act)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-gray-800 bg-gray-950 text-gray-400'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-gray-500" />}
                    <span>{act}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Info Banner */}
          {isNoInjurySelected && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>No Injury / Near Miss detected. Skipping medical injury details.</span>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 rounded-xl border border-gray-800 px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500"
            >
              <span>Next: Classification & RCA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CLASSIFICATION & RCA MATRIX */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-2">
            Step 3: Categorization, Hazards & Root Cause Matrix
          </h3>

          {/* Hazard Types */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">Hazard Type (Select applicable)</label>
            <div className="flex flex-wrap gap-2">
              {HAZARD_OPTIONS.map(haz => {
                const isSelected = hazardTypes.includes(haz);
                return (
                  <button
                    key={haz}
                    type="button"
                    onClick={() => toggleArrayItem(hazardTypes, setHazardTypes, haz)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {haz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type of Incident */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">Type of Incident</label>
            <div className="flex flex-wrap gap-2">
              {INCIDENT_TYPE_OPTIONS.map(type => {
                const isSelected = incidentTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleArrayItem(incidentTypes, setIncidentTypes, type)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Failures */}
          <div className="text-xs space-y-2">
            <label className="block text-gray-400 font-semibold">System Failures Contributing to Cause</label>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_FAILURE_OPTIONS.map(fail => {
                const isSelected = systemFailures.includes(fail);
                return (
                  <button
                    key={fail}
                    type="button"
                    onClick={() => toggleArrayItem(systemFailures, setSystemFailures, fail)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-500/20 text-red-300 font-bold'
                        : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {fail}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-gray-400 mb-1">What Practical Corrective Action Will Be Taken?</label>
            <textarea
              rows={3}
              value={correctiveActions}
              onChange={e => setCorrectiveActions(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-gray-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 rounded-xl border border-gray-800 px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500"
            >
              <span>Next: Sign-off & Audit</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DIGITAL SIGN-OFF & AUDIT TRAIL */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-gray-800 pb-2">
            Step 4: Digital Signatures & Compliance Control
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Security Shift IC / FE Signature</label>
              <div className="relative">
                <PenTool className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={shiftIcSignature}
                  onChange={e => setShiftIcSignature(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 pl-9 pr-3 py-2 font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Site Security / FM Lead Signature</label>
              <div className="relative">
                <PenTool className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={fmLeadSignature}
                  onChange={e => setFmLeadSignature(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 pl-9 pr-3 py-2 font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 text-xs space-y-1 font-mono text-gray-400">
            <div className="flex justify-between text-gray-300 font-bold">
              <span>Policy Document Version:</span>
              <span className="text-cyan-400">CS-IOF-PRO/Dec 25</span>
            </div>
            <p>Reviewed By: Rahul Lal • Approved By: Rahul Lal</p>
            <p className="text-[10px] text-gray-500">Document control logged to central audit vault upon submission.</p>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 rounded-xl border border-gray-800 px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-600/20"
            >
              <Check className="h-4 w-4" />
              <span>Complete & Submit IOF Record</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
