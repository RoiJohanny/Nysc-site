import React, { useState, useEffect } from 'react';
import { useNysc } from '../../context/NyscContext';
import {
  INITIAL_CORPER_LODGES,
  INITIAL_TRANSIT_ROUTES,
  RELOCATION_STEPS_GUIDE
} from '../../data/mockSeed';
import { CorperLodge, TransitFareRoute, RelocationStep } from '../../types/nysc';
import {
  Home,
  Navigation,
  Bus,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Zap,
  Droplet,
  BookOpen,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Plus,
  X,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface HousingRelocationTransitViewProps {
  initialTab?: 'lodges' | 'relocation' | 'transit';
  onOpenPortal?: () => void;
}

export const HousingRelocationTransitView: React.FC<HousingRelocationTransitViewProps> = ({
  initialTab = 'lodges',
  onOpenPortal
}) => {
  const { profile, fireConfetti } = useNysc();

  const [activeTab, setActiveTab] = useState<'lodges' | 'relocation' | 'transit'>(initialTab);

  // Lodges state
  const [selectedLodgeType, setSelectedLodgeType] = useState<string>('All');
  const [lodgeSearch, setLodgeSearch] = useState('');
  const [selectedLodge, setSelectedLodge] = useState<CorperLodge | null>(null);

  // Relocation tracker state
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nysc_relocation_progress');
      return saved ? JSON.parse(saved) : ['reloc-01'];
    } catch {
      return ['reloc-01'];
    }
  });

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const exists = prev.includes(stepId);
      const updated = exists ? prev.filter((id) => id !== stepId) : [...prev, stepId];
      localStorage.setItem('nysc_relocation_progress', JSON.stringify(updated));
      if (!exists) fireConfetti();
      return updated;
    });
  };

  // Transit state
  const [transitRoutes, setTransitRoutes] = useState<TransitFareRoute[]>(() => {
    try {
      const saved = localStorage.getItem('nysc_transit_routes');
      return saved ? JSON.parse(saved) : INITIAL_TRANSIT_ROUTES;
    } catch {
      return INITIAL_TRANSIT_ROUTES;
    }
  });
  const [transitSearch, setTransitSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [isSuggestingRoute, setIsSuggestingRoute] = useState(false);

  // Form states for new route
  const [newRouteName, setNewRouteName] = useState('');
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newVehicle, setNewVehicle] = useState<TransitFareRoute['vehicle_type']>('Keke Marwa');
  const [newFare, setNewFare] = useState('');
  const [newTips, setNewTips] = useState('');

  const handleSuggestRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim() || !newFare.trim()) return;

    const newRouteItem: TransitFareRoute = {
      id: `route-${Date.now()}`,
      state: profile.state_of_deployment || 'Lagos',
      lga: profile.lga || 'Ikeja',
      route_name: newRouteName.trim(),
      from_location: newFrom.trim() || 'Bus Stop',
      to_location: newTo.trim() || 'Destination',
      vehicle_type: newVehicle,
      estimated_fare_range: newFare.trim(),
      commute_tips: newTips.trim() || 'Verified by corps member community.',
      last_verified: 'Just now'
    };

    const updated = [newRouteItem, ...transitRoutes];
    setTransitRoutes(updated);
    localStorage.setItem('nysc_transit_routes', JSON.stringify(updated));

    setNewRouteName('');
    setNewFrom('');
    setNewTo('');
    setNewFare('');
    setNewTips('');
    setIsSuggestingRoute(false);
    fireConfetti();
  };

  const filteredLodges = INITIAL_CORPER_LODGES.filter((lodge) => {
    const matchesType = selectedLodgeType === 'All' || lodge.lodge_type === selectedLodgeType;
    const matchesSearch =
      lodge.name.toLowerCase().includes(lodgeSearch.toLowerCase()) ||
      lodge.address.toLowerCase().includes(lodgeSearch.toLowerCase()) ||
      lodge.lga.toLowerCase().includes(lodgeSearch.toLowerCase()) ||
      lodge.amenities.some((a) => a.toLowerCase().includes(lodgeSearch.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const filteredTransitRoutes = transitRoutes.filter((r) => {
    const matchesVehicle = vehicleFilter === 'All' || r.vehicle_type === vehicleFilter;
    const matchesSearch =
      r.route_name.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.from_location.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.to_location.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.commute_tips.toLowerCase().includes(transitSearch.toLowerCase());
    return matchesVehicle && matchesSearch;
  });

  const relocationPercent = Math.round((completedSteps.length / RELOCATION_STEPS_GUIDE.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Controls */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>🏡 Housing, Relocation & Local Transit Helper</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Find verified Corper Lodges with free or subsidized accommodation, track your step-by-step NYSC relocation application, and consult realistic local bus/keke fare guides.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 font-mono self-start sm:self-auto">
            {profile.state_of_deployment} • {profile.lga} LGA
          </span>
        </div>

        {/* 3 Main Helper Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('lodges')}
            className={`p-2.5 sm:p-3 rounded-2xl text-center font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              activeTab === 'lodges'
                ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Corper Lodges</span>
          </button>

          <button
            onClick={() => setActiveTab('relocation')}
            className={`p-2.5 sm:p-3 rounded-2xl text-center font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              activeTab === 'relocation'
                ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Relocation Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('transit')}
            className={`p-2.5 sm:p-3 rounded-2xl text-center font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              activeTab === 'transit'
                ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Transit & Bus Fares</span>
          </button>
        </div>
      </div>

      {/* 1. CORPER LODGES DIRECTORY */}
      {activeTab === 'lodges' && (
        <div className="space-y-5">
          
          {/* Lodge Search & Filter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search lodges: NCCF, MCAN, LGA quarters, solar inverter, borehole water..."
                value={lodgeSearch}
                onChange={(e) => setLodgeSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={selectedLodgeType}
                onChange={(e) => setSelectedLodgeType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#008751]"
              >
                <option value="All">All Lodge Affiliations</option>
                <option value="NCCF Family House">NCCF Family House</option>
                <option value="MCAN Corpers Lodge">MCAN Lodge</option>
                <option value="LGA Quarters">LGA Corper Quarters</option>
                <option value="NACC Catholic Lodge">Catholic Corpers Lodge</option>
                <option value="Community Lodge">Community Lodge</option>
              </select>
            </div>
          </div>

          {/* Lodges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLodges.map((lodge) => (
              <div
                key={lodge.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
                      {lodge.lodge_type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                      {lodge.available_spaces} Spaces Left
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {lodge.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{lodge.address}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Accommodation Terms & Cost:
                    </div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {lodge.cost_description}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Lodge Facilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lodge.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700/60"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {lodge.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-800/30 p-2.5 rounded-xl border border-slate-800">
                      "{lodge.notes}"
                    </p>
                  )}
                </div>

                {/* Actions: Caretaker WhatsApp & Phone */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${lodge.caretaker_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${lodge.caretaker_name}, I am a serving NYSC Corps Member in ${lodge.state} (${lodge.lga} LGA). I would like to inquire about available accommodation at ${lodge.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Caretaker</span>
                  </a>

                  <a
                    href={`tel:${lodge.caretaker_phone}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title={`Call Caretaker (${lodge.caretaker_phone})`}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. STEP-BY-STEP RELOCATION TRACKER */}
      {activeTab === 'relocation' && (
        <div className="space-y-6">
          
          {/* Progress Overview Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#008751] uppercase tracking-wider block">
                  Official NYSC Relocation Tracker
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">
                  Concession & Relocation Application Milestones
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Valid grounds: Marital, Life-Threatening Medical Condition, or Security Advisory.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-white font-mono">{relocationPercent}%</span>
                <span className="text-xs text-slate-400 block">
                  {completedSteps.length} of {RELOCATION_STEPS_GUIDE.length} Steps Complete
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#008751] to-emerald-400 transition-all duration-500 shadow-lg"
                style={{ width: `${relocationPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Steps List */}
          <div className="space-y-4">
            {RELOCATION_STEPS_GUIDE.map((step) => {
              const isDone = completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={`bg-slate-900/90 rounded-2xl border p-5 transition-all shadow-xl space-y-3.5 ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.step_number}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                            Stage {step.step_number} • {step.category}
                          </span>
                          {isDone && (
                            <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isDone
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-[#008751] hover:bg-[#006f43] text-white shadow-md shadow-[#008751]/30'
                      }`}
                    >
                      {isDone ? 'Mark Incomplete' : 'Mark as Done'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {step.description}
                  </p>

                  {/* Required Documents checklist */}
                  <div className="ml-10 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Required Proofs & Documentation:</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {step.required_documents.map((doc, idx) => (
                        <li key={idx} className="leading-snug">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pro Tip Callout */}
                  <div className="ml-10 text-[11px] text-amber-300/90 bg-amber-950/20 p-2.5 rounded-xl border border-amber-800/30 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-200">Insider Corper Advice:</strong> {step.pro_tip}
                    </span>
                  </div>

                  {step.id === 'reloc-02' && (
                    <div className="ml-10 pt-1">
                      <a
                        href="https://portal.nysc.org.ng/NYSC1/Relocation.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold text-xs shadow-md shadow-[#008751]/30 transition-all hover:scale-102"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open NYSC Relocation Portal (NYSC1/Relocation.aspx) ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOCAL TRANSIT & BUS FARE GUIDE */}
      {activeTab === 'transit' && (
        <div className="space-y-5">
          
          {/* Header & Suggest Route Button */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-400" />
                <span>Local Transit & Taxi Fare Rate Guide</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Community-verified commute fares to protect corps members from inflated transport prices.
              </p>
            </div>

            <button
              onClick={() => setIsSuggestingRoute(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#008751]/25 transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Fare / Add Route</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search route (e.g. Underbridge, Secretariat, Maryland, Oshodi, Camp)..."
                value={transitSearch}
                onChange={(e) => setTransitSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="w-full sm:w-52">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#008751]"
              >
                <option value="All">All Vehicle Modes</option>
                <option value="Keke Marwa">Keke Marwa (Tricycle)</option>
                <option value="BRT Bus">BRT Bus</option>
                <option value="Danfo Yellow Bus">Danfo Yellow Bus</option>
                <option value="Shared Taxi">Shared Taxi</option>
              </select>
            </div>
          </div>

          {/* Routes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransitRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-5 space-y-3.5 shadow-xl transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
                    {route.vehicle_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Verified {route.last_verified}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {route.route_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <span>{route.from_location}</span>
                    <ArrowRight className="w-3 h-3 text-[#008751]" />
                    <span>{route.to_location}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Typical Fare Rate:</span>
                  <span className="text-sm font-black text-amber-300 font-mono">
                    {route.estimated_fare_range}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
                  <strong className="text-slate-400 block mb-0.5 text-[10px] uppercase">Commute Tip:</strong>
                  {route.commute_tips}
                </div>
              </div>
            ))}
          </div>

          {/* Modal to report fare / suggest route */}
          {isSuggestingRoute && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bus className="w-5 h-5 text-emerald-400" />
                    <span>Report Fare / Add Transit Route</span>
                  </h3>
                  <button
                    onClick={() => setIsSuggestingRoute(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSuggestRoute} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Route Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opebi Junction ⇄ Ikeja Secretariat Gate"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        From Stop
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opebi"
                        value={newFrom}
                        onChange={(e) => setNewFrom(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        To Destination
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Secretariat"
                        value={newTo}
                        onChange={(e) => setNewTo(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Transport Type
                      </label>
                      <select
                        value={newVehicle}
                        onChange={(e) => setNewVehicle(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      >
                        <option value="Keke Marwa">Keke Marwa</option>
                        <option value="Danfo Yellow Bus">Danfo Yellow Bus</option>
                        <option value="BRT Bus">BRT Bus</option>
                        <option value="Shared Taxi">Shared Taxi</option>
                        <option value="Okada / Bike">Okada / Bike</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Estimated Fare Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₦250 - ₦350"
                        value={newFare}
                        onChange={(e) => setNewFare(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Commute Tips & Peak Hour Advice
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Have ₦50 change ready; rush hour begins at 7:45 AM..."
                      value={newTips}
                      onChange={(e) => setNewTips(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSuggestingRoute(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold shadow-md shadow-[#008751]/30"
                    >
                      Save Route
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
