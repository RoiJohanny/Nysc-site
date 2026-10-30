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
  Shield,
  Camera,
  Upload,
  Link as LinkIcon,
  Check
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

  // Avatar state (with or without URL)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80');
  const [avatarSourceMode, setAvatarSourceMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [avatarFileName, setAvatarFileName] = useState('');
  const avatarFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const CORPER_AVATAR_PRESETS = [
    { label: 'Option 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
    { label: 'Option 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
    { label: 'Option 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' },
    { label: 'Option 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { label: 'Option 5', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80' }
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

    setAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setAvatarUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

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
      pop_date: popDate,
      avatar_url: avatarUrl
    });
    fireConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
        
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

            {/* Profile Photo (With or Without URL) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-1.5 text-xs">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Profile Photo (With or Without URL)</span>
                </label>
                <span className="text-[10px] text-slate-400">Live Header & Directory Sync</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Avatar Live Preview */}
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/30"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-lg text-white">
                    <Check className="w-3 h-3" />
                  </div>
                </div>

                {/* Mode Switcher & Inputs */}
                <div className="flex-1 w-full space-y-2">
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAvatarSourceMode('upload')}
                      className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                        avatarSourceMode === 'upload'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Device Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarSourceMode('url')}
                      className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                        avatarSourceMode === 'url'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Paste URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarSourceMode('preset')}
                      className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                        avatarSourceMode === 'preset'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>Presets</span>
                    </button>
                  </div>

                  {/* Upload without URL */}
                  {avatarSourceMode === 'upload' && (
                    <div>
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate">{avatarFileName ? avatarFileName : 'Select photo from gallery or camera (No URL required)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Paste URL */}
                  {avatarSourceMode === 'url' && (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Preset Avatars */}
                  {avatarSourceMode === 'preset' && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {CORPER_AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            avatarUrl === preset.url
                              ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                              : 'border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-9 h-9 object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
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
