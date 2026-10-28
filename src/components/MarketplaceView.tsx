import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { MarketplaceItem } from '../types/nysc';
import { NIGERIAN_STATES } from '../data/mockSeed';
import {
  ShoppingBag,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Tag,
  Search,
  Filter,
  Check,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  X,
  Eye,
  Camera,
  PackageCheck
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { profile, marketplaceItems, addMarketplaceItem, toggleSoldMarketplaceItem, fireConfetti } = useNysc();

  const [selectedState, setSelectedState] = useState<string>(profile.state_of_deployment || 'Lagos');
  const [selectedLga, setSelectedLga] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Form states for posting
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<MarketplaceItem['item_condition']>('Fairly Used');
  const [category, setCategory] = useState<MarketplaceItem['category']>('Mattresses & Bedding');
  const [state, setState] = useState(profile.state_of_deployment || 'Lagos');
  const [lga, setLga] = useState(profile.lga || 'Ikeja');
  const [sellerPhone, setSellerPhone] = useState(profile.phone || '+234 814 592 0184');
  const [imageUrl, setImageUrl] = useState('');

  const categories: MarketplaceItem['category'][] = [
    'Mattresses & Bedding',
    'Electronics & Appliances',
    'Camp Whites & Uniforms',
    'Kitchen & Cooking',
    'Books & Stationery',
    'Other'
  ];

  // Derive available LGAs from existing items
  const availableLgas = Array.from(
    new Set(
      marketplaceItems
        .filter((item) => selectedState === 'All' || item.state.toLowerCase() === selectedState.toLowerCase())
        .map((item) => item.lga)
        .filter(Boolean)
    )
  );

  const handlePostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || Number(price) <= 0) return;

    addMarketplaceItem({
      seller_name: profile.full_name,
      title: title.trim(),
      description: desc.trim(),
      price: Number(price),
      item_condition: condition,
      category,
      state,
      lga,
      seller_phone: sellerPhone.trim(),
      images: imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
      is_sold: false
    });

    setTitle('');
    setDesc('');
    setPrice('');
    setImageUrl('');
    setIsPosting(false);
    fireConfetti();
  };

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesState = selectedState === 'All' || item.state.toLowerCase() === selectedState.toLowerCase();
    const matchesLga = selectedLga === 'All' || item.lga.toLowerCase() === selectedLga.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lga.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesLga && matchesCategory && matchesSearch;
  });

  const generateWhatsAppUrl = (item: MarketplaceItem) => {
    const cleanPhone = item.seller_phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${item.seller_name}, I'm interested in your '${item.title}' (₦${item.price.toLocaleString()}) on My NYSC Companion Marketplace (${item.lga} LGA). Can we arrange an inspection at the Corper Lodge?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <span>In-Person Corper Marketplace</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              Pay on Delivery (POD)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Buy & sell student mattresses, rechargeable fans, small generators, jungle boots, and camp kitchen gear with fellow corps members serving in your LGA.
          </p>
        </div>

        <button
          onClick={() => setIsPosting(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all hover:scale-102 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Used Gear</span>
        </button>
      </div>

      {/* Mandatory Safety Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/50 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-lg">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <ShieldAlert className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-extrabold text-amber-300 text-xs sm:text-sm">
            Safety Warning Banner
          </div>
          <div className="text-amber-100 font-medium">
            "My NYSC Companion is a peer-to-peer directory. Always inspect items in person at a Corper Lodge or public area before paying."
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 text-[10px] font-mono text-amber-300 font-bold border border-amber-800 shrink-0">
          Zero Advance Deposit
        </span>
      </div>

      {/* Search & LGA Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search used gear: mattress, fan, generator, jungle boots, white sneakers, kettle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* State Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLga('All');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All States</option>
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by LGA */}
          <div className="w-full md:w-48">
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-200 font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="All">All LGAs ({selectedState})</option>
              {availableLgas.map((lgaName) => (
                <option key={lgaName} value={lgaName}>
                  {lgaName} LGA
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedCategory === c
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No used items found matching your filters</p>
            <p className="text-xs text-slate-500">
              Try switching your LGA filter to "All LGAs" or be the first to list camp gear in {selectedLga !== 'All' ? selectedLga : selectedState}!
            </p>
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedLga('All');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`bg-slate-900/90 rounded-2xl border overflow-hidden shadow-xl flex flex-col justify-between transition-all cursor-pointer ${
                item.is_sold
                  ? 'opacity-60 border-slate-800'
                  : 'border-slate-800 hover:border-amber-500/50 hover:shadow-amber-950/20 group'
              }`}
            >
              {/* Image Preview & Badges */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.item_condition === 'Brand New'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900/90 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.item_condition}
                  </span>
                  {item.is_sold && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                      SOLD
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md font-mono font-black text-amber-400 text-sm border border-amber-500/40 shadow-lg">
                  ₦{item.price.toLocaleString()}
                </div>

                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/90 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1 backdrop-blur-xs">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{item.lga} LGA</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-amber-400/90 font-bold uppercase tracking-wide text-[10px]">
                      {item.category}
                    </span>
                    <span className="text-slate-500">Seller: {item.seller_name}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div
                  className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <a
                      href={generateWhatsAppUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102 active:scale-98"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp Seller</span>
                    </a>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {item.seller_name === profile.full_name && (
                    <button
                      onClick={() => toggleSoldMarketplaceItem(item.id)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-white underline shrink-0"
                    >
                      {item.is_sold ? 'Available' : 'Mark Sold'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Gallery */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedItem.images[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/90 text-xs font-bold text-amber-300 border border-amber-500/40">
                {selectedItem.item_condition}
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/95 font-mono font-black text-amber-400 text-lg border border-amber-500/40 shadow-xl">
                ₦{selectedItem.price.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="text-amber-400 font-bold uppercase text-[10px]">{selectedItem.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {selectedItem.state} State ({selectedItem.lga} LGA)
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{selectedItem.title}</h2>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wide">
                Item Description & Pickup Notes:
              </div>
              <p className="leading-relaxed whitespace-pre-line">{selectedItem.description}</p>
            </div>

            {/* Safety Reminder inside modal */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Peer-to-Peer Rule:</strong> Always inspect this item in person at a Corper Lodge or public CDS secretariat before paying cash or transfer.
              </div>
            </div>

            {/* Seller Contact Info & Direct WhatsApp Button */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Seller: <strong className="text-white">{selectedItem.seller_name}</strong></span>
                <span className="text-slate-400 font-mono">{selectedItem.seller_phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={generateWhatsAppUrl(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all hover:scale-102 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Contact Seller on WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedItem.seller_phone}`}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  title="Call Seller"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Used Gear Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Post Used Gear (Pay on Delivery)</span>
              </h3>
              <button
                onClick={() => setIsPosting(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mouka foam single student mattress + treated mosquito net"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 18000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Fairly Used">Fairly Used</option>
                    <option value="Brand New">Brand New</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    LGA (Pickup Area)
                  </label>
                  <input
                    type="text"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Contact Phone
                </label>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description & Pickup Lodge
                </label>
                <textarea
                  rows={3}
                  placeholder="State condition, reason for selling (e.g. passing out next month), and preferred Corper Lodge / Secretariat pickup location..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-950/40"
                >
                  List Item (POD Only)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
