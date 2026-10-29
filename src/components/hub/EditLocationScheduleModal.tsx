import React, { useState } from 'react';
import { useNysc } from '../../context/NyscContext';
import {
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Bus,
  X,
  Sparkles,
  LocateFixed
} from 'lucide-react';

interface EditLocationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditLocationScheduleModal: React.FC<EditLocationScheduleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { profile, locationSchedule, updateLocationSchedule, fireConfetti } = useNysc();

  const [ppaLat, setPpaLat] = useState(locationSchedule.ppa_latitude);
  const [ppaLng, setPpaLng] = useState(locationSchedule.ppa_longitude);
  const [ppaNotes, setPpaNotes] = useState(locationSchedule.ppa_address_notes || '');

  const [cdsLat, setCdsLat] = useState(locationSchedule.cds_latitude);
  const [cdsLng, setCdsLng] = useState(locationSchedule.cds_longitude);
  const [cdsAddress, setCdsAddress] = useState(locationSchedule.cds_address_notes || '');
  const [cdsDay, setCdsDay] = useState(locationSchedule.cds_meeting_day || 'Thursday');
  const [cdsTime, setCdsTime] = useState(locationSchedule.cds_meeting_time || '09:00');
  const [cdsFreq, setCdsFreq] = useState(locationSchedule.cds_frequency || 'Weekly');
  const [transitNotes, setTransitNotes] = useState(locationSchedule.transit_fare_notes || '');

  const [geoLocating, setGeoLocating] = useState(false);
  const [geoStatusMessage, setGeoStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGetCurrentLocationForPpa = () => {
    setGeoStatusMessage(null);
    if (!navigator.geolocation) {
      setGeoStatusMessage({ type: 'error', text: 'Geolocation is not supported by your current browser.' });
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPpaLat(pos.coords.latitude);
        setPpaLng(pos.coords.longitude);
        setGeoLocating(false);
        setGeoStatusMessage({ type: 'success', text: `GPS coordinates captured: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E` });
      },
      (err) => {
        console.error(err);
        setGeoLocating(false);
        setGeoStatusMessage({ type: 'error', text: 'Could not retrieve GPS position. Please check location permissions.' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleGetCurrentLocationForCds = () => {
    setGeoStatusMessage(null);
    if (!navigator.geolocation) {
      setGeoStatusMessage({ type: 'error', text: 'Geolocation is not supported by your current browser.' });
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCdsLat(pos.coords.latitude);
        setCdsLng(pos.coords.longitude);
        setGeoLocating(false);
        setGeoStatusMessage({ type: 'success', text: `CDS GPS coordinates captured: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E` });
      },
      (err) => {
        console.error(err);
        setGeoLocating(false);
        setGeoStatusMessage({ type: 'error', text: 'Could not retrieve GPS position. Please check location permissions.' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocationSchedule({
      ppa_latitude: Number(ppaLat),
      ppa_longitude: Number(ppaLng),
      ppa_address_notes: ppaNotes.trim(),
      cds_latitude: Number(cdsLat),
      cds_longitude: Number(cdsLng),
      cds_address_notes: cdsAddress.trim(),
      cds_meeting_day: cdsDay,
      cds_meeting_time: cdsTime,
      cds_frequency: cdsFreq,
      transit_fare_notes: transitNotes.trim()
    });
    fireConfetti();
    onClose();
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#008751]/20 text-[#008751] border border-[#008751]/40 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Edit Service Geolocation & Schedule
              </h2>
              <p className="text-xs text-slate-400">
                PPA Blue Pin, CDS Green Pin, meeting times, and transit fares
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
          
          {/* Section 1: PPA Location (Blue Pin) */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>🔵 1. PPA Geolocation Pin</span>
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocationForPpa}
                disabled={geoLocating}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>{geoLocating ? 'Acquiring GPS...' : 'Use Current GPS'}</span>
              </button>
            </div>

            {geoStatusMessage && (
              <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-between ${
                geoStatusMessage.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}>
                <span>{geoStatusMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setGeoStatusMessage(null)}
                  className="text-slate-400 hover:text-white ml-2 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PPA Latitude (°N)
                </label>
                <input
                  type="number"
                  step="any"
                  value={ppaLat}
                  onChange={(e) => setPpaLat(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PPA Longitude (°E)
                </label>
                <input
                  type="number"
                  step="any"
                  value={ppaLng}
                  onChange={(e) => setPpaLng(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                PPA Landmark / Navigation Guide
              </label>
              <input
                type="text"
                placeholder="e.g. Behind High Court GRA Ikeja, take Keke from Underbridge"
                value={ppaNotes}
                onChange={(e) => setPpaNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 2: CDS Location (Green Pin) & Schedule */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-[#008751]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-300 uppercase tracking-wide">
                🟢 2. CDS Secretariat Pin & Schedule
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocationForCds}
                disabled={geoLocating}
                className="px-2.5 py-1 rounded-lg bg-[#008751]/30 hover:bg-[#008751]/50 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-[#008751]/40 transition-all hover:scale-102"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Use Current GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  CDS Latitude (°N)
                </label>
                <input
                  type="number"
                  step="any"
                  value={cdsLat}
                  onChange={(e) => setCdsLat(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  CDS Longitude (°E)
                </label>
                <input
                  type="number"
                  step="any"
                  value={cdsLng}
                  onChange={(e) => setCdsLng(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                CDS Venue / Hall Description
              </label>
              <input
                type="text"
                placeholder="e.g. Ikeja Local Government Secretariat, Community Hall B"
                value={cdsAddress}
                onChange={(e) => setCdsAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Day
                </label>
                <select
                  value={cdsDay}
                  onChange={(e) => setCdsDay(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Time
                </label>
                <input
                  type="time"
                  value={cdsTime}
                  onChange={(e) => setCdsTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Frequency
                </label>
                <select
                  value={cdsFreq}
                  onChange={(e) => setCdsFreq(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transit Fare & Commute Notes
              </label>
              <input
                type="text"
                placeholder="e.g. BRT from Maryland: ₦350. Keke to Secretariat: ₦200."
                value={transitNotes}
                onChange={(e) => setTransitNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md shadow-[#008751]/30 transition-all hover:scale-102"
            >
              Save Pins & Schedule
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
