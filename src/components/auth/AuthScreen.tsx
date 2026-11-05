import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Clock,
  KeyRound,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  getLoginSecurityState,
  recordFailedLoginAttempt,
  resetLoginSecurityState,
  getLoginCooldownRemainingSeconds,
  LOGIN_RATE_LIMIT,
  LoginSecurityState
} from '../../lib/rateLimit';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, sendPasswordReset, isLoading, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Rate Limiting & Cooldown Security States
  const [securityState, setSecurityState] = useState<LoginSecurityState>(() => getLoginSecurityState());
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => getLoginCooldownRemainingSeconds());

  // Lockout Password Reset States
  const [lockoutEmail, setLockoutEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [lockoutResetSent, setLockoutResetSent] = useState(false);
  const [lockoutResetError, setLockoutResetError] = useState('');

  // Modals
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSetNewPassOpen, setIsSetNewPassOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  // Live ticking countdown for the 3-minute (180s) cooldown
  useEffect(() => {
    if (!securityState.cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getLoginCooldownRemainingSeconds();
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        const refreshed = getLoginSecurityState();
        setSecurityState(refreshed);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [securityState.cooldownUntil]);

  const isCooldownActive = cooldownSeconds > 0;
  const isPermanentlyLocked = securityState.isPermanentlyLocked || securityState.failedAttempts >= LOGIN_RATE_LIMIT.TOTAL_LOCKOUT_FAILURES;
  const isLoginFormBlocked = isCooldownActive || isPermanentlyLocked;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessBanner('');

    if (mode === 'signin') {
      // 1. Guard against permanently locked form
      if (isPermanentlyLocked) {
        setErrorMsg('The login form is locked due to 5 failed attempts. Please reset your password below.');
        return;
      }

      // 2. Guard against active cooldown block
      if (isCooldownActive) {
        setErrorMsg(`Login form cooldown active. Please wait ${cooldownSeconds}s before attempting to sign in.`);
        return;
      }

      const res = await signIn(identifier, password);
      if (!res.success) {
        // Record failed attempt
        const updated = recordFailedLoginAttempt();
        setSecurityState(updated);
        const remaining = getLoginCooldownRemainingSeconds();
        setCooldownSeconds(remaining);

        if (updated.failedAttempts === LOGIN_RATE_LIMIT.FIRST_COOLDOWN_FAILURES) {
          setErrorMsg(''); // 3-minute cooldown banner takes visual precedence
        } else if (updated.isPermanentlyLocked || updated.failedAttempts >= LOGIN_RATE_LIMIT.TOTAL_LOCKOUT_FAILURES) {
          setErrorMsg(''); // Permanent lockout banner takes visual precedence
          if (identifier.includes('@')) {
            setLockoutEmail(identifier.trim());
          }
        } else if (updated.failedAttempts === 4) {
          setErrorMsg('Incorrect password. 1 final attempt remaining before complete security lockout.');
        } else {
          const attemptsLeft = LOGIN_RATE_LIMIT.FIRST_COOLDOWN_FAILURES - updated.failedAttempts;
          setErrorMsg(
            res.error
              ? `${res.error} (${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left before 3-min cooldown)`
              : `Incorrect password. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left before 3-min cooldown.`
          );
        }
      } else {
        // Successful sign in: clear all failed attempt counters and security locks
        resetLoginSecurityState();
        setSecurityState(getLoginSecurityState());
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name as registered with NYSC.');
        return;
      }
      const res = await signUp(identifier, password, fullName.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account.');
      } else {
        resetLoginSecurityState();
        setSecurityState(getLoginSecurityState());
      }
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg('');
    setSuccessBanner('');
    if (isPermanentlyLocked) {
      setErrorMsg('Login form is currently locked. Please reset password or clear lockout to continue.');
      return;
    }
    if (isCooldownActive) {
      setErrorMsg(`Cooldown active (${formatTimer(cooldownSeconds)}). Please wait for cooldown to expire.`);
      return;
    }
    const res = await signIn('corper.adeleke@gmail.com', 'demo2026');
    if (res.success) {
      resetLoginSecurityState();
      setSecurityState(getLoginSecurityState());
    }
  };

  const handleProceedToReset = (target: string, otp?: string) => {
    setResetTarget(target);
    setResetOtp(otp || '');
    setIsSetNewPassOpen(true);
  };

  // Lockout Password Reset via Supabase Auth resetPasswordForEmail
  const handleLockoutPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockoutResetError('');
    const target = (lockoutEmail || identifier).trim();
    if (!target || !target.includes('@')) {
      setLockoutResetError('Please enter a valid registered email address.');
      return;
    }

    setIsSendingReset(true);
    const res = await sendPasswordReset(target);
    setIsSendingReset(false);

    if (res.success) {
      setLockoutResetSent(true);
      setResetTarget(target);
      setResetOtp(res.otp || '');
    } else {
      setLockoutResetError(res.error || 'Failed to dispatch password reset via Supabase Auth.');
    }
  };

  const handleSetNewPasswordSuccess = () => {
    // Password successfully updated! Unlock login form completely.
    resetLoginSecurityState();
    setSecurityState(getLoginSecurityState());
    setLockoutResetSent(false);
    setMode('signin');
    setSuccessBanner('Password updated successfully! You may now sign in with your new credentials.');
    setTimeout(() => setSuccessBanner(''), 7000);
  };

  const handleManualResetLockout = () => {
    resetLoginSecurityState();
    setSecurityState(getLoginSecurityState());
    setCooldownSeconds(0);
    setErrorMsg('');
    setSuccessBanner('Login rate limit and lockout state cleared for testing.');
    setTimeout(() => setSuccessBanner(''), 4000);
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
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          
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

          {/* Success Banner */}
          {successBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* =========================================================================
              SECURITY CONDITION 1: 3-MINUTE (180s) COOLDOWN TIMER BLOCK
             ========================================================================= */}
          {mode === 'signin' && isCooldownActive && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/70 border-2 border-amber-500/80 shadow-xl shadow-amber-950/50 space-y-3.5 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-amber-200 uppercase tracking-wide">
                      Security Alert: 3 Failed Attempts
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50">
                      Cooldown Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                    You have failed to enter the correct password 3 times consecutively. The login form is placed in a <strong>3-minute (180s) cooldown block</strong> to protect your account.
                  </p>
                </div>
              </div>

              {/* Countdown Clock Display */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Cooldown Timer:</span>
                </div>
                <div className="font-mono text-xl font-black tracking-widest text-amber-300 bg-amber-950/90 px-3.5 py-1 rounded-lg border border-amber-500/60 shadow-inner">
                  {formatTimer(cooldownSeconds)}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-300/90 pt-0.5">
                <span>After cooldown expires: 2 attempts remaining</span>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-amber-300 hover:text-white underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECURITY CONDITION 2: POST-COOLDOWN ATTEMPTS WARNING
             ========================================================================= */}
          {mode === 'signin' && !isCooldownActive && !isPermanentlyLocked && securityState.failedAttempts === 3 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Cooldown Expired: 2 Attempts Remaining</span>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  You may now retry your password. If you fail 2 more times (5 total attempts), the login form will be permanently locked.
                </p>
              </div>
            </div>
          )}

          {mode === 'signin' && !isCooldownActive && !isPermanentlyLocked && securityState.failedAttempts === 4 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border-2 border-rose-500/80 text-xs text-rose-200 flex items-start gap-2.5 shadow-lg animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="font-extrabold text-rose-300">Final Attempt Warning: 1 Attempt Left!</span>
                <p className="text-[11px] text-rose-200/90 mt-0.5">
                  4 failed attempts recorded. If your next password attempt fails, your login form will be locked and require a password reset via Supabase Auth.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECURITY CONDITION 3: PERMANENT LOCKOUT (5 TOTAL FAILED ATTEMPTS)
             ========================================================================= */}
          {mode === 'signin' && isPermanentlyLocked && (
            <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/85 border-2 border-rose-600 shadow-2xl shadow-rose-950/80 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40 shadow-inner">
                  <Lock className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide">
                      Login Form Locked: 5 Failed Attempts
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                      Locked
                    </span>
                  </div>
                  <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                    Maximum failed attempts exceeded (5 of 5). The login form has been locked to prevent brute-force attacks. You are required to reset your password using your registered email address via <strong>Supabase Auth (resetPasswordForEmail)</strong>.
                  </p>
                </div>
              </div>

              {lockoutResetSent ? (
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-emerald-200 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reset Link & Verification Code Dispatched!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Instructions to reset your password have been dispatched to <strong>{resetTarget}</strong> via Supabase Auth.
                  </p>
                  {resetOtp && (
                    <div className="p-2 rounded-lg bg-slate-950/90 border border-emerald-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Your 6-Digit OTP:</span>
                      <span className="font-mono text-base font-extrabold text-amber-300 tracking-widest">{resetOtp}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSetNewPassOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-102"
                  >
                    <span>Enter Code & Set New Password →</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLockoutPasswordReset} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-semibold text-xs mb-1">
                      Registered Email Address (Supabase Auth)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="e.g. corper.adeleke@gmail.com"
                        value={lockoutEmail || (identifier.includes('@') ? identifier : '')}
                        onChange={e => setLockoutEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-rose-500/50 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-rose-400 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {lockoutResetError && (
                    <div className="p-2 rounded-lg bg-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{lockoutResetError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isSendingReset ? 'Dispatching via Supabase Auth...' : 'Reset Password with Registered Email'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Standard error banner (if not suppressed by cooldown or lockout) */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =========================================================================
              LOGIN & SIGNUP FORM
             ========================================================================= */}
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
                  disabled={isLoginFormBlocked && mode === 'signin'}
                  onChange={e => setIdentifier(e.target.value)}
                  className={`w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#008751] transition-opacity ${
                    isLoginFormBlocked && mode === 'signin' ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <label className="text-slate-300 font-semibold">Password</label>
                  {mode === 'signin' && securityState.failedAttempts > 0 && !isPermanentlyLocked && (
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      ({securityState.failedAttempts < 3 ? `${securityState.failedAttempts}/3 attempts` : `${securityState.failedAttempts}/5 attempts`})
                    </span>
                  )}
                </div>
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
                  placeholder={isPermanentlyLocked ? 'Form locked — reset password' : 'Enter account password'}
                  value={password}
                  disabled={isLoginFormBlocked && mode === 'signin'}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-white focus:outline-none focus:border-[#008751] transition-opacity ${
                    isLoginFormBlocked && mode === 'signin' ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  disabled={isLoginFormBlocked && mode === 'signin'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (isLoginFormBlocked && mode === 'signin')}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isPermanentlyLocked && mode === 'signin'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/80 cursor-not-allowed'
                  : isCooldownActive && mode === 'signin'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/80 cursor-not-allowed'
                  : 'bg-[#008751] hover:bg-[#005a36] text-white shadow-lg shadow-[#008751]/30 hover:scale-102 active:scale-95 disabled:opacity-50'
              }`}
            >
              {isPermanentlyLocked && mode === 'signin' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Login Locked — Reset Password Required</span>
                </>
              ) : isCooldownActive && mode === 'signin' ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Cooldown Block Active ({formatTimer(cooldownSeconds)})</span>
                </>
              ) : (
                <>
                  <span>{isLoading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Dashboard' : 'Continue to Quick Setup'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Bypass Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleDemoSignIn}
              type="button"
              disabled={isLoginFormBlocked}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
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

          {/* Test / Reset Security State helper (discreet) */}
          {(securityState.failedAttempts > 0 || isLoginFormBlocked) && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleManualResetLockout}
                className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                title="Reset security attempts for testing purposes"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Rate Limit State (Test Mode)</span>
              </button>
            </div>
          )}

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
        onSuccess={handleSetNewPasswordSuccess}
      />

      <LegalModals
        isOpen={legalType !== null}
        onClose={() => setLegalType(null)}
        type={legalType || 'privacy'}
      />

    </div>
  );
};

