import React, { useState } from 'react';
import { useNysc } from '../../context/NyscContext';
import {
  RELOCATION_STEPS_GUIDE,
  INITIAL_TRANSIT_ROUTES,
  NIGERIAN_STATES,
  getLgasForState,
  getDefaultLgaForState
} from '../../data/mockSeed';
import { CorperLodge, TransitFareRoute, HousingCategory, HousingLodgeType } from '../../types/nysc';
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
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Plus,
  X,
  FileText,
  Clock,
  ArrowRight,
  Users,
  Building,
  Check,
  Trash2,
  Tag,
  Car
} from 'lucide-react';

interface HousingRelocationTransitViewProps {
  initialTab?: 'lodges' | 'relocation' | 'transit';
  onOpenPortal?: () => void;
}

const COMMON_AMENITIES = [
  'Solar Inverter (24/7 Power)',
  'Industrial Borehole Water',
  'Gated Estate & Night Guard',
  'Private Kitchenette',
  'Equipped Shared Kitchen',
  'Furnished with Bed / Mattress',
  'Personal Prepaid Meter',
  'Fibre Wi-Fi Internet',
  'Air Conditioning',
  'Direct Walk to CDS Venue',
  'Close to Transit Bus Stop'
];

const PRESET_VEHICLES = [
  'Keke Marwa',
  'Danfo Yellow Bus',
  'BRT Bus',
  'Shared Taxi',
  'Okada / Bike',
  'Coaster Shuttle',
  'Interstate Sienna',
  'Water Boat / Ferry'
];

