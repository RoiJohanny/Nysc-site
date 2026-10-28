import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  X,
  RefreshCw,
  Lock,
  ShieldCheck,
  ChevronRight,
  FileText,
  UserCheck,
  Plane,
  AlertCircle
} from 'lucide-react';

interface PortalWebviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalWebviewModal: React.FC<PortalWebviewModalProps> = ({ isOpen, onClose }) => {
  const [activePortalSection, setActivePortalSection] = useState<'login' | 'callup' | 'greencard' | 'relocation' | 'cert'>('login');
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const portalLinks = [
    {
      id: 'login',
      name: 'Corper Portal Login',
      url: 'https://portal.nysc.org.ng/nysc1/',
      desc: 'Access your official bio-data, clearance dashboard, and deployment letters'
    },
    {
      id: 'callup',
      name: 'Print Call-Up Letter',
      url: 'https://portal.nysc.org.ng/nysc1/CallUpLetter.aspx',
      desc: 'Download green/colored official mobilization call-up slip for orientation camp'
    },
    {
      id: 'greencard',
      name: 'Green Card Slip',
      url: 'https://portal.nysc.org.ng/nysc1/GreenCard.aspx',
      desc: 'Verify biometric thumbprint status and national registration barcode'
    },
    {
      id: 'relocation',
      name: 'Relocation & Concessional',
      url: 'https://portal.nysc.org.ng/nysc1/Relocation.aspx',
      desc: 'Check marital or medical ground redeployment approval status'
    },
    {
      id: 'cert',
      name: 'Certificate Verification',
      url: 'https://verify.nysc.org.ng',
      desc: 'Authenticate NYSC discharge certificates or letters of exemption'
    }
  ];

  const currentSection = portalLinks.find(p => p.id === activePortalSection) || portalLinks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#008751]/20 text-[#008751] border border-[#008751]/40 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Official NYSC Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
                  portal.nysc.org.ng
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct secure connection to National Youth Service Corps headquarters servers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentSection.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open full browser window"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#008751]" />
              <span className="hidden sm:inline">Open in Browser</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portal URL Navigation Bar */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-2 shrink-0">
            <Lock className="w-3 h-3 text-[#008751]" />
            <span className="font-mono text-emerald-400">https://</span>
          </div>

          {portalLinks.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActivePortalSection(tab.id as any);
                setKey(prev => prev + 1);
              }}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                activePortalSection === tab.id
                  ? 'bg-[#008751] text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Webview Content / Frame */}
        <div className="flex-1 relative bg-slate-950 flex flex-col">
          
          {/* Security Alert Header for Nigeria Portal */}
          <div className="bg-amber-950/30 border-b border-amber-800/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{currentSection.desc}</span>
            </div>
            <a
              href={currentSection.url}
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-200 hover:text-white font-semibold shrink-0 ml-2"
            >
              Direct Link ↗
            </a>
          </div>

          {/* Webview Simulator / Iframe */}
          <div className="flex-1 w-full h-full relative">
            <iframe
              key={key}
              src={currentSection.url}
              title="Official NYSC Portal"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />

            {/* Floating Fallback Overlay in case iframe embedding is blocked by X-Frame-Options */}
            <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl max-w-xs text-xs backdrop-blur-md">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>NYSC Portal Notice</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                If the official federal portal restricts in-app framing, launch the official direct portal window below.
              </p>
              <a
                href={currentSection.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-3 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-center block transition-all shadow-md"
              >
                Launch Portal in Full Window
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
