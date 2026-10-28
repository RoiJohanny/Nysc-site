import React from 'react';
import { ShieldCheck, FileText, X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModals: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto text-xs text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#008751]/20 text-[#008751] flex items-center justify-center border border-[#008751]/30">
              {type === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p className="text-[11px] text-slate-400">
                My NYSC Companion • Corps Members Data Ethics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {type === 'privacy' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              <strong>1. Data Minimization & Ownership:</strong> Your personal information, state code, biometric records, and monthly clearance notes are stored locally in your device and secured through Supabase Auth.
            </p>
            <p>
              <strong>2. Client-Side Vault Encryption:</strong> Documents uploaded to your Document Locker (Call-Up Letter, Green Card, PPA Letter) remain encrypted and are never shared with unauthorized third parties.
            </p>
            <p>
              <strong>3. Directory Privacy:</strong> You maintain full control over whether your profile and phone number appear in the Corps Member Community Directory. You can hide your contact info at any time from Settings.
            </p>
            <p>
              <strong>4. Offline Availability:</strong> All budget computations and logs function in complete offline mode, respecting the erratic network environments common in rural PPAs.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              <strong>1. Compliance with NYSC Bye-Laws:</strong> My NYSC Companion is designed to assist serving corps members. Users agree to uphold the dignity and bye-laws of the National Youth Service Corps scheme.
            </p>
            <p>
              <strong>2. Pay On Delivery (POD) Marketplace Conduct:</strong> Marketplace listings are strictly in-person pay-on-delivery. Users must never send or demand advance wire transfers for camp gear.
            </p>
            <p>
              <strong>3. Respectful Communication:</strong> Any harassment, hate speech, or falsification of biometric clearance records within the community directory is strictly prohibited.
            </p>
            <p>
              <strong>4. Emergency SOS Disclaimer:</strong> SOS hotlines link directly to verified official NYSC headquarters desks and local emergency services. In critical emergencies, also reach out to local law enforcement immediately.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs shadow-md transition-all"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
