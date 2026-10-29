import React, { useState, useRef } from 'react';
import { useNysc } from '../context/NyscContext';
import { SaedNote, SaedNoteImage } from '../types/nysc';
import {
  Award,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Download,
  Printer,
  X,
  Upload,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Bold,
  Italic,
  List,
  Eye,
  Camera
} from 'lucide-react';
import { exportSaedNotesToPdf } from '../lib/pdfExport';

export const SaedJournalView: React.FC = () => {
  const { profile, saedNotes, addSaedNote, deleteSaedNote, fireConfetti } = useNysc();

  // Category filter: exact categories (ICT, Fashion, Solar, Cosmetology, Agro, All)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Form states for new SAED note
  const [noteCategory, setNoteCategory] = useState<SaedNote['skill_category']>('Solar Installation');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [keyTakeawayInput, setKeyTakeawayInput] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string; caption: string }[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'ICT & Tech', label: 'ICT & Tech', short: 'ICT' },
    { id: 'Fashion & Tailoring', label: 'Fashion & Tailoring', short: 'Fashion' },
    { id: 'Solar Installation', label: 'Solar & Renewable Energy', short: 'Solar' },
    { id: 'Cosmetology & Hair', label: 'Cosmetology & Hair', short: 'Cosmetology' },
    { id: 'Agro-Allied', label: 'Agro-Allied & Food', short: 'Agro' }
  ];

  // Handle local multi-photo file selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setUploadedPhotos((prev) => [
            ...prev,
            {
              url: uploadEvent.target?.result as string,
              caption: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoByUrl = () => {
    if (!photoUrlInput.trim()) return;
    setUploadedPhotos((prev) => [
      ...prev,
      {
        url: photoUrlInput.trim(),
        caption: photoCaptionInput.trim() || 'SAED Practical Session'
      }
    ]);
    setPhotoUrlInput('');
    setPhotoCaptionInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTakeaway = () => {
    if (!keyTakeawayInput.trim()) return;
    setKeyTakeaways((prev) => [...prev, keyTakeawayInput.trim()]);
    setKeyTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways((prev) => prev.filter((_, i) => i !== index));
  };

  // Rich-text quick formatting helper
  const insertFormatting = (syntax: 'bold' | 'italic' | 'bullet') => {
    if (syntax === 'bold') {
      setNoteContent((prev) => prev + '**Bold Note** ');
    } else if (syntax === 'italic') {
      setNoteContent((prev) => prev + '*Key term* ');
    } else if (syntax === 'bullet') {
      setNoteContent((prev) => prev + '\n• ');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const formattedImages: SaedNoteImage[] = uploadedPhotos.map((p, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      note_id: '',
      image_url: p.url,
      caption: p.caption,
      uploaded_at: new Date().toISOString()
    }));

    addSaedNote({
      skill_category: noteCategory,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      key_takeaways: keyTakeaways,
      images: formattedImages
    });

    // Reset
    setNoteTitle('');
    setNoteContent('');
    setKeyTakeaways([]);
    setUploadedPhotos([]);
    setIsAddingNote(false);
    fireConfetti();
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // PDF Export for Compiled SAED Notes & Gallery
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      exportSaedNotesToPdf(profile, filteredNotes, selectedCategory);
      fireConfetti();
      setExportSuccessMessage(`Downloaded compiled SAED notes (${filteredNotes.length} entries) as PDF!`);
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err) {
      console.error('[PDF Export Error]', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const filteredNotes = saedNotes.filter((note) => {
    if (selectedCategory === 'All') return true;
    return note.skill_category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Export Success Notification Banner */}
      {exportSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner with PDF Export Button */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-[#008751]" />
              <span>SAED Practical Learning Journal</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 font-mono uppercase">
              Skill Acquisition
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Document in-camp & post-camp vocational masterclasses (ICT, Fashion, Solar, Cosmetology, Agro) with multi-photo attachments and compiled PDF export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all hover:scale-102"
            title="Export all compiled SAED notes and photos as PDF"
          >
            <Download className={`w-4 h-4 text-emerald-400 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Export Notes as PDF'}</span>
          </button>

          <button
            onClick={() => setIsAddingNote(true)}
            className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#008751]/25 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>New SAED Entry</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips (ICT, Fashion, Solar, Cosmetology, Agro, All) */}
      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2 print:hidden shadow-md">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 mr-1">
          Skill Track:
        </span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          All Skills ({saedNotes.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.short)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.short
                ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <span>{cat.short}</span>
          </button>
        ))}
      </div>

      {/* PRINT-ONLY OFFICIAL NYSC HEADER (When User Exports PDF via print) */}
      <div className="hidden print:block text-slate-900 p-4 border-b-2 border-emerald-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-emerald-800 uppercase tracking-wider">
              National Youth Service Corps (NYSC)
            </div>
            <div className="text-sm font-bold text-slate-700">
              Department of Skill Acquisition & Entrepreneurship Development (SAED)
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Corps Member: {profile.full_name} • State Code: {profile.state_code} • {profile.state_of_deployment} State ({profile.batch_stream})
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-500">
            Portfolio Export Date: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="space-y-5">
        {filteredNotes.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-10 text-center space-y-3 print:hidden">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No SAED Notes in this Skill Track</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Record training insights from your in-camp or post-camp lectures, attach workshop photos, and compile your vocational portfolio.
            </p>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] text-white text-xs font-bold hover:bg-[#006f43] transition-all"
            >
              Log First SAED Note
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl print:bg-white print:text-slate-900 print:border-slate-300 print:shadow-none"
            >
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 print:border-slate-300 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 print:bg-emerald-100 print:text-emerald-800 print:border-emerald-300">
                      {note.skill_category}
                    </span>
                    <span className="text-[11px] text-slate-400 print:text-slate-500 font-mono">
                      {note.created_at ? note.created_at.split('T')[0] : 'October 2026'}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white print:text-slate-900">
                    {note.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
                  <button
                    onClick={() => deleteSaedNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <div className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                {note.content}
              </div>

              {/* Key Takeaways */}
              {note.key_takeaways && note.key_takeaways.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 print:bg-slate-50 print:border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-amber-400 print:text-amber-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Actionable Takeaways & Business Angles:</span>
                  </div>
                  <ul className="text-xs text-slate-300 print:text-slate-700 space-y-1 list-disc list-inside">
                    {note.key_takeaways.map((takeaway, idx) => (
                      <li key={idx} className="leading-snug">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Multi-Photo Attachments Gallery */}
              {note.images && note.images.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Practical Workshop Photo Gallery ({note.images.length}):</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {note.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setZoomedImage(img.image_url)}
                        className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 print:border-slate-300 cursor-pointer shadow-md"
                      >
                        <img
                          src={img.image_url}
                          alt={img.caption || 'SAED photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-[10px] text-white truncate font-medium">
                            {img.caption}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 p-1 rounded-md bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed SAED workshop attachment"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain border border-slate-800 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* New SAED Learning Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#008751]/20 text-[#008751] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">New SAED Learning Journal Entry</h3>
                  <p className="text-xs text-slate-400">Record formulas, step-by-step methods & workshop photos</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingNote(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Skill Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.short})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Lesson / Workshop Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inverter Wiring & Battery Sizing Calculation"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              </div>

              {/* Rich-Text Formatting Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Detailed Notes & Step-by-Step Procedure
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px]"
                      title="Bold text"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('italic')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 italic text-[10px]"
                      title="Italic text"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('bullet')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                      title="Insert bullet point"
                    >
                      • List
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  placeholder="Record trainer explanations, tool requirements, wiring diagrams, and business margins..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              {/* Key Takeaways Builder */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-slate-300 font-semibold">
                  Actionable Business Takeaways & Rules of Thumb
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Always connect battery before solar panels to protect charge controller..."
                    value={keyTakeawayInput}
                    onChange={(e) => setKeyTakeawayInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shrink-0"
                  >
                    Add Rule
                  </button>
                </div>

                {keyTakeaways.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {keyTakeaways.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                      >
                        <span>• {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Photo Attachments */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Attach Workshop Photos ({uploadedPhotos.length})</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Local Photos</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Optional URL input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste photo URL (https://images.unsplash.com/...)"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#008751]"
                  />
                  <input
                    type="text"
                    placeholder="Photo caption"
                    value={photoCaptionInput}
                    onChange={(e) => setPhotoCaptionInput(e.target.value)}
                    className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#008751]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoByUrl}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Previews */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white shadow-md"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  Save SAED Note
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
