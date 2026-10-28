import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Mail, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToReset: (target: string, otp?: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onProceedToReset
}) => {
  const { sendPasswordReset, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [sentResult, setSentResult] = useState<{ message: string; otp?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered email or phone number.');
      return;
    }

    const res = await sendPasswordReset(identifier.trim());
    if (res.success) {
      setSentResult({ message: res.message, otp: res.otp });
    } else {
      setErrorMsg(res.error || 'Failed to dispatch reset instructions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset Account Password</h3>
              <p className="text-[11px] text-slate-400">Receive OTP code or Magic Link</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sentResult ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification OTP Sent!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {sentResult.message}
              </p>
              {sentResult.otp && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-emerald-800/50 flex items-center justify-between">
                  <span className="text-slate-400">Your 6-Digit Reset OTP:</span>
                  <span className="font-mono text-base font-extrabold text-amber-300 tracking-widest">
                    {sentResult.otp}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToReset(identifier, sentResult.otp);
              }}
              className="w-full py-2.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#008751]/30 transition-all hover:scale-102"
            >
              <span>Proceed to Set New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Enter the email address or phone number linked to your NYSC profile. We'll send an OTP verification code immediately.
            </p>

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

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Sending...' : 'Send Reset OTP'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
