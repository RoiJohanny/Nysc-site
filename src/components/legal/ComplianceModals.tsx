import React from 'react';
import { X, ShieldCheck, Scale, FileText, Lock, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#008751]/20 text-[#008751] border border-[#008751]/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Privacy Policy & NDPR Compliance</h2>
              <p className="text-xs text-slate-400">Nigeria Data Protection Regulation & NYSC Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#008751]/10 border border-[#008751]/25 text-emerald-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Local-First Storage Guarantee:</strong> Your confidential credentials, biometric clearance statuses, and uploaded document vault items are stored on your device using encrypted browser storage and will never be sold to third parties.
            </span>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">1. Information We Collect</h3>
            <p>
              When registering for My NYSC Companion, we collect your Name, Phone Number, State of Deployment, Batch/Stream, Call-Up Number, and PPA/CDS assignment details. These are required exclusively to personalize your service year timeline and calculate safe daily allowances.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">2. Corper Directory & Privacy Controls</h3>
            <p>
              You maintain total autonomy over your profile visibility. You may toggle <em>"Show Profile in Corper Directory"</em> and <em>"Display Phone Number"</em> off at any time in Settings. Hidden profiles will not be indexed or visible to peer corps members.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">3. Document Locker & AES-256 Encryption</h3>
            <p>
              Official documents (Green Card, Call-Up Letter, PPA Acceptance Letter, NYSC ID) uploaded to your Document Locker are stored locally and encrypted before transmission. Admin personnel have zero access to your unencrypted files.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">4. Right to Deletion (Data Wipe)</h3>
            <p>
              Under NDPR Section 3.1, you have the absolute right to demand complete erasure of your records. Executing the <strong>"Delete My Account & Data"</strong> function in Settings immediately purges all profile records, financial entries, and documents permanently.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">5. Contact Data Protection Officer</h3>
            <p>
              For privacy inquiries or compliance questions, reach our NYSC Companion Data Protection desk via WhatsApp at +234 814 592 0184 or email privacy@nysccompanion.ng.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs shadow-md transition-all"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsOfServiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Terms of Service & Bye-Laws Notice</h2>
              <p className="text-xs text-slate-400">National Youth Service Corps Decree & Usage Conditions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Peer-to-Peer & Independence Disclaimer:</strong> My NYSC Companion is an independent digital assistant built for Nigerian corps members. It is not an official government branch of the NYSC Directorate Headquarters. Always cross-check formal directives on <a href="https://portal.nysc.org.ng/NYSC1/Default.aspx" target="_blank" rel="noopener noreferrer" className="underline text-emerald-400 hover:text-emerald-300">portal.nysc.org.ng/NYSC1/Default.aspx</a>.
            </span>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">1. Adherence to NYSC Bye-Laws</h3>
            <p>
              Users must abide by the official NYSC Bye-Laws (Revised). Nothing in this application grants permission to miss CDS meetings, bypass biometric clearance windows (1st–25th of the month), or leave your deployed state without an official signed exit permit from your State Coordinator.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">2. In-Person Marketplace Safety (Pay on Delivery)</h3>
            <p>
              The In-Person Marketplace facilitates peer-to-peer equipment handovers (mattresses, white sneakers, fans, cookers). <strong>NEVER pay money in advance.</strong> Always physically inspect items at a secure Corper Lodge, Camp Mammy market, or CDS venue before cash or transfer payment.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">3. Financial Alawee Tracker</h3>
            <p>
              The monthly allowance tracker reflects the current ₦77,000 Federal Alawee guideline. Actual bank disbursement dates may vary by state treasury or clearing cycles.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm mb-1">4. Community Standards</h3>
            <p>
              Harassment, spamming fellow corpers on WhatsApp, fraud, or misrepresenting official NYSC staff credentials will result in immediate termination of access and reporting to local zonal inspectorate officers.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs shadow-md transition-all"
          >
            I Agree to Terms
          </button>
        </div>
      </div>
    </div>
  );
};
