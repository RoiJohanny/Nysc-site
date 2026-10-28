import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { CORPS_MEMBERS_DIRECTORY, NIGERIAN_STATES } from '../data/mockSeed';
import { EmergencyContact, UserFeedback } from '../types/nysc';
import {
  ShieldAlert,
  PhoneCall,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  MapPin,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';

export const EmergencyDirectoryView: React.FC = () => {
  const {
    profile,
    updateProfile,
    emergencyContacts,
    addEmergencyContact,
    deleteEmergencyContact,
    fireConfetti
  } = useNysc();

  const [activeTab, setActiveTab] = useState<'emergency' | 'directory' | 'feedback'>('emergency');
  const [searchDirectory, setSearchDirectory] = useState('');
  const [filterState, setFilterState] = useState(profile.state_of_deployment || 'Lagos');

  // Form states for custom contact
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Form state for Feedback
  const [feedbackCategory, setFeedbackCategory] = useState<UserFeedback['category']>('general');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    addEmergencyContact({
      contact_name: contactName.trim(),
      role_title: contactRole.trim() || 'Corper Contact',
      phone_number: contactPhone.trim(),
      is_default: false,
      state: profile.state_of_deployment,
      lga: profile.lga
    });

    setContactName('');
    setContactRole('');
    setContactPhone('');
    setIsAddingContact(false);
    fireConfetti();
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    // Simulate feedback submission
    setFeedbackSuccess(true);
    setFeedbackMessage('');
    fireConfetti();
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const filteredCorpsMembers = CORPS_MEMBERS_DIRECTORY.filter(member => {
    const matchesState = filterState === 'All' || member.state === filterState;
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      member.state_code.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      member.lga.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      member.cds.toLowerCase().includes(searchDirectory.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Emergency SOS & Community Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>24/7 Rapid Response</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access certified NYSC Distress lines, Local Government Inspectors, security hotlines, and connect with fellow corps members serving in your zone.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'emergency'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS Hotlines</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Corper Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support & Report</span>
          </button>
        </div>
      </div>

      {activeTab === 'emergency' ? (
        /* Emergency SOS Hotlines View */
        <div className="space-y-6">
          
          <div className="bg-red-950/20 border border-red-800/40 p-4 rounded-xl text-xs text-red-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">In Extreme Emergency:</span> Dial the NYSC National Distress Hotline immediately at <a href="tel:08033107873" className="font-mono underline font-bold text-red-300">08033107873</a>. State your full name, State Code ({profile.state_code || 'LA/26A/4819'}), exact LGA, and current landmark.
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Emergency Desk & Inspectorate Contacts
            </h3>
            <button
              onClick={() => setIsAddingContact(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>Add Custom Contact</span>
            </button>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map(contact => (
              <div
                key={contact.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl hover:border-red-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                      {contact.role_title}
                    </span>
                    {contact.is_default && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Official
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {contact.contact_name}
                  </h4>

                  <div className="text-sm font-mono font-bold text-emerald-400 pt-1">
                    {contact.phone_number}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href={`tel:${contact.phone_number.replace(/[^0-9]/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-950/50 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial Hotline</span>
                  </a>

                  {!contact.is_default && (
                    <button
                      onClick={() => deleteEmergencyContact(contact.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : activeTab === 'directory' ? (
        /* Corper Connect / Directory View */
        <div className="space-y-6">
          
          {/* Privacy & Visibility Settings Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Your Community Directory Visibility</span>
              </h3>
              <p className="text-xs text-slate-400">
                Allow fellow corps members in your state & CDS group to discover and reach you.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateProfile({ is_directory_visible: !profile.is_directory_visible })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  profile.is_directory_visible
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {profile.is_directory_visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{profile.is_directory_visible ? 'Visible in Directory' : 'Hidden'}</span>
              </button>

              <button
                onClick={() => updateProfile({ show_phone_in_directory: !profile.show_phone_in_directory })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  profile.show_phone_in_directory
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span>Phone: {profile.show_phone_in_directory ? 'Shared' : 'Hidden'}</span>
              </button>
            </div>
          </div>

          {/* Search & State Filter */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search corper name, state code, LGA, or CDS..."
                value={searchDirectory}
                onChange={e => setSearchDirectory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All States (Nigeria)</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCorpsMembers.map(member => (
              <div
                key={member.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={member.avatar}
                    alt={member.full_name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                      {member.state_code}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate pt-1">
                      {member.full_name}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{member.state} ({member.lga})</span>
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-300 font-semibold truncate">
                    🏢 {member.ppa}
                  </div>
                  <div className="text-amber-400/90 truncate">
                    👥 {member.cds}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {member.batch}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${member.phone}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                      title="Call Corper"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                    <a
                      href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=Hello%20Corper%20${encodeURIComponent(member.full_name)},%20connected%20via%20My%20NYSC%20Companion.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition-all"
                      title="WhatsApp Corper"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Feedback & Report View */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <span>Submit In-App Feedback or Report an Issue</span>
            </h3>
            <p className="text-xs text-slate-400">
              Found a bug or need a feature in My NYSC Companion? Send feedback to the admin engineering desk.
            </p>
          </div>

          {feedbackSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you! Your feedback has been received with status [PENDING REVIEW].</span>
            </div>
          )}

          <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Feedback Category
              </label>
              <select
                value={feedbackCategory}
                onChange={e => setFeedbackCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="general">General Suggestion</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug">Bug / Technical Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Your Message / Details
              </label>
              <textarea
                rows={4}
                placeholder="Explain the suggestion or issue you experienced..."
                value={feedbackMessage}
                onChange={e => setFeedbackMessage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-950/40 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Custom Emergency Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-400" />
              Add Custom Emergency Contact
            </h3>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pastor / Lodge President / PPA Principal"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corpers Lodge Security / Clinic Nurse"
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950/50"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
