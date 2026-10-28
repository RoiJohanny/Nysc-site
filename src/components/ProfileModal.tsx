import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { NIGERIAN_STATES, CDS_GROUPS } from '../data/mockSeed';
import { NyscPhase } from '../types/nysc';
import {
  User,
  X,
  MapPin,
  Calendar,
  Building,
  Award,
  Phone,
  RotateCcw,
  CheckCircle2,
  Shield
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, resetToDefaultData, fireConfetti } = useNysc();

  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [stateCode, setStateCode] = useState(profile.state_code || 'LA/26A/4819');
  const [callUpNo, setCallUpNo] = useState(profile.call_up_no || 'NYSC/UAM/2026/049102');
  const [stateDeployment, setStateDeployment] = useState(profile.state_of_deployment);
  const [lga, setLga] = useState(profile.lga);
  const [batchStream, setBatchStream] = useState(profile.batch_stream);
  const [phase, setPhase] = useState<NyscPhase>(profile.current_phase);
  const [ppaName, setPpaName] = useState(profile.ppa_name);
  const [ppaAddress, setPpaAddress] = useState(profile.ppa_address);
  const [cdsGroup, setCdsGroup] = useState(profile.cds_group);
  const [swearingIn, setSwearingIn] = useState(profile.swearing_in_date);
  const [popDate, setPopDate] = useState(profile.pop_date);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      state_code: stateCode.trim(),
      call_up_no: callUpNo.trim(),
      state_of_deployment: stateDeployment,
      lga: lga.trim(),
      batch_stream: batchStream.trim(),
      current_phase: phase,
      ppa_name: ppaName.trim(),
      ppa_address: ppaAddress.trim(),
      cds_group: cdsGroup,
      swearing_in_date: swearingIn,
      pop_date: popDate
    });
    fireConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Corps Member Profile & Credentials
              </h2>
              <p className="text-xs text-slate-400">
                Matches the official database schema and compliance record.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              1. Personal & Identification
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  NYSC State Code
                </label>
                <input
                  type="text"
                  value={stateCode}
                  onChange={e => setStateCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Call-Up Number
                </label>
                <input
                  type="text"
                  value={callUpNo}
                  onChange={e => setCallUpNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 uppercase"
                  required
                />
              </div>
            </div>
          </div>

          {/* Deployment & Phase */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              2. Deployment & Service Phase
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Phase
                </label>
                <select
                  value={phase}
                  onChange={e => setPhase(e.target.value as NyscPhase)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PCM">PCM (Prospective)</option>
                  <option value="CAMP">CAMP (Orientation)</option>
                  <option value="ACTIVE">ACTIVE (PPA & CDS)</option>
                  <option value="POP">POP (Passed Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  State of Deployment
                </label>
                <select
                  value={stateDeployment}
                  onChange={e => setStateDeployment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {NIGERIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Local Govt Area (LGA)
                </label>
                <input
                  type="text"
                  value={lga}
                  onChange={e => setLga(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Batch & Stream
              </label>
              <input
                type="text"
                value={batchStream}
                onChange={e => setBatchStream(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* PPA & CDS */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              3. Primary Assignment (PPA) & CDS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Place of Primary Assignment (PPA Name)
                </label>
                <input
                  type="text"
                  value={ppaName}
                  onChange={e => setPpaName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  CDS Group
                </label>
                <select
                  value={cdsGroup}
                  onChange={e => setCdsGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {CDS_GROUPS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                PPA Address
              </label>
              <input
                type="text"
                value={ppaAddress}
                onChange={e => setPpaAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Swearing-In Date
                </label>
                <input
                  type="date"
                  value={swearingIn}
                  onChange={e => setSwearingIn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Passing Out Parade (POP) Date
                </label>
                <input
                  type="date"
                  value={popDate}
                  onChange={e => setPopDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-amber-300 text-xs font-medium">Reset demo records?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefaultData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
                >
                  Yes, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-slate-400 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default Demo Data</span>
              </button>
            )}

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50"
              >
                Save Profile
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
