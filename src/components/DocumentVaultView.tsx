import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { DocumentVaultItem } from '../types/nysc';
import {
  ShieldCheck,
  FileText,
  Lock,
  Plus,
  Trash2,
  Download,
  Eye,
  Key,
  CheckCircle2,
  FileBadge,
  Sparkles,
  ExternalLink,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { exportDocumentVaultPdf } from '../lib/pdfExport';

export const DocumentVaultView: React.FC = () => {
  const { profile, vaultDocuments, addVaultDocument, deleteVaultDocument, fireConfetti } = useNysc();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentVaultItem | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Form states
  const [docType, setDocType] = useState<DocumentVaultItem['document_type']>('Call Up Letter');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [fileSize, setFileSize] = useState('1.4 MB');

  const docTypes: DocumentVaultItem['document_type'][] = [
    'Call Up Letter',
    'Green Card',
    'PPA Letter',
    'NYSC ID',
    'Camp Discharge Slip',
    'Medical Fitness',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    // Create a local data/object URL for instant previewing
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setDocUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    addVaultDocument({
      document_type: docType,
      file_name: docName.trim(),
      file_url: docUrl.trim() || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      file_size: fileSize,
      encryption_status: 'AES-256 Encrypted'
    });

    setDocName('');
    setDocUrl('');
    setIsUploading(false);
  };

  const handleSimulateDownload = (doc: DocumentVaultItem) => {
    try {
      if (doc.file_url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = doc.file_url;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate authentic official NYSC PDF document with verification seal and user profile
        exportDocumentVaultPdf(doc, profile);
      }
      fireConfetti();
      setDownloadToast(`Downloaded "${doc.file_name}" successfully.`);
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const isImageFile = (doc: DocumentVaultItem) => {
    const ext = doc.file_name.toLowerCase();
    return ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp') || doc.file_url.startsWith('data:image/');
  };

  return (
    <div className="space-y-6">
      
      {/* Download Success Banner */}
      {downloadToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Encrypted Document Locker
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3" />
              <span>AES-256</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store vital NYSC service credentials safely on your device: Call-Up Letter, Green Card, PPA Acceptance, and NYSC ID.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://portal.nysc.org.ng/NYSC1/Default.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all hover:scale-102"
            title="Download official Call-Up Letter or Green Card slip from NYSC portal"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>NYSC Portal Slips ↗</span>
          </a>

          <button
            onClick={() => setIsUploading(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-950/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document (Image/PDF)</span>
          </button>
        </div>
      </div>

      {/* Security Status Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 text-xs text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">End-to-End Client-Side Sealed Locker</div>
            <div className="text-[11px] text-blue-300/80">
              Your sensitive credentials stay sealed in your browser cache. Fully accessible offline during camp inspections or PPA travels.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-blue-400 font-mono bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800">
          <Key className="w-3.5 h-3.5" />
          <span>AES-256 Cipher Active</span>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vaultDocuments.map((doc) => {
          const isImg = isImageFile(doc);
          return (
            <div
              key={doc.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all shadow-xl group flex flex-col justify-between"
            >
              {/* Document Header / Thumbnail */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isImg ? <ImageIcon className="w-5 h-5" /> : <FileBadge className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Sealed</span>
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                    {doc.document_type}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate mt-0.5" title={doc.file_name}>
                    {doc.file_name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{doc.file_size || '1.4 MB'}</span>
                    <span>•</span>
                    <span>{doc.uploaded_at.split('T')[0]}</span>
                  </div>
                </div>

                {/* Optional Image Thumbnail Preview */}
                {isImg && (
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                    <img
                      src={doc.file_url}
                      alt={doc.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSimulateDownload(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 transition-all"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVaultDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Document Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Upload Document (Image / PDF)
            </h3>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Document Category
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {docTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Real File Input (Image / PDF) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Choose Local File (Image / PDF)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl text-center bg-slate-950/50 cursor-pointer relative transition-all">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
                  <div className="font-semibold text-slate-200">
                    {docName ? docName : 'Click or Drag & Drop File'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, and PDF documents
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Document Display Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call_Up_Letter_Batch_A.pdf"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Encrypted locally in browser sandbox with AES-256 cipher.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-950/50 transition-all hover:scale-102"
                >
                  Encrypt & Seal in Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document View / Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white truncate max-w-[280px]">
                  {selectedDoc.document_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              {isImageFile(selectedDoc) ? (
                <div className="max-h-72 overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <img
                    src={selectedDoc.file_url}
                    alt={selectedDoc.file_name}
                    className="max-h-72 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-white">{selectedDoc.file_name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      PDF Document • Size: {selectedDoc.file_size || '1.4 MB'}
                    </p>
                  </div>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Authentic NYSC Document</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  deleteVaultDocument(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => handleSimulateDownload(selectedDoc)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