export const HousingRelocationTransitView: React.FC<HousingRelocationTransitViewProps> = ({
  initialTab = 'lodges',
  onOpenPortal
}) => {
  const { profile, housingListings, addHousingListing, deleteHousingListing, fireConfetti } = useNysc();

  const [activeTab, setActiveTab] = useState<'lodges' | 'relocation' | 'transit'>(initialTab);

  // Housing state
  const [selectedHousingCategory, setSelectedHousingCategory] = useState<string>('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');
  const [housingSearch, setHousingSearch] = useState('');
  const [selectedLodge, setSelectedLodge] = useState<CorperLodge | null>(null);

  // Modal to add housing / roommate listing
  const [isAddingHousing, setIsAddingHousing] = useState(false);
  const [newHousingTitle, setNewHousingTitle] = useState('');
  const [newHousingCategory, setNewHousingCategory] = useState<HousingCategory>('Private Rental');
  const [newHousingType, setNewHousingType] = useState<HousingLodgeType>('Private Self-Con');
  const [customHousingType, setCustomHousingType] = useState('');
  const [newHousingState, setNewHousingState] = useState(profile.state_of_deployment || 'Lagos');
  const [newHousingLga, setNewHousingLga] = useState(profile.lga || 'Ikeja');
  const [newHousingAddress, setNewHousingAddress] = useState('');
  const [newHousingCost, setNewHousingCost] = useState('');
  const [newHousingSpaces, setNewHousingSpaces] = useState<number>(1);
  const [newHousingGender, setNewHousingGender] = useState<'Any' | 'Male Only' | 'Female Only'>('Any');
  const [newHousingSelectedAmenities, setNewHousingSelectedAmenities] = useState<string[]>([
    'Industrial Borehole Water',
    'Gated Estate & Night Guard'
  ]);
  const [newHousingCustomAmenity, setNewHousingCustomAmenity] = useState('');
  const [newHousingContactName, setNewHousingContactName] = useState(profile.full_name || '');
  const [newHousingContactPhone, setNewHousingContactPhone] = useState(profile.phone || '');
  const [newHousingNotes, setNewHousingNotes] = useState('');

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
  const [selectedVehiclePreset, setSelectedVehiclePreset] = useState<string>('Keke Marwa');
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [newFare, setNewFare] = useState('');
  const [newTips, setNewTips] = useState('');

  // Toggle amenity checkbox
  const toggleAmenity = (amenity: string) => {
    setNewHousingSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    if (newHousingCustomAmenity.trim() && !newHousingSelectedAmenities.includes(newHousingCustomAmenity.trim())) {
      setNewHousingSelectedAmenities(prev => [...prev, newHousingCustomAmenity.trim()]);
      setNewHousingCustomAmenity('');
    }
  };

  const handleCreateHousingListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHousingTitle.trim() || !newHousingCost.trim() || !newHousingContactPhone.trim()) return;

    const finalType = newHousingType === 'Other' && customHousingType.trim() ? customHousingType.trim() : newHousingType;

    addHousingListing({
      name: newHousingTitle.trim(),
      lodge_type: finalType,
      category: newHousingCategory,
      state: newHousingState,
      lga: newHousingLga,
      address: newHousingAddress.trim() || `${newHousingLga}, ${newHousingState}`,
      cost_description: newHousingCost.trim(),
      amenities: newHousingSelectedAmenities.length > 0 ? newHousingSelectedAmenities : ['Borehole Water'],
      caretaker_name: newHousingContactName.trim() || profile.full_name,
      caretaker_phone: newHousingContactPhone.trim(),
      available_spaces: Number(newHousingSpaces) || 1,
      notes: newHousingNotes.trim() || 'Listed by community corps member.',
      gender_preference: newHousingGender,
      is_user_listing: true,
      posted_by: `${profile.full_name} (${profile.state_code || profile.state_of_deployment})`
    });

    setIsAddingHousing(false);
    fireConfetti();

    // Reset Form
    setNewHousingTitle('');
    setNewHousingCost('');
    setNewHousingAddress('');
    setNewHousingNotes('');
  };

  const handleSuggestRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim() || !newFare.trim()) return;

    // Use custom vehicle type if chosen
    const finalVehicle =
      selectedVehiclePreset === 'CUSTOM' && customVehicleType.trim()
        ? customVehicleType.trim()
        : selectedVehiclePreset;

    const newRouteItem: TransitFareRoute = {
      id: `route-${Date.now()}`,
      state: profile.state_of_deployment || 'Lagos',
      lga: profile.lga || 'Ikeja',
      route_name: newRouteName.trim(),
      from_location: newFrom.trim() || 'Bus Stop',
      to_location: newTo.trim() || 'Destination',
      vehicle_type: finalVehicle,
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
    setSelectedVehiclePreset('Keke Marwa');
    setCustomVehicleType('');
    setNewFare('');
    setNewTips('');
    setIsSuggestingRoute(false);
    fireConfetti();
  };

  // Filter Housing
  const filteredLodges = housingListings.filter((lodge) => {
    const matchesCategory =
      selectedHousingCategory === 'All' ||
      lodge.category === selectedHousingCategory ||
      lodge.lodge_type === selectedHousingCategory;

    const matchesState = selectedStateFilter === 'All' || lodge.state === selectedStateFilter;

    const q = housingSearch.toLowerCase();
    const matchesSearch =
      lodge.name.toLowerCase().includes(q) ||
      lodge.address.toLowerCase().includes(q) ||
      lodge.lga.toLowerCase().includes(q) ||
      lodge.lodge_type.toLowerCase().includes(q) ||
      lodge.amenities.some((a) => a.toLowerCase().includes(q));

    return matchesCategory && matchesState && matchesSearch;
  });

  // Extract all unique vehicle types for filtering
  const availableVehicles = Array.from(
    new Set(transitRoutes.map((r) => r.vehicle_type).filter(Boolean))
  );

  const filteredTransitRoutes = transitRoutes.filter((r) => {
    const matchesVehicle = vehicleFilter === 'All' || r.vehicle_type === vehicleFilter;
    const matchesSearch =
      r.route_name.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.from_location.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.to_location.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.commute_tips.toLowerCase().includes(transitSearch.toLowerCase()) ||
      r.vehicle_type.toLowerCase().includes(transitSearch.toLowerCase());
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
                <span>🏡 Housing, Roommates, Relocation & Transit Hub</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Find Corper Lodges, private self-contained apartments, search for roommates or bedspace, list available housing, track official NYSC relocation steps, and check local fares.
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
            <span>Housing & Roommates</span>
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

      {/* 1. HOUSING & ROOMMATES DIRECTORY */}
      {activeTab === 'lodges' && (
        <div className="space-y-5">
          
          {/* Header Action & Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Available Accommodation & Roommate Match</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {filteredLodges.length} listings
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Explore corper lodges, private rentals, and roommate listings. Anyone can add available housing.
              </p>
            </div>

            <button
              onClick={() => setIsAddingHousing(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-102 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Housing / Roommate</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search: Self-con, Roommate, NCCF, solar inverter, borehole, Opebi..."
                value={housingSearch}
                onChange={(e) => setHousingSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="flex w-full sm:w-auto gap-2">
              <select
                value={selectedHousingCategory}
                onChange={(e) => setSelectedHousingCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#008751]"
              >
                <option value="All">All Categories</option>
                <option value="Corper Lodge">Corper Lodges (NCCF/MCAN/LGA)</option>
                <option value="Private Rental">Private Self-Con & Flats</option>
                <option value="Roommate & Bedspace">Roommate & Bedspace</option>
                <option value="PPA Quarters">PPA Staff Quarters</option>
              </select>

              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#008751]"
              >
                <option value="All">All States</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Housing Cards Grid */}
          {filteredLodges.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <Home className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
              <p className="text-xs text-slate-400">No housing or roommate listings match your filters.</p>
              <button
                onClick={() => setIsAddingHousing(true)}
                className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Post Available Housing Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLodges.map((lodge) => (
                <div
                  key={lodge.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
                          {lodge.lodge_type}
                        </span>
                        {lodge.gender_preference && lodge.gender_preference !== 'Any' && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lodge.gender_preference === 'Female Only'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {lodge.gender_preference}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                          {lodge.available_spaces} {lodge.category === 'Roommate & Bedspace' ? 'Slot' : 'Spaces'}
                        </span>
                        {lodge.is_user_listing && (
                          <button
                            onClick={() => deleteHousingListing(lodge.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
                        {lodge.category === 'Roommate & Bedspace' ? 'Split Rent / Contribution:' : 'Accommodation Terms & Cost:'}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {lodge.cost_description}
                      </div>
                    </div>

                    {/* Amenities */}
                    {lodge.amenities && lodge.amenities.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Key Amenities & Highlights:
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
                    )}

                    {lodge.notes && (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-800/30 p-2.5 rounded-xl border border-slate-800">
                        "{lodge.notes}"
                      </p>
                    )}

                    {lodge.posted_by && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Posted by: {lodge.posted_by}
                      </div>
                    )}
                  </div>

                  {/* Actions: Caretaker WhatsApp & Phone */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${lodge.caretaker_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${lodge.caretaker_name}, I am a serving NYSC Corps Member in ${lodge.state}. I saw your housing/roommate listing "${lodge.name}" and would like to inquire about availability.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp {lodge.category === 'Roommate & Bedspace' ? 'Corper' : 'Caretaker'}</span>
                    </a>

                    <a
                      href={`tel:${lodge.caretaker_phone}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title={`Call (${lodge.caretaker_phone})`}
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal to Add Housing or Roommate */}
          {isAddingHousing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">
                      Post Available Housing or Find Roommate
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddingHousing(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateHousingListing} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Listing Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spacious Self-Con Flat near Ikeja Secretariat OR Female Roommate Wanted"
                      value={newHousingTitle}
                      onChange={(e) => setNewHousingTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Category *
                      </label>
                      <select
                        value={newHousingCategory}
                        onChange={(e) => setNewHousingCategory(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      >
                        <option value="Private Rental">Private Rental / Apartment</option>
                        <option value="Roommate & Bedspace">Roommate / Bedspace Search</option>
                        <option value="Corper Lodge">Corper Lodge (Religious/LGA)</option>
                        <option value="PPA Quarters">PPA / Staff Quarters</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Housing Sub-Type *
                      </label>
                      <select
                        value={newHousingType}
                        onChange={(e) => setNewHousingType(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      >
                        <option value="Private Self-Con">Private Self-Con</option>
                        <option value="Mini-Flat / Apartment">Mini-Flat / Apartment</option>
                        <option value="Roommate / Flatmate Needed">Roommate / Flatmate Needed</option>
                        <option value="Bedspace Offered">Bedspace Offered</option>
                        <option value="NCCF Family House">NCCF Family House</option>
                        <option value="MCAN Corpers Lodge">MCAN Corpers Lodge</option>
                        <option value="NACC Catholic Lodge">Catholic Corpers Lodge</option>
                        <option value="LGA Quarters">LGA Corpers Quarters</option>
                        <option value="PPA / Staff Quarters">PPA Staff Quarters</option>
                        <option value="Other">Other / Custom</option>
                      </select>
                    </div>
                  </div>

                  {newHousingType === 'Other' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Specify Custom Housing Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Duplex BQ, Boys Quarter, Farmhouse Lodge..."
                        value={customHousingType}
                        onChange={(e) => setCustomHousingType(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        State
                      </label>
                      <select
                        value={newHousingState}
                        onChange={(e) => {
                          const nextState = e.target.value;
                          setNewHousingState(nextState);
                          const lgas = getLgasForState(nextState);
                          if (!lgas.includes(newHousingLga)) {
                            setNewHousingLga(lgas[0] || getDefaultLgaForState(nextState));
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      >
                        {NIGERIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        LGA / Area
                      </label>
                      <select
                        value={newHousingLga}
                        onChange={(e) => setNewHousingLga(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      >
                        {getLgasForState(newHousingState).map(l => (
                          <option key={l} value={l}>{l} LGA</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Full Address & Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Oba Akinjobi Way, GRA Ikeja (Near Secretariat)"
                      value={newHousingAddress}
                      onChange={(e) => setNewHousingAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Rent / Cost *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₦120,000 / year OR ₦15,000/mo"
                        value={newHousingCost}
                        onChange={(e) => setNewHousingCost(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Spaces / Bedspaces
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newHousingSpaces}
                        onChange={(e) => setNewHousingSpaces(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Gender Preference
                      </label>
                      <select
                        value={newHousingGender}
                        onChange={(e) => setNewHousingGender(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      >
                        <option value="Any">Any Gender</option>
                        <option value="Male Only">Male Only</option>
                        <option value="Female Only">Female Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Amenities Checklist */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-semibold">
                      Amenities & Facilities (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                      {COMMON_AMENITIES.map(amenity => (
                        <label key={amenity} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={newHousingSelectedAmenities.includes(amenity)}
                            onChange={() => toggleAmenity(amenity)}
                            className="rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                          />
                          <span>{amenity}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add another custom amenity (e.g. Balcony, Water heater)..."
                        value={newHousingCustomAmenity}
                        onChange={e => setNewHousingCustomAmenity(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bro. Emmanuel or Chioma"
                        value={newHousingContactName}
                        onChange={(e) => setNewHousingContactName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08123456789"
                        value={newHousingContactPhone}
                        onChange={(e) => setNewHousingContactPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Notes / House Rules / Roommate Preferences
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Clean and quiet environment. Gate closes by 10pm. Ideal for corpers working along Allen or Secretariat."
                      value={newHousingNotes}
                      onChange={(e) => setNewHousingNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingHousing(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                    >
                      <Check className="w-4 h-4" />
                      <span>Publish Listing</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. RELOCATION TRACKER */}
      {activeTab === 'relocation' && (
        <div className="space-y-5">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Official NYSC Relocation Tracker</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {completedSteps.length} of {RELOCATION_STEPS_GUIDE.length} Steps Complete ({relocationPercent}%)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Step-by-step roadmap for marital or medical relocation from deployment state.
                </p>
              </div>

              {onOpenPortal && (
                <button
                  onClick={onOpenPortal}
                  className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 self-start sm:self-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open NYSC Portal ↗</span>
                </button>
              )}
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-[#008751] h-full rounded-full transition-all duration-500"
                style={{ width: `${relocationPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {RELOCATION_STEPS_GUIDE.map((step) => {
              const isDone = completedSteps.includes(step.id);
              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Step {step.step_number} • {step.category}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.description}
                      </p>

                      {step.pro_tip && (
                        <div className="text-[11px] text-amber-300 font-medium pt-1">
                          💡 <strong>Pro Tip:</strong> {step.pro_tip}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? 'Completed' : 'Mark Done'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TRANSIT & LOCAL BUS/KEKE FARES */}
      {activeTab === 'transit' && (
        <div className="space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Local Bus & Transit Fare Guide</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {filteredTransitRoutes.length} routes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Community-verified commute fares and tips to avoid being overcharged by local conductors.
              </p>
            </div>

            <button
              onClick={() => setIsSuggestingRoute(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all hover:scale-102 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Route & Fare</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search transit route: Secretariat, Oshodi, Ikeja along, BRT, Keke..."
                value={transitSearch}
                onChange={(e) => setTransitSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#008751]"
              >
                <option value="All">All Vehicle Types ({availableVehicles.length})</option>
                {availableVehicles.map(veh => (
                  <option key={veh} value={veh}>{veh}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Routes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransitRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-5 space-y-3.5 shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono flex items-center gap-1">
                      <Bus className="w-3 h-3" />
                      <span>{route.vehicle_type}</span>
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
              </div>
            ))}
          </div>

          {/* Modal to report fare / suggest route */}
          {isSuggestingRoute && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
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
                      Route Title *
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
                        From Stop *
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
                        To Destination *
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

                  {/* Vehicle Type Selection with Custom Input option */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-semibold">
                      Vehicle Type * (Select or Enter Custom Type)
                    </label>
                    <select
                      value={selectedVehiclePreset}
                      onChange={(e) => setSelectedVehiclePreset(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    >
                      {PRESET_VEHICLES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                      <option value="CUSTOM">+ Add Custom Vehicle Type...</option>
                    </select>

                    {selectedVehiclePreset === 'CUSTOM' && (
                      <div className="pt-1">
                        <label className="block text-emerald-400 font-semibold mb-1 text-[11px]">
                          Enter Your Vehicle Type *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Campus Shuttle Mini-bus, Ferry Speedboat, Korope Mini-bus, Bolt Shared..."
                          value={customVehicleType}
                          onChange={(e) => setCustomVehicleType(e.target.value)}
                          className="w-full bg-slate-800 border border-emerald-500/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Estimated Fare Range *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₦250 - ₦350"
                      value={newFare}
                      onChange={(e) => setNewFare(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Commute Advice / Route Tips
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Morning rush hour fares surge by ₦100. Tricycles load faster under the flyover."
                      value={newTips}
                      onChange={(e) => setNewTips(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSuggestingRoute(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Route</span>
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
