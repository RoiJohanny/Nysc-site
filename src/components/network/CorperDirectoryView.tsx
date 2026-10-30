import React, { useState } from 'react';
import { useNysc } from '../../context/NyscContext';
import { CORPS_MEMBERS_DIRECTORY } from '../../data/mockSeed';
import { CorperDirectoryMember } from '../../types/nysc';
import {
  Users,
  Search,
  MapPin,
  Building2,
  Calendar,
  MessageCircle,
  Phone,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  GraduationCap,
  X
} from 'lucide-react';

export const CorperDirectoryView: React.FC = () => {
  const { profile } = useNysc();

  const [filterMode, setFilterMode] = useState<'state' | 'ppa' | 'cds' | 'all'>('state');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<CorperDirectoryMember | null>(null);

  // Normalize string for fuzzy match
  const cleanStr = (s?: string) => (s || '').toLowerCase().trim();

  const userState = cleanStr(profile.state_of_deployment || 'Lagos');
  const userPpa = cleanStr(profile.ppa_name || 'Government Senior Model College');
  const userCds = cleanStr(profile.cds_group || 'Education & Literacy CDS');

  const filteredMembers = CORPS_MEMBERS_DIRECTORY.filter((member) => {
    // 1. Filter Toggle matching
    if (filterMode === 'state') {
      if (cleanStr(member.state) !== userState) return false;
    } else if (filterMode === 'ppa') {
      const memberPpa = cleanStr(member.ppa);
      const isPpaMatch =
        memberPpa.includes('model college') ||
        memberPpa.includes(userPpa) ||
        userPpa.includes(memberPpa) ||
        (memberPpa.includes('govt') && userPpa.includes('govt'));
      if (!isPpaMatch) return false;
    } else if (filterMode === 'cds') {
      if (cleanStr(member.cds) !== userCds) return false;
    }

    // 2. Search bar matching (Name or Skill set or State Code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = member.full_name.toLowerCase().includes(q);
      const matchesCode = member.state_code.toLowerCase().includes(q);
      const matchesSkills = member.skills?.some((skill) =>
        skill.toLowerCase().includes(q)
      );
      const matchesPpa = member.ppa.toLowerCase().includes(q);
      const matchesCds = member.cds.toLowerCase().includes(q);
      return matchesName || matchesCode || matchesSkills || matchesPpa || matchesCds;
    }

    return true;
  });

  const generateWhatsAppUrl = (member: CorperDirectoryMember) => {
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const firstSkill = member.skills?.[0] || 'service projects';
    const text = encodeURIComponent(
      `Hello ${member.full_name}, I saw your profile on the My NYSC Companion Corper Directory (${member.state} State, ${member.batch}). I'd love to connect regarding ${firstSkill} and service welfare!`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-[#008751]" />
                <span>Corper Community Directory</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 font-mono">
                Verified Corps Members
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Connect with fellow corps members serving in your deployed state, PPA institution, or CDS group. Reach out directly via WhatsApp for peer collaborations and lodging help.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-mono">
              Showing <strong className="text-white">{filteredMembers.length}</strong> corpers
            </span>
          </div>
        </div>

        {/* Filter Toggle & Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          
          {/* Filter Toggles: In My State, In My PPA, In My CDS, All */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterMode('state')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'state'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>In My State ({profile.state_of_deployment || 'Lagos'})</span>
            </button>

            <button
              onClick={() => setFilterMode('ppa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'ppa'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>In My PPA (Govt Model College)</span>
            </button>

            <button
              onClick={() => setFilterMode('cds')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'cds'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>In My CDS ({profile.cds_group || 'Education'})</span>
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Nigeria</span>
            </button>
          </div>

          {/* Search bar by Name or Skill Set */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill set (e.g. Python, UI/UX, Mathematics, First Aid), PPA, or state code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Corper Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No corps members match your search</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or switch your filter toggle to "All Nigeria" or "In My State".
          </p>
          <button
            onClick={() => {
              setFilterMode('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
          >
            Clear Filters & Show All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isUser = member.full_name === profile.full_name;

            return (
              <div
                key={member.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-4 sm:p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Header: Avatar, Name, State Code */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={member.avatar}
                      alt={member.full_name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-[#008751] transition-colors shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-white truncate" title={member.full_name}>
                          {member.full_name}
                        </h3>
                        {isUser && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 uppercase shrink-0">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="text-[#008751] font-bold">{member.state_code}</span>
                        <span>•</span>
                        <span>{member.state}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {member.lga} LGA • {member.batch}
                      </div>
                    </div>
                  </div>

                  {/* PPA & CDS Badges */}
                  <div className="space-y-1.5 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate" title={member.ppa}>
                        {member.ppa}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate" title={member.cds}>
                        {member.cds}
                      </span>
                    </div>
                  </div>

                  {/* Skill Set Chips */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Skill Set & Expertise:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.map((skill, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(skill)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-colors"
                            title={`Filter by skill: ${skill}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      "{member.bio}"
                    </p>
                  )}
                </div>

                {/* Direct Action Buttons: WhatsApp & Phone Call */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <a
                    href={generateWhatsAppUrl(member)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102 active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Chat</span>
                  </a>

                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title={`Call ${member.phone}`}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>

                  <button
                    onClick={() => setSelectedMember(member)}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#008751]"
              />
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {selectedMember.full_name}
                </h3>
                <div className="text-xs font-mono text-[#008751] font-bold">
                  {selectedMember.state_code}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedMember.state} State ({selectedMember.lga} LGA)
                </div>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">PPA Place:</span>
                  <span className="text-white font-medium">{selectedMember.ppa}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">CDS Group:</span>
                  <span className="text-white font-medium">{selectedMember.cds}</span>
                </div>
              </div>

              {selectedMember.institution && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Graduated Alma Mater:</span>
                    <span className="text-white font-medium">{selectedMember.institution}</span>
                  </div>
                </div>
              )}
            </div>

            {selectedMember.bio && (
              <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase">About:</span>
                "{selectedMember.bio}"
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Verified Skill Set:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 text-xs font-semibold border border-emerald-800/40"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={generateWhatsAppUrl(selectedMember)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp ({selectedMember.phone})</span>
              </a>

              <a
                href={`tel:${selectedMember.phone}`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Call"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
