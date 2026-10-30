import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { JobListing } from '../types/nysc';
import {
  Briefcase,
  Building,
  MapPin,
  ExternalLink,
  Phone,
  MessageCircle,
  Plus,
  Coins,
  CheckCircle2,
  Search,
  Filter,
  X,
  Sparkles,
  Bookmark,
  Share2
} from 'lucide-react';

export const JobsAndPpaView: React.FC = () => {
  const { profile, jobListings, addJobListing, fireConfetti } = useNysc();

  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Form states for posting a job
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('Lagos (On-site)');
  const [jobType, setJobType] = useState<JobListing['job_type']>('PPA');
  const [salaryRange, setSalaryRange] = useState('₦50,000/mo + PPA Accommodation');
  const [desc, setDesc] = useState('');
  const [applyType, setApplyType] = useState<JobListing['apply_type']>('external_link');
  const [externalSource, setExternalSource] = useState<JobListing['external_source']>('linkedin');
  const [externalUrl, setExternalUrl] = useState('');
  const [contactPhone, setContactPhone] = useState(profile.phone || '+234 ');

  const jobTypes: JobListing['job_type'][] = ['PPA', 'Full-time', 'Remote', 'Internship'];

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !companyName.trim()) return;

    addJobListing({
      poster_name: profile.full_name,
      job_title: jobTitle.trim(),
      company_name: companyName.trim(),
      location: location.trim(),
      job_type: jobType,
      salary_range: salaryRange.trim(),
      description: desc.trim(),
      apply_type: applyType,
      external_source: externalSource,
      external_apply_url: externalUrl.trim() || 'https://www.linkedin.com/jobs/',
      contact_phone: contactPhone.trim(),
      is_active: true
    });

    setJobTitle('');
    setCompanyName('');
    setDesc('');
    setExternalUrl('');
    setIsPosting(false);
    fireConfetti();
  };

  const filteredJobs = jobListings.filter((job) => {
    const matchesType = selectedType === 'All' || job.job_type === selectedType;
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner with "+ Post a Job" Button */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#008751]" />
              <span>Crowdsourced Job Board</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 font-mono uppercase">
              NYSC-Friendly
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Verified PPA openings with free lodge accommodation, remote internships, and post-service graduate trainee roles with direct external apply links (LinkedIn & Jobberman).
          </p>
        </div>

        <button
          onClick={() => setIsPosting(true)}
          className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#008751]/25 transition-all hover:scale-102 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post a Job</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title, company name, skills (Python, Finance, Lab), or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
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

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedType('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === 'All'
                ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            All Roles
          </button>
          {jobTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === type
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {type === 'PPA' ? 'PPA Openings' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No job openings found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or post a verified opportunity for fellow corpers.
            </p>
            <button
              onClick={() => setIsPosting(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-bold hover:bg-[#006f43]"
            >
              + Post a Job
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isLinkedIn =
              job.external_source === 'linkedin' ||
              (job.external_apply_url && job.external_apply_url.includes('linkedin'));
            const isJobberman =
              job.external_source === 'jobberman' ||
              (job.external_apply_url && job.external_apply_url.includes('jobberman'));

            return (
              <div
                key={job.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-[#008751]/50 p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide font-mono ${
                        job.job_type === 'PPA'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : job.job_type === 'Full-time'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {job.job_type}
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {job.created_at ? job.created_at.split('T')[0] : 'October 2026'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {job.job_title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                      <span className="text-white font-semibold">{job.company_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  {job.salary_range && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Compensation:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {job.salary_range}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* External Apply Buttons (LinkedIn, Jobberman, WhatsApp) */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {/* LinkedIn Apply Button */}
                    {isLinkedIn && job.external_apply_url && (
                      <a
                        href={job.external_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#0A66C2]/20 transition-all hover:scale-102"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span>Apply on LinkedIn</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    {/* Jobberman Apply Button */}
                    {isJobberman && job.external_apply_url && (
                      <a
                        href={job.external_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#2C80EB] hover:bg-[#1a64c4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#2C80EB]/20 transition-all hover:scale-102"
                      >
                        <span className="font-extrabold tracking-tight">Jobberman</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    {/* Generic External Link */}
                    {!isLinkedIn && !isJobberman && job.external_apply_url && (
                      <a
                        href={job.external_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all hover:scale-102"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#008751]" />
                        <span>Apply on Company Site</span>
                      </a>
                    )}

                    {/* Direct WhatsApp apply option */}
                    {job.apply_type === 'whatsapp' && job.contact_phone && (
                      <a
                        href={`https://wa.me/${job.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello, I'm an NYSC Corps Member applying for the '${job.job_title}' position at ${job.company_name} found on My NYSC Companion.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp Recruiter</span>
                      </a>
                    )}

                    {/* Direct Phone Call */}
                    {job.contact_phone && (
                      <a
                        href={`tel:${job.contact_phone}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        title={`Call ${job.contact_phone}`}
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* "+ Post a Job" Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#008751]" />
                <span>Post NYSC Opportunity / Job Opening</span>
              </h3>
              <button
                onClick={() => setIsPosting(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Job Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graduate Trainee / Assistant STEM Instructor"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EduTech Academy / Zenith Bank"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Lagos (On-site / Hybrid)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Role Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    <option value="PPA">PPA Slot (Serving Corpers)</option>
                    <option value="Full-time">Full-time (Graduate Trainee)</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Salary / Stipend & Benefits
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₦60,000/mo + Free Corper Lodge"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    External Apply Platform
                  </label>
                  <select
                    value={externalSource}
                    onChange={(e) => setExternalSource(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="jobberman">Jobberman</option>
                    <option value="company">Company Website</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    External Application URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Job Description & Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail daily duties, required degrees/skills, and accommodation perks..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
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
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
