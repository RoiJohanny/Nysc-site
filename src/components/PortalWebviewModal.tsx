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
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { isAllowedNyscOrigin, sanitizeUrl } from '../lib/sanitize';

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
      url: 'https://portal.nysc.org.ng/NYSC1/Default.aspx',
      desc: 'Access your official bio-data, clearance dashboard, and deployment letters'
    },
    {
      id: 'callup',
      name: 'Print Call-Up Letter',
      url: 'https://portal.nysc.org.ng/NYSC1/CallUpLetter.aspx',
      desc: 'Download green/colored official mobilization call-up slip for orientation camp'
    },
    {
      id: 'greencard',
      name: 'Green Card Slip',
      url: 'https://portal.nysc.org.ng/NYSC1/GreenCard.aspx',
      desc: 'Verify biometric thumbprint status and national registration barcode'
    },
    {
      id: 'relocation',
      name: 'Relocation & Concessional',
      url: 'https://portal.nysc.org.ng/NYSC1/Relocation.aspx',
      desc: 'Check marital or medical ground redeployment approval status'
    },
    {
      id: 'cert',
      name: 'Certificate Verification',
      url: 'https://verify.nysc.org.ng',
      desc: 'Authenticate NYSC discharge certificates or letters of exemption'
    }
  ];

  const candidateSection = portalLinks.find(p => p.id === activePortalSection) || portalLinks[0];
  
  // AppSec Fortification: Strictly validate origin against allowed NYSC federal domains
  const isOriginSafe = isAllowedNyscOrigin(candidateSection.url);
  const validatedUrl = isOriginSafe ? sanitizeUrl(candidateSection.url) : 'https://portal.nysc.org.ng/NYSC1/Default.aspx';
  const currentSection = { ...candidateSection, url: validatedUrl };

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
                <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] font-mono bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 truncate max-w-[200px]">
                  portal.nysc.org.ng/NYSC1/Default.aspx
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
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
          
          {/* Security Alert Header for Official NYSC Portal */}
          <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate">{currentSection.name}:</span>
              <span className="text-slate-300 truncate hidden sm:inline">{currentSection.desc}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-600/40 hidden md:inline">
                Origin: *.nysc.org.ng (Verified)
              </span>
              <a
                href={currentSection.url}
                target="_blank"
                rel="noreferrer noopener"
                className="underline text-emerald-300 hover:text-white font-semibold"
              >
                Direct Link ↗
              </a>
            </div>
          </div>

          {/* Webview Simulator / Iframe with AppSec Sandbox controls */}
          <div className="flex-1 w-full h-full relative">
            {!isOriginSafe ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
                <h4 className="text-base font-bold text-white">Blocked External Origin</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Navigation to unapproved domains outside *.nysc.org.ng is blocked by AppSec policy.
                </p>
              </div>
            ) : (
              <iframe
                key={key}
                src={currentSection.url}
                title="Official NYSC Portal"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            )}

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
