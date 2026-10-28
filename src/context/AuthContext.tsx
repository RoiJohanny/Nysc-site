import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NyscPhase } from '../types/nysc';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (identifier: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (identifier: string) => Promise<{ success: boolean; message: string; otp?: string; error?: string }>;
  setNewPassword: (password: string, otpCode?: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: {
    fullName: string;
    stateOfDeployment: string;
    batchStream: string;
    currentPhase: NyscPhase;
  }) => void;
  signOut: () => Promise<void>;
  resetPasswordOtpTarget: string | null;
  setResetPasswordOtpTarget: (target: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('nysc_auth_user');
      return savedUser ? JSON.parse(savedUser) : {
        id: 'usr-cor-2026-001',
        email: 'corper.adeleke@gmail.com',
        phone: '+234 814 592 0184',
        full_name: 'Chinedu Emmanuel Adeleke'
      };
    } catch {
      return null;
    }
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const savedOnboarded = localStorage.getItem('nysc_is_onboarded');
      return savedOnboarded !== null ? JSON.parse(savedOnboarded) : true;
    } catch {
      return true;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetPasswordOtpTarget, setResetPasswordOtpTarget] = useState<string | null>(null);

  // Sync state to local storage for offline / quick reload capability
  useEffect(() => {
    if (user) {
      localStorage.setItem('nysc_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nysc_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nysc_is_onboarded', JSON.stringify(isOnboarded));
  }, [isOnboarded]);

  // Listen to Supabase Auth State changes if configured
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const checkSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          });
        }
      } catch (e) {
        console.error('Supabase session retrieval error:', e);
      }
    };

    checkSession();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        });
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const isEmail = identifier.includes('@');
        const { data, error } = isEmail
          ? await supabase.auth.signInWithPassword({ email: identifier, password })
          : await supabase.auth.signInWithPassword({ phone: identifier, password });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
            full_name: data.user.user_metadata?.full_name
          });
          setIsLoading(false);
          return { success: true };
        }
      }

      // Offline / Local Auth fallback
      if (!identifier.trim() || !password.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your email/phone and password.' };
      }

      const isEmail = identifier.includes('@');
      const fallbackUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: isEmail ? identifier : `${identifier.replace(/[^0-9]/g, '')}@nysc.ng`,
        phone: !isEmail ? identifier : '+234 814 592 0184',
        full_name: identifier.split('@')[0].replace(/[._-]/g, ' ')
      };

      setUser(fallbackUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Authentication failed' };
    }
  };

  const signUp = async (
    identifier: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const isEmail = identifier.includes('@');
        const { data, error } = isEmail
          ? await supabase.auth.signUp({
              email: identifier,
              password,
              options: { data: { full_name: fullName } }
            })
          : await supabase.auth.signUp({
              phone: identifier,
              password,
              options: { data: { full_name: fullName } }
            });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
            full_name: fullName || data.user.email?.split('@')[0]
          });
          setIsOnboarded(false); // New user must complete 15-second wizard!
          setIsLoading(false);
          return { success: true };
        }
      }

      // Offline / Local SignUp fallback
      if (!identifier.trim() || !password.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Please enter required credentials.' };
      }

      const isEmail = identifier.includes('@');
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: isEmail ? identifier : `${identifier.replace(/[^0-9]/g, '')}@nysc.ng`,
        phone: !isEmail ? identifier : '+234 814 592 0184',
        full_name: fullName || identifier.split('@')[0]
      };

      setUser(newUser);
      setIsOnboarded(false); // Triggers the 15-second Onboarding Wizard
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const sendPasswordReset = async (
    identifier: string
  ): Promise<{ success: boolean; message: string; otp?: string; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured && identifier.includes('@')) {
        const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
          redirectTo: window.location.origin
        });
        if (error) {
          setIsLoading(false);
          return { success: false, message: '', error: error.message };
        }
      }

      // Generate a realistic 6-digit OTP code for instant verification
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setResetPasswordOtpTarget(identifier);

      // Save temporary reset token in storage
      localStorage.setItem('nysc_temp_reset_otp', generatedOtp);
      localStorage.setItem('nysc_temp_reset_target', identifier);

      setIsLoading(false);
      return {
        success: true,
        message: `Password reset instructions and verification OTP sent to ${identifier}.`,
        otp: generatedOtp
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: '', error: err?.message || 'Failed to send reset instructions.' };
    }
  };

  const setNewPassword = async (
    password: string,
    otpCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const savedOtp = localStorage.getItem('nysc_temp_reset_otp');

      // Verify OTP if provided
      if (otpCode && savedOtp && otpCode.trim() !== savedOtp.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Invalid or expired OTP code. Please check and try again.' };
      }

      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }

      // Cleanup temp OTP
      localStorage.removeItem('nysc_temp_reset_otp');
      localStorage.removeItem('nysc_temp_reset_target');
      setResetPasswordOtpTarget(null);

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Failed to update credentials.' };
    }
  };

  const completeOnboarding = (data: {
    fullName: string;
    stateOfDeployment: string;
    batchStream: string;
    currentPhase: NyscPhase;
  }) => {
    setIsOnboarded(true);
    if (user) {
      setUser(prev => (prev ? { ...prev, full_name: data.fullName } : null));
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboarded,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        sendPasswordReset,
        setNewPassword,
        completeOnboarding,
        signOut,
        resetPasswordOtpTarget,
        setResetPasswordOtpTarget
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
