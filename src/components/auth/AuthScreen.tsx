import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { SetNewPasswordModal } from './SetNewPasswordModal';
import { LegalModals } from './LegalModals';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, isLoading, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSetNewPassOpen, setIsSetNewPassOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'signin') {
      const res = await signIn(identifier, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name as registered with NYSC.');
        return;
      }
      const res = await signUp(identifier, password, fullName.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account.');
      }
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg('');
    await signIn('corper.adeleke@gmail.com', 'demo2026');
  };

  const handleProceedToReset = (target: string, otp?: string) => {
    setResetTarget(target);
    setResetOtp(otp || '');
    setIsSetNewPassOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#008751]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005a36] to-[#008751] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#008751]/30 border border-[#008751]/40">
            NYSC
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">
              My NYSC Companion
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium">
              National Service Digital Hub
            </p>
          </div>
        </div>

        {/* Supabase connection indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-teal-400 animate-pulse'}`} />
          <span>{isConfigured ? 'Supabase Auth' : 'Local Auth'}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-white">
              {mode === 'signin' ? 'Welcome Back, Corper!' : 'Start Your Service Journey'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Sign in to access your biometric clearance, ₦77k alawee, and vault.'
                : 'Register in 15 seconds to track allowances, clearance, and camp packing.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name (As on Green Card)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Chinedu Emmanuel Adeleke"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. corper.adeleke@gmail.com or 08145920184"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-[11px] text-amber-400 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter account password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#008751]/30 transition-all hover:scale-102 active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Dashboard' : 'Continue to Quick Setup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Bypass Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Demo Access (Chinedu Adeleke)</span>
            </button>
          </div>

          {/* Reset password direct link */}
          <div className="text-center">
            <button
              onClick={() => setIsSetNewPassOpen(true)}
              className="text-[11px] text-slate-400 hover:text-emerald-400 hover:underline"
            >
              Have a password reset OTP code? Set new password →
            </button>
          </div>

        </div>
      </div>

      {/* Footer Legal Links */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 pb-4 space-y-2">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setLegalType('privacy')}
            className="hover:text-emerald-400 transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => setLegalType('terms')}
            className="hover:text-emerald-400 transition-colors"
          >
            Terms of Service
          </button>
          <span>•</span>
          <span>NYSC Digital Ethics</span>
        </div>
        <p className="text-slate-600">
          Dedicated to the welfare of Nigerian Corps Members nationwide 🇳🇬
        </p>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onProceedToReset={handleProceedToReset}
      />

      <SetNewPasswordModal
        isOpen={isSetNewPassOpen}
        onClose={() => setIsSetNewPassOpen(false)}
        initialOtp={resetOtp}
        targetIdentifier={resetTarget}
        onSuccess={() => {
          setMode('signin');
        }}
      />

      <LegalModals
        isOpen={legalType !== null}
        onClose={() => setLegalType(null)}
        type={legalType || 'privacy'}
      />

    </div>
  );
};
